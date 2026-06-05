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
        const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        // Bắt đầu chuỗi giao dịch liên hoàn
        await transaction.begin();

        // Thêm bệnh nhân thông qua transaction
        // Cần chỉnh sửa một chút trong Repo hoặc xử lý request trực tiếp tại đây để ăn theo transaction:
        const requestBN = new sql.Request(transaction);
        const emailValue = (data.Email && data.Email.trim() !== '') ? data.Email.trim() : null;
        const diaChiValue = (data.DiaChi && data.DiaChi.trim() !== '') ? data.DiaChi.trim() : null;

        const bnResult = await requestBN
            .input('TenBN', sql.NVarChar, data.TenBN)
            .input('CCCD', sql.VarChar, data.CCCD)
            .input('GioiTinh', sql.NVarChar, data.GioiTinh)
            .input('NgaySinh', sql.Date, data.NgaySinh || null)
            .input('DiaChi', sql.NVarChar, diaChiValue)
            .input('SDT', sql.VarChar, data.SDT)
            .input('Email', sql.VarChar, emailValue)
            .query(`
                INSERT INTO BENHNHAN (TenBN, CCCD, GioiTinh, NgaySinh, DiaChi, SDT, Email)
                OUTPUT INSERTED.MaBN 
                VALUES (@TenBN, @CCCD, @GioiTinh, @NgaySinh, @DiaChi, @SDT, @Email)
            `);

        const maBN = bnResult.recordset[0].MaBN;

        // Gọi dịch vụ tạo phiếu khám (Bạn cần đảm bảo hàm CreatePhieuKham của bạn hỗ trợ nhận transaction 
        // hoặc viết gộp câu lệnh insert phiếu khám vào đây chạy chung request)
        const requestPK = new sql.Request(transaction);
        const pkResult = await requestPK
            .input('MaNV', sql.Int, MaNV || null)
            .input('MaBN', sql.Int, maBN)
                .query(`
                I   NSERT INTO PHIEUKHAM (MaNV, MaBN, NgayKham, SoThuTu)
                    OUTPUT INSERTED.MaPK, INSERTED.SoThuTu
                    VALUES (@MaNV, @MaBN, CONVERT(date, GETDATE()), 
                        ISNULL((SELECT MAX(SoThuTu) FROM PHIEUKHAM WHERE NgayKham = CONVERT(date, GETDATE())), 0) + 1)
                `);

        const phieuKham = pkResult.recordset[0];

            // Nếu tất cả các lệnh trên chạy thành công không lỗi gì -> Lưu chính thức vào database
        await transaction.commit();

        return { maBN, maPK: phieuKham.MaPK, soThuTu: phieuKham.SoThuTu, TenBN: data.TenBN };

    } catch (error) {
            // Nếu có bất kỳ lỗi nào xảy ra (Ví dụ: Lỗi CHECK constraint ngày khám), 
            // Hệ thống lập tức "quay xe", xóa bỏ bản ghi bệnh nhân vừa chèn ở bước trước.
            await transaction.rollback();
            throw error; // Ném lỗi ra ngoài để controller trả về status code cho frontend
    }
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