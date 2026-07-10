import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    theme: 'dark',
    fontSize: 'medium',
    layout: 'comfortable',
    currency: 'KES',
    timezone: 'Africa/Nairobi',
    notificationPreferences: {
      income: true, expense: true, damage: true,
      vehicle: true, reports: true, system: true
    }
  })
  const [loading, setLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/account/settings')
      setSettings(res.data)
      // Apply theme immediately
      applyTheme(res.data.theme)
      applyFontSize(res.data.fontSize)
      applyLayout(res.data.layout)
    } catch {} finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchSettings() }, [fetchSettings])

  const updateSettings = async (newSettings) => {
    try {
      const res = await api.put('/account/settings', newSettings)
      setSettings(res.data)
      if (newSettings.theme) applyTheme(newSettings.theme)
      if (newSettings.fontSize) applyFontSize(newSettings.fontSize)
      if (newSettings.layout) applyLayout(newSettings.layout)
      return true
    } catch {
      return false
    }
  }

  const applyTheme = (theme) => {
    const root = document.documentElement
    root.classList.remove('theme-dark', 'theme-light')
    if (theme === 'light') root.classList.add('theme-light')
    else root.classList.add('theme-dark')
  }

  const applyFontSize = (size) => {
    const root = document.documentElement
    root.classList.remove('font-small', 'font-medium', 'font-large')
    root.classList.add(`font-${size}`)
  }

  const applyLayout = (layout) => {
    const root = document.documentElement
    root.classList.remove('layout-comfortable', 'layout-compact')
    root.classList.add(`layout-${layout}`)
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}