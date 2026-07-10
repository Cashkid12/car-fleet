const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

router.get('/profile', accountController.getProfile);
router.put('/profile', accountController.updateProfile);
router.put('/business', accountController.updateBusiness);
router.get('/settings', accountController.getSettings);
router.put('/settings', accountController.updateSettings);
router.put('/password', accountController.changePassword);
router.delete('/data', accountController.deleteData);
router.get('/export', accountController.exportData);

module.exports = router;