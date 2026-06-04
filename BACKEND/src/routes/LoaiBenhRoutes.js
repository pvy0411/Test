const express = require('express');
const router = express.Router();
const LoaiBenhController = require('../controllers/LoaiBenhController');
const { XacThuc, PhanQuyen } = require('../middlewares/AuthMiddleware');

router.get(
    '/', 
    XacThuc, 
    LoaiBenhController.GetAll
);

router.post(
    '/', 
    XacThuc, 
    PhanQuyen('Admin'), 
    LoaiBenhController.Create
);

router.put(
    '/:id', 
    XacThuc, 
    PhanQuyen('Admin'), 
    LoaiBenhController.Update
);
router.delete(
    '/:id', 
    XacThuc, 
    PhanQuyen('Admin'), 
    LoaiBenhController.Delete
);

module.exports = router;