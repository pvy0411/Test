const LoaiBenhRepo = require('../repositories/LoaiBenhRepo');

class LoaiBenhService {
    async GetAll() {
        return await LoaiBenhRepo.GetAll();
    }

    async Create(tenBenh) {
        if (!tenBenh) throw { status: 400, message: 'Vui lòng cung cấp tên loại bệnh!' };
        return await LoaiBenhRepo.Create(tenBenh);
    }

    async Update(maLoaiBenh, tenBenh) {
        if (!tenBenh) throw { status: 400, message: 'Vui lòng cung cấp tên loại bệnh mới!' };
        await LoaiBenhRepo.Update(maLoaiBenh, tenBenh);
        return { message: 'Cập nhật thành công!' };
    }

    async Delete(maLoaiBenh) {
        const daSuDung = await LoaiBenhRepo.CheckDaSuDung(maLoaiBenh);
        if (daSuDung) {
            throw { status: 400, message: 'Loại bệnh này đã có trong hồ sơ bệnh án, không thể xóa!' };
        }
        await LoaiBenhRepo.Delete(maLoaiBenh);
        return { message: 'Đã xóa loại bệnh!' };
    }
}
module.exports = new LoaiBenhService();