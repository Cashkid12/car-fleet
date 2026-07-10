const express = require('express');
const router = express.Router();
const syncController = require('../controllers/syncController');

router.post('/', syncController.syncData);
router.get('/status', syncController.getSyncStatus);

module.exports = router;