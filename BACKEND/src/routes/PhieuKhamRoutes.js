const express = require('express');
const router = express.Router();
const PhieuKhamController = require('../controllers/PhieuKhamController');
const {XacThuc, PhanQuyen} = require('../middlewares/AuthMiddleware');

router.get(
    '/',
    XacThuc,
    PhieuKhamController.GetAll
);

// Full detail: phiếu khám + bệnh nhân + hóa đơn + đơn thuốc
router.get(
    '/:maPK/full-detail',
    XacThuc,
    PhieuKhamController.GetFullDetail
);

router.post(
    '/', 
    XacThuc, 
    PhanQuyen('BacSi'), 
    PhieuKhamController.Create
);

// Tạo phiếu khám cho bệnh nhân đã có (roles: LeTan, BacSi, Admin)
router.post(
    '/create-for-patient',
    XacThuc,
    PhanQuyen('LeTan', 'BacSi', 'Admin'),
    PhieuKhamController.CreateForPatient
);

router.get(
    '/history/:maBN',
    XacThuc,
    PhieuKhamController.GetHistoryByPatient
);

router.get(
    '/:maPK/details',
    XacThuc,
    PhieuKhamController.GetDiseasesByMaPK
);

router.get(
    '/:maPK/prescriptions',
    XacThuc,
    PhieuKhamController.GetPrescriptionsByMaPK
);

router.delete(
    '/:maPK/prescriptions/:maThuoc',
    XacThuc,
    PhanQuyen('LeTan', 'BacSi', 'Admin'),
    PhieuKhamController.DeletePrescription
);

module.exports = router;