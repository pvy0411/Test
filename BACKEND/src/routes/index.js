const express = require('express');
const router = express.Router();


router.get('/health-check', (req, res) => {
    res.status(200).json({ status: 'success', message: 'Hệ thống Quản lý Phòng mạch tư đang hoạt động tốt!' });
});

module.exports = router;