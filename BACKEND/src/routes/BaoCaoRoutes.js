const express = require('express');
const router = express.Router();
const BaoCaoController = require('../controllers/BaoCaoController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

// authorizeRoles('LeTan', 'Admin') => Chỉ Lễ tân hoặc Admin mới được phép vào controller doanh thu và thuốc
router.get(
    '/doanh-thu/ngay', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    BaoCaoController.GetDoanhThuTheoNgay
);

router.get(
    '/doanh-thu/nam', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    BaoCaoController.GetDoanhThuTheoNam
);

router.get(
    '/doanh-thu/thang-nam', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    BaoCaoController.GetBaoCaoDoanhThu
);

router.get(
    '/su-dung-thuoc', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    BaoCaoController.GetSuDungThuoc
);

router.get(
    '/nhap-thuoc', 
    XacThuc, 
    PhanQuyen('LeTan'), 
    BaoCaoController.GetNhapThuoc
);

module.exports = router;