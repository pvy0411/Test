// File: ThamSoService.js (ĐÃ SỬA)
const ThamSoRepo = require('../repositories/ThamSoRepo');

class ThamSoService {
    async GetAllThamSo() {
        return await ThamSoRepo.GetAll();
    }

    async GetThamSoByName(TenThamSo) {
        return await ThamSoRepo.GetByName(TenThamSo);
    }

    async UpdateThamSo(name, value) {
        const existing = await ThamSoRepo.GetByName(name);
        if (existing === undefined) {
            throw { status: 404, message: `Không tìm thấy tham số '${name}' trong hệ thống!` };
        }

        if (value < 0) {
            throw { status: 400, message: 'Giá trị tham số không hợp lệ (phải lớn hơn hoặc bằng 0)!' };
        }

        await ThamSoRepo.Update(name, value);
        return { message: `Cập nhật tham số ${name} thành ${value} thành công!` };
    }
}

module.exports = new ThamSoService();