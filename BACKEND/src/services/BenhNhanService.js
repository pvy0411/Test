const BenhNhanRepo = require('../repositories/BenhNhanRepo');
const PhieuKhamService = require('./PhieuKhamService');


function normalizeName(name) {
    return name
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        )
        .join(' ');
}

class BenhNhanService {
    async GetAll() {
        return await BenhNhanRepo.GetAll();
    }

    async GetAllWithLastExam() {
        const rows = await BenhNhanRepo.GetAllWithLastExam();
        return rows.map(r => ({
            MaBN: r.MaBN,
            TenBN: r.TenBN,
            NgaySinh: r.NgaySinh ? (new Date(r.NgaySinh)).toISOString().split('T')[0] : null,
            GioiTinh: r.GioiTinh,
            NgayTiepNhan: r.NgayTiepNhan ? (new Date(r.NgayTiepNhan)).toISOString().split('T')[0] : null
        }));
    }

    // MaNV: lấy từ token (req.user.maNV) truyền vào từ Controller
    async Create(data, MaNV) {
        // Validate các trường bắt buộc
        if (!data.TenBN || !data.CCCD || !data.GioiTinh || !data.SDT) {
            throw { status: 400, message: 'Vui lòng cung cấp đầy đủ: Họ tên, CCCD, Giới tính, Số điện thoại!' };
        }
        // Chuẩn hóa tên bệnh nhân
        data.TenBN = normalizeName(data.TenBN);
        // Kiểm tra CCCD đã tồn tại chưa
        const isExisted = await BenhNhanRepo.CheckExists(data.CCCD);
        if (isExisted) {
            throw { status: 409, message: 'Bệnh nhân với CCCD này đã tồn tại!' };
        }
        // Email không bắt buộc — nếu trống thì truyền null (Repo đã xử lý)
        const maBN = await BenhNhanRepo.Create(data);

        // Tự động tạo phiếu khám ngay sau khi lập hồ sơ
        const phieuKham = await PhieuKhamService.CreatePhieuKham(MaNV || null, maBN);

        return { maBN, maPK: phieuKham.MaPK, soThuTu: phieuKham.SoThuTu, TenBN: data.TenBN};
    }

    async Update(MaBN, dataUpdate) {
        const check = await BenhNhanRepo.GetById(MaBN);
        if (!check) throw { status: 404, message: 'Không tìm thấy bệnh nhân!' };
        
        if (dataUpdate.TenBN) {
            dataUpdate.TenBN = normalizeName(dataUpdate.TenBN);
        }

        await BenhNhanRepo.Update(MaBN, dataUpdate);
        return { message: 'Cập nhật thành công' };
    }

    async GetProfileAndHistoryByCCCD(cccd, years = 5) {
        const bn = await BenhNhanRepo.GetByCCCD(cccd);
        if (!bn) throw { status: 404, message: 'Không tìm thấy bệnh nhân với CCCD đã cho' };

        const history = await PhieuKhamService.GetHistoryByPatient(bn.MaBN, years);

        return {
            profile: {
                MaBN: bn.MaBN,
                TenBN: bn.TenBN,
                NgaySinh: bn.NgaySinh ? (new Date(bn.NgaySinh)).toISOString().split('T')[0] : null,
                GioiTinh: bn.GioiTinh,
                CCCD: bn.CCCD,
                SDT: bn.SDT,
                DiaChi: bn.DiaChi
            },
            history
        };
    }

    async UpdateByCCCD(cccd, dataUpdate) {
        const bn = await BenhNhanRepo.GetByCCCD(cccd);
        if (!bn) throw { status: 404, message: 'Không tìm thấy bệnh nhân với CCCD đã cho' };
        if (dataUpdate.TenBN) {
            dataUpdate.TenBN = normalizeName(dataUpdate.TenBN);
        }
        await BenhNhanRepo.Update(bn.MaBN, dataUpdate);
        return { message: 'Cập nhật thành công' };
    }

    async Delete(MaBN) {
        const check = await BenhNhanRepo.GetById(MaBN);
        if (!check) throw { status: 404, message: 'Không tìm thấy bệnh nhân!' };
        // Xóa kèm các phiếu khám liên quan
        await BenhNhanRepo.RemoveCascade(MaBN);
        return { message: 'Đã xóa bệnh nhân và các phiếu khám liên quan' };
    }
}

module.exports = new BenhNhanService();