const express = require('express');
const router = express.Router();
const CachDungController = require('../controllers/CachDungController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

// Bác sĩ, Lễ tân được xem danh sách (cần khi kê đơn)
router.get(
    '/',
    XacThuc, 
    PhanQuyen('BacSi', 'LeTan'), 
    CachDungController.GetAll
);

router.get(
    '/:id', 
    XacThuc, 
    PhanQuyen('BacSi', 'LeTan'), 
    CachDungController.GetById
);

// Chỉ Lễ tân được thêm / sửa / xóa cách dùng 
router.post(
    '/', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    CachDungController.Create
);

router.put(
    '/:id', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    CachDungController.Update
);

router.delete(
    '/:id', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    CachDungController.Delete
);

module.exports = router;