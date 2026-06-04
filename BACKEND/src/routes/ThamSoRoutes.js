const express = require('express');
const router = express.Router();
const ThamSoController = require('../controllers/ThamSoController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

router.get(
    '/', 
    XacThuc, 
    ThamSoController.GetAll
);

router.get(
    '/:name', 
    XacThuc, 
    ThamSoController.GetByName
);
router.put(
    '/:name', 
    XacThuc, 
    PhanQuyen('Admin'), 
    ThamSoController.Update
);

module.exports = router;
