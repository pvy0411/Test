const BenhNhanRepo = require('../repositories/BenhNhanRepo');
const PhieuKhamService = require('./PhieuKhamService');
const ThamSoRepo = require('../repositories/ThamSoRepo');
const PhieuKhamRepo = require('../repositories/PhieuKhamRepo');
const { poolPromise } = require('../config/database');
const sql = require('mssql');


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
    data.DiaChi = normalizeName(data.DiaChi);

    // Kiểm tra CCCD đã tồn tại chưa
    const isExisted = await BenhNhanRepo.CheckExists(data.CCCD);
    if (isExisted) {
        throw { status: 409, message: 'Bệnh nhân với CCCD này đã tồn tại!' };
    }

    // ── KIỂM TRA GIỚI HẠN SỐ BỆNH NHÂN TRONG NGÀY ──
    const today = new Date().toISOString().split('T')[0];
    const DEFAULT_MAX = 40;
    let maxBenhNhan;
    try {
        const raw = await ThamSoRepo.GetByName('SoBenhNhanToiDa');
        maxBenhNhan = (raw && !isNaN(Number(raw))) ? Number(raw) : DEFAULT_MAX;
    } catch (e) {
        maxBenhNhan = DEFAULT_MAX;
    }
    const countToday = await PhieuKhamRepo.CountByDate(today);
    if (countToday >= maxBenhNhan) {
        throw {
            status: 400,
            message: `Phòng mạch đã đạt giới hạn tối đa ${maxBenhNhan} bệnh nhân trong ngày hôm nay. Không thể tiếp nhận thêm!`
        };
    }
    // ────────────────────────────────────────────────

    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        // Bắt đầu chuỗi giao dịch liên hoàn
        await transaction.begin();

        // 1. Thêm bệnh nhân thông qua transaction
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
                VALUES (dbo.fn_ChuanHoaTen(@TenBN), @CCCD, @GioiTinh, @NgaySinh, @DiaChi, @SDT, @Email)
            `);

        const maBN = bnResult.recordset[0].MaBN;
        const tenBN = bnResult.recordset[0].TenBN;

        // 2. Tính Số Thứ Tự an toàn trước khi Insert Phiếu Khám
        const requestSTT = new sql.Request(transaction);
        const sttResult = await requestSTT.query(`
            SELECT ISNULL(MAX(SoThuTu), 0) + 1 AS NextSTT 
            FROM PHIEUKHAM WITH (UPDLOCK, HOLDLOCK)
            WHERE NgayKham = CONVERT(date, GETDATE())
        `);
        const nextSoThuTu = sttResult.recordset[0].NextSTT;

        // 3. Thêm phiếu khám (Đã sửa lỗi chữ I       NSERT)
        const requestPK = new sql.Request(transaction);
        const pkResult = await requestPK
            .input('MaNV', sql.Int, MaNV || null)
            .input('MaBN', sql.Int, maBN)
            .input('SoThuTu', sql.Int, nextSoThuTu)
            .query(`
                INSERT INTO PHIEUKHAM (MaNV, MaBN, NgayKham, SoThuTu)
                OUTPUT INSERTED.MaPK, INSERTED.SoThuTu
                VALUES (@MaNV, @MaBN, CONVERT(date, GETDATE()), @SoThuTu)
            `);

        const phieuKham = pkResult.recordset[0];

        // Nếu tất cả các lệnh trên chạy thành công không lỗi gì -> Lưu chính thức vào database
        await transaction.commit();

        return { 
            maBN, 
            maPK: phieuKham.MaPK, 
            soThuTu: phieuKham.SoThuTu, 
            TenBN: data.TenBN 
        };

    } catch (error) {
        // Nếu có bất kỳ lỗi nào xảy ra hệ thống tự động rollback (quay xe) dữ liệu sạch sẽ
        await transaction.rollback();
        throw error; 
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