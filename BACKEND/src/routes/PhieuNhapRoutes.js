const express = require('express');
const router = express.Router();
const PhieuNhapController = require('../controllers/PhieuNhapController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

// Cấp quyền cho Admin và Lễ Tân được phép xem và tạo phiếu nhập thuốc
router.get(
    '/',    
    XacThuc, 
    PhanQuyen('LeTan'), 
    PhieuNhapController.GetAll
);

router.get(
    '/:id', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    PhieuNhapController.GetById
);

router.post(
    '/',   
    XacThuc, 
    PhanQuyen('LeTan'), 
    PhieuNhapController.Create
);

router.put(
    '/:id',
    XacThuc,
    PhanQuyen('Admin'),
    PhieuNhapController.Update
);

router.delete(
    '/:id',
    XacThuc, 
    PhanQuyen('Admin'), 
    PhieuNhapController.Remove
);

module.exports = router;