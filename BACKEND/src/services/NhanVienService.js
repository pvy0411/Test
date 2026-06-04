const NhanVienRepo = require('../repositories/NhanVienRepo');

class NhanVienService {
    async GetAll() {
        return await NhanVienRepo.GetAll();
    }

    async GetProfileById(MaNV) {
        return await NhanVienRepo.GetProfileById(MaNV);
    }

    async Create(data) {
        const isExist = await NhanVienRepo.CheckUsernameExist(data.TenDangNhap);
        if (isExist) throw { status: 409, message: 'Tên đăng nhập này đã có người sử dụng!' };
        
        return await NhanVienRepo.Create(data);
    }

    async Update(MaNV, data) {
        const check = await NhanVienRepo.GetById(MaNV);
        if (!check) throw { status: 404, message: 'Không tìm thấy nhân viên!' };
        
        await NhanVienRepo.Update(MaNV, data);
        return { message: 'Cập nhật thành công!' };
    }

    async Delete(MaNV) {
        const check = await NhanVienRepo.GetById(MaNV);
        if (!check) throw { status: 404, message: 'Không tìm thấy nhân viên!' };

        const daKhamBenh = await NhanVienRepo.CheckCoPhieuKham(MaNV);
        if (daKhamBenh) {
            throw { status: 400, message: 'Nhân viên này đã từng lập phiếu khám, không thể xóa để giữ lịch sử!' };
        }

        await NhanVienRepo.Remove(MaNV);
        return { message: 'Đã xóa nhân viên và tài khoản!' };
    }
}
module.exports = new NhanVienService();