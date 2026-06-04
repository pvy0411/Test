const ThamSoService = require('../services/ThamSoService');

class ThamSoController {
    async GetAll(req, res) {
        try {
            const thamSo = await ThamSoService.GetAllThamSo();
            res.status(200).json({ status: 'success', data: thamSo });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async GetByName(req, res) {
        try {
            const { name } = req.params;
            const thamSo = await ThamSoService.GetThamSoByName(name);
            res.status(200).json({ status: 'success', data: thamSo });
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message });
        }
    }

    async Update(req, res) {
        try {
            const name = req.params.name;
            const { GiaTri } = req.body; 

            if (GiaTri === undefined) {
                return res.status(400).json({ status: 'error', message: 'Vui lòng cung cấp GiaTri mới!' });
            }

            const result = await ThamSoService.UpdateThamSo(name, GiaTri);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            const statusCode = error.status || 500;
            res.status(statusCode).json({ status: 'error', message: error.message });
        }
    }
}

module.exports = new ThamSoController();