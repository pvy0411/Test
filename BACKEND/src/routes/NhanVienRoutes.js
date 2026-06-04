const express = require('express');
const router = express.Router();
const NhanVienController = require('../controllers/NhanVienController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

router.get(
    '/me',
    XacThuc,
    NhanVienController.GetMe
);

router.get(
    '/', 
    XacThuc, 
    PhanQuyen('Admin'), 
    NhanVienController.GetAll
);

router.post(
    '/', 
    XacThuc, 
    PhanQuyen('Admin'), 
    NhanVienController.Create
);

router.put(
    '/:id', 
    XacThuc, 
    PhanQuyen('Admin'), 
    NhanVienController.Update
);

router.delete(
    '/:id', 
    XacThuc, 
    PhanQuyen('Admin'), 
    NhanVienController.Delete
);

module.exports = router;
