const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(protect, roleCheck('admin'));

router.get('/overview', adminController.getOverview);
router.get('/users', adminController.getUsers);
router.put('/users/:id/ban', adminController.banUser);
router.put('/users/:id/unban', adminController.unbanUser);
router.put('/users/:id/verify-creator', adminController.verifyCreator);
router.get('/series', adminController.getAllSeries);
router.put('/series/:id/feature', adminController.featureSeries);
router.get('/reports', adminController.getReports);
router.put('/reports/:id', adminController.resolveReport);
router.get('/earnings', adminController.getAllEarnings);
router.post('/earnings/:id/pay', adminController.markEarningPaid);
router.get('/revenue', adminController.getRevenueAnalytics);

module.exports = router;
