const express = require('express');
const router = express.Router();
const DonThuocController = require('../controllers/DonThuocController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

// Phân quyền cho phép bác sĩ kê đơn thuốc
router.post(
    '/', 
    XacThuc, 
    PhanQuyen('BacSi'), 
    DonThuocController.KeDon
);

module.exports = router;