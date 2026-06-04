const express = require('express');
const router = express.Router();
const DVTController = require('../controllers/DVTController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

// Bác sĩ, Lễ tân được xem danh sách (cần khi kê đơn)
router.get(
    '/',
    XacThuc, 
    PhanQuyen('BacSi', 'LeTan'), 
    DVTController.GetAll
);

router.get(
    '/:id', 
    XacThuc, 
    PhanQuyen('BacSi', 'LeTan'), 
    DVTController.GetById
);

// Chỉ Lễ tân được thêm, sửa, xóa cách dùng 
router.post(
    '/', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    DVTController.Create
);

router.put(
    '/:id', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    DVTController.Update
);

router.delete(
    '/:id', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    DVTController.Delete
);

module.exports = router;