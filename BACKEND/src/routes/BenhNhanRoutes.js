const express = require('express');
const router = express.Router();
const BenhNhanController = require('../controllers/BenhNhanController');
const {XacThuc, PhanQuyen} = require('../middlewares/AuthMiddleware');

router.get(
    '/', 
    XacThuc, 
    BenhNhanController.GetAll
);

router.get(
    '/full',
    XacThuc,
    BenhNhanController.GetAllWithLastExam
);

router.post(
    '/', 
    XacThuc, 
    BenhNhanController.Create
);

router.put(
    '/:id', 
    XacThuc, 
    PhanQuyen('LeTan', 'Lễ tân'), 
    BenhNhanController.Update
);

router.delete(
    '/:id', 
    XacThuc, 
    BenhNhanController.Delete
);

router.get(
    '/by-cccd/:cccd',
    XacThuc,
    BenhNhanController.GetProfileAndHistoryByCCCD
);

router.put(
    '/by-cccd/:cccd',
    XacThuc,
    PhanQuyen('LeTan', 'Lễ tân'),
    BenhNhanController.UpdateByCCCD
);

module.exports = router;