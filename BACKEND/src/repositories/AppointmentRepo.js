const { sql, poolPromise } = require('../config/database');

class AppointmentRepo {
    // Kiểm tra bệnh nhân đã tồn tại qua CCCD
    async CheckPatientExists(cccd) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('cccd', sql.VarChar, cccd)
                .query('SELECT MaBN FROM BENHNHAN WHERE CCCD = @cccd');
            return result.recordset.length > 0 ? result.recordset[0].MaBN : null;
        } catch (error) {
            throw new Error(`Lỗi kiểm tra bệnh nhân: ${error.message}`);
        }
    }

    // Thêm bệnh nhân mới (sẽ tự động tạo MaBN)
    async CreatePatient(data) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('TenBN', sql.NVarChar, data.TenBN)
                .input('CCCD', sql.VarChar, data.CCCD)
                .input('GioiTinh', sql.NVarChar, data.GioiTinh)
                .input('SDT', sql.VarChar, data.SDT)
                .input('Email', sql.VarChar, (data.Email && String(data.Email).trim() !== '') ? data.Email : null)
                .input('DiaChi', sql.NVarChar, data.DiaChi || '')
                .input('NgaySinh', sql.Date, data.NgaySinh || null)
                .query(`
                    INSERT INTO BENHNHAN (TenBN, CCCD, GioiTinh, SDT, Email, DiaChi, NgaySinh)
                    OUTPUT INSERTED.MaBN
                    VALUES (@TenBN, @CCCD, @GioiTinh, @SDT, @Email, @DiaChi, @NgaySinh)
                `);
            return result.recordset[0].MaBN;
        } catch (error) {
            throw new Error(`Lỗi tạo bệnh nhân: ${error.message}`);
        }
    }

    // Tạo phiếu khám mới
    async CreateAppointment(maBN, ngayKham, maNV = null) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaBN', sql.Int, maBN)
                .input('NgayKham', sql.Date, ngayKham)
                .input('MaNV', sql.Int, maNV)
                .query(`
                    DECLARE @OutputTable TABLE (MaPK INT);
                    INSERT INTO PHIEUKHAM (MaBN, NgayKham, MaNV)
                    OUTPUT INSERTED.MaPK INTO @OutputTable
                    VALUES (@MaBN, @NgayKham, @MaNV);
                    SELECT * FROM @OutputTable;
                `);
            return result.recordset[0].MaPK;
        } catch (error) {
            throw new Error(`Lỗi tạo phiếu khám: ${error.message}`);
        }
    }

    // Cập nhật thông tin bệnh nhân khi có dữ liệu mới
    async UpdatePatient(maBN, data) {
        try {
            const pool = await poolPromise;
            await pool.request()
                .input('MaBN', sql.Int, maBN)
                .input('TenBN', sql.NVarChar, data.TenBN)
                .input('GioiTinh', sql.NVarChar, data.GioiTinh)
                .input('SDT', sql.VarChar, data.SDT)
                .input('Email', sql.VarChar, (data.Email && String(data.Email).trim() !== '') ? data.Email : null)
                .input('DiaChi', sql.NVarChar, data.DiaChi || '')
                .input('NgaySinh', sql.Date, data.NgaySinh || null)
                .query(`
                    UPDATE BENHNHAN
                    SET TenBN = @TenBN, GioiTinh = @GioiTinh, SDT = @SDT,
                        Email = @Email, DiaChi = @DiaChi, NgaySinh = @NgaySinh
                    WHERE MaBN = @MaBN
                `);
            return true;
        } catch (error) {
            throw new Error(`Lỗi cập nhật bệnh nhân: ${error.message}`);
        }
    }

    // Đặt lịch khám với transaction
    async BookAppointment(patientData) {
        let connection;
        let transaction;
        try {
            console.log('[BookAppointment] Bắt đầu đặt lịch với dữ liệu:', {
                TenBN: patientData.TenBN,
                CCCD: patientData.CCCD,
                SDT: patientData.SDT,
                Email: patientData.Email,
                GioiTinh: patientData.GioiTinh,
                NgayKham: patientData.NgayKham,
                NgaySinh: patientData.NgaySinh,
                DiaChi: patientData.DiaChi
            });

            connection = await poolPromise;
            transaction = new sql.Transaction(connection);
            
            await transaction.begin();
            console.log('[BookAppointment] Transaction bắt đầu');
            
            // 1. Thêm bệnh nhân mới
            const insertPatient = new sql.Request(transaction)
                .input('TenBN', sql.NVarChar, patientData.TenBN)
                .input('CCCD', sql.VarChar, patientData.CCCD)
                .input('GioiTinh', sql.NVarChar, patientData.GioiTinh)
                .input('SDT', sql.VarChar, patientData.SDT)
                .input('Email', sql.VarChar, (patientData.Email && String(patientData.Email).trim() !== '') ? patientData.Email : null)
                .input('DiaChi', sql.NVarChar, patientData.DiaChi || '')
                .input('NgaySinh', sql.Date, patientData.NgaySinh || null);
            
            const patientResult = await insertPatient.query(`
                INSERT INTO BENHNHAN (TenBN, CCCD, GioiTinh, SDT, Email, DiaChi, NgaySinh)
                OUTPUT INSERTED.MaBN
                VALUES (@TenBN, @CCCD, @GioiTinh, @SDT, @Email, @DiaChi, @NgaySinh)
            `);
            
            console.log('[BookAppointment] INSERT BENHNHAN result:', patientResult.recordset);
            
            if (!patientResult.recordset || patientResult.recordset.length === 0) {
                throw new Error('Lỗi: Không thể tạo bệnh nhân (OUTPUT INSERTED.MaBN không trả về kết quả)');
            }

            const maBN = patientResult.recordset[0].MaBN;
            console.log('[BookAppointment] Bệnh nhân được tạo với MaBN:', maBN);
            
            // 2. Tạo phiếu khám cho bệnh nhân
            const insertAppointment = new sql.Request(transaction)
                .input('MaBN', sql.Int, maBN)
                .input('NgayKham', sql.Date, patientData.NgayKham)
                .input('MaNV', sql.Int, patientData.MaNV || null);
            
            const appointmentResult = await insertAppointment.query(`
                DECLARE @OutputTable TABLE (MaPK INT);
                INSERT INTO PHIEUKHAM (MaBN, NgayKham, MaNV)
                OUTPUT INSERTED.MaPK INTO @OutputTable
                VALUES (@MaBN, @NgayKham, @MaNV);
                SELECT * FROM @OutputTable;
            `);
            
            console.log('[BookAppointment] INSERT PHIEUKHAM result:', appointmentResult.recordset);

            if (!appointmentResult.recordset || appointmentResult.recordset.length === 0) {
                throw new Error('Lỗi: Không thể tạo phiếu khám (OUTPUT INSERTED.MaPK không trả về kết quả)');
            }

            const maPK = appointmentResult.recordset[0].MaPK;
            console.log('[BookAppointment] Phiếu khám được tạo với MaPK:', maPK);
            
            // 3. Commit transaction
            await transaction.commit();
            console.log('[BookAppointment] Transaction commit thành công');
            
            return {
                success: true,
                maBN: maBN,
                maPK: maPK,
                message: 'Đặt lịch khám thành công!'
            };
        } catch (error) {
            console.error('[BookAppointment] Lỗi xảy ra:', error);
            // Rollback nếu có lỗi
            if (transaction) {
                try {
                    await transaction.rollback();
                    console.log('[BookAppointment] Transaction đã rollback');
                } catch (rollbackError) {
                    console.error('[BookAppointment] Lỗi khi rollback:', rollbackError);
                }
            }
            throw new Error(`Lỗi đặt lịch khám (rollback tự động): ${error.message}`);
        }
    }

    // Kiểm tra xem CCCD có đã đăng ký hay chưa
    async CheckPatientByCCCD(cccd) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('cccd', sql.VarChar, cccd)
                .query(`
                    SELECT MaBN, TenBN, Email, SDT, GioiTinh, DiaChi
                    FROM BENHNHAN 
                    WHERE CCCD = @cccd
                `);
            return result.recordset[0] || null;
        } catch (error) {
            throw new Error(`Lỗi kiểm tra bệnh nhân: ${error.message}`);
        }
    }

    // Tạo phiếu khám cho bệnh nhân đã tồn tại
    async CreateAppointmentForExistingPatient(maBN, ngayKham, maNV = null) {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('MaBN', sql.Int, maBN)
                .input('NgayKham', sql.Date, ngayKham)
                .input('MaNV', sql.Int, maNV)
                .query(`
                    DECLARE @OutputTable TABLE (MaPK INT);
                    INSERT INTO PHIEUKHAM (MaBN, NgayKham, MaNV)
                    OUTPUT INSERTED.MaPK INTO @OutputTable
                    VALUES (@MaBN, @NgayKham, @MaNV);
                    SELECT * FROM @OutputTable;
                `);
            return result.recordset[0].MaPK;
        } catch (error) {
            throw new Error(`Lỗi tạo phiếu khám: ${error.message}`);
        }
    }
}

module.exports = new AppointmentRepo();
