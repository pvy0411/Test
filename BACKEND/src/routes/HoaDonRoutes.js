const express = require('express');
const router = express.Router();
const HoaDonController = require('../controllers/HoaDonController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

router.get(
    '/',
    XacThuc,
    PhanQuyen('BacSi', 'LeTan'),
    HoaDonController.GetAll
);

router.get('/:id',
    XacThuc,
    PhanQuyen('BacSi', 'LeTan'),
    HoaDonController.GetById
);

// Cấp quyền cho lễ tân và admin mới được phép lập và xóa hóa đơn
router.post(
    '/thanh-toan', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    HoaDonController.CreateHoaDon
);

router.delete(
    '/:id',
    XacThuc,
    PhanQuyen('Admin'),
    HoaDonController.DeleteHoaDon
);

module.exports = router;