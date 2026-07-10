import api from '../services/api';
import db from './localDB';

class OfflineSync {
  constructor() {
    this.isOnline = navigator.onLine;
    this.isSyncing = false;
    this.listeners = [];

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      this.syncPending();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => { this.listeners = this.listeners.filter(l => l !== listener); };
  }

  notifyListeners(event, data = {}) {
    this.listeners.forEach(l => l(event, data));
  }

  async addToQueue(operation) {
    await db.syncQueue.add({
      ...operation,
      status: 'pending',
      createdAt: new Date().toISOString(),
      retryCount: 0
    });
    this.notifyListeners('queued', operation);
  }

  async syncPending() {
    if (this.isSyncing || !this.isOnline) return;
    this.isSyncing = true;
    this.notifyListeners('syncing');

    try {
      const pending = await db.syncQueue.where('status').equals('pending').toArray();
      if (pending.length === 0) {
        this.isSyncing = false;
        this.notifyListeners('sync_complete', { count: 0 });
        return;
      }

      const operations = pending.map(op => ({
        type: op.type,
        carId: op.carId,
        payload: op.payload,
        clientId: op.clientId
      }));

      const res = await api.post('/sync', {
        operations,
        clientId: 'web-client',
        deviceId: navigator.userAgent
      });

      // Mark synced items as complete
      for (const result of res.data.results.synced) {
        const queueItem = pending.find(p => p.payload.referenceNumber === result.payload?.referenceNumber);
        if (queueItem) {
          await db.syncQueue.update(queueItem.id, { status: 'synced' });
        }
      }

      // Mark failed items
      for (const result of res.data.results.failed) {
        const queueItem = pending.find(p => p.payload.referenceNumber === result.payload?.referenceNumber);
        if (queueItem) {
          const newRetry = (queueItem.retryCount || 0) + 1;
          if (newRetry >= 5) {
            await db.syncQueue.update(queueItem.id, { status: 'failed', retryCount: newRetry });
          } else {
            await db.syncQueue.update(queueItem.id, { retryCount: newRetry });
          }
        }
      }

      // Clean up synced items
      await db.syncQueue.where('status').equals('synced').delete();

      // Update local cache with fresh server data
      if (res.data.updatedData) {
        await this.updateLocalCache(res.data.updatedData);
      }

      this.notifyListeners('sync_complete', { count: res.data.results.synced.length });
    } catch (error) {
      this.notifyListeners('sync_error', { error: error.message });
    } finally {
      this.isSyncing = false;
    }
  }

  async updateLocalCache(data) {
    try {
      if (data.cars) {
        await db.cars.clear();
        await db.cars.bulkPut(data.cars);
      }
      if (data.settings) {
        await db.settings.put(data.settings);
      }
    } catch (e) {
      console.warn('Cache update failed:', e);
    }
  }

  async getPendingCount() {
    return await db.syncQueue.where('status').equals('pending').count();
  }

  async getLastSyncTime() {
    const lastSync = localStorage.getItem('lastSyncTime');
    return lastSync || null;
  }

  setLastSyncTime() {
    localStorage.setItem('lastSyncTime', new Date().toISOString());
  }
}

const offlineSync = new OfflineSync();
export default offlineSync;