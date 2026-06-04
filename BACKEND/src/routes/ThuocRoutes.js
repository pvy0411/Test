const express = require('express');
const router = express.Router();
const ThuocController = require('../controllers/ThuocController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

// Phân quyền admin, bác sĩ, lễ tân được phép xem danh sách thuốc
// Hỗ trợ cả biến thể 'LeTan' và 'Lễ tân' để tránh lỗi phân quyền do khác nhau khi ghi trong DB
router.get(
    '/search',
    XacThuc,
    PhanQuyen('BacSi', 'LeTan', 'Lễ tân'),
    ThuocController.SearchThuoc
);

router.get(
    '/', 
    XacThuc, 
    PhanQuyen('BacSi', 'LeTan', 'Lễ tân'), 
    ThuocController.GetAllThuoc
);

router.get(
    '/:id', 
    XacThuc, 
    PhanQuyen('BacSi', 'LeTan', 'Lễ tân'),  
    ThuocController.GetThuocById
);

router.post(
    '/',
    XacThuc, 
    PhanQuyen('LeTan', 'Lễ tân'), 
    ThuocController.CreateThuoc
);

router.put(
    '/:id',
    XacThuc, PhanQuyen('LeTan', 'Lễ tân'), 
    ThuocController.UpdateThuoc
);

router.delete(
    '/:id', 
    XacThuc, 
    PhanQuyen('LeTan', 'Lễ tân'), 
    ThuocController.DeleteThuoc
);

module.exports = router;