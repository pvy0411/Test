const AppointmentRepo = require('../repositories/AppointmentRepo');
const ThamSoRepo = require('../repositories/ThamSoRepo');
const PhieuKhamRepo = require('../repositories/PhieuKhamRepo');

const DEFAULT_MAX_PATIENTS = 40;

class AppointmentService {
    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone number (VN format: 10 digits)
    validatePhoneNumber(phone) {
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        return phoneRegex.test(phone);
    }

    // Validate CCCD (12 digits, numbers only)
    validateCCCD(cccd) {
        const cccdRegex = /^[0-9]{12}$/;
        return cccdRegex.test(cccd);
    }

    // Validate date format and value
    validateDate(dateString) {
        const date = new Date(dateString);
        
        // Check if date is valid
        if (isNaN(date.getTime())) {
            return false;
        }
        
        return true;
    }

    // Check if appointment date is not in the past
    isValidAppointmentDate(dateString) {
        const appointmentDate = new Date(dateString);
        const today = new Date();
        
        // Reset time for comparison (only compare dates, not time)
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);
        
        return appointmentDate >= today;
    }

    // Validate input data
    validateBookingData(data) {
        const errors = [];

        // Check required fields
        if (!data.TenBN || data.TenBN.trim() === '') {
            errors.push('Họ tên bệnh nhân không được để trống');
        }

        if (!data.CCCD || data.CCCD.trim() === '') {
            errors.push('CCCD không được để trống');
        } else if (!this.validateCCCD(data.CCCD)) {
            errors.push('CCCD phải là 12 chữ số');
        }

        if (!data.SDT || data.SDT.trim() === '') {
            errors.push('Số điện thoại không được để trống');
        } else if (!this.validatePhoneNumber(data.SDT)) {
            errors.push('Số điện thoại không hợp lệ (định dạng: 0xxxxxxxxx hoặc +84xxxxxxxxx)');
        }

        // Email là tùy chọn. Nếu được cung cấp thì kiểm tra định dạng
        if (data.Email && data.Email.trim() !== '') {
            if (!this.validateEmail(data.Email)) {
                errors.push('Email không hợp lệ');
            }
        }

        if (!data.GioiTinh || data.GioiTinh.trim() === '') {
            errors.push('Giới tính không được để trống');
        } else if (!['Nam', 'Nữ', 'Khác'].includes(data.GioiTinh)) {
            errors.push('Giới tính không hợp lệ');
        }

        if (!data.NgayKham || data.NgayKham.trim() === '') {
            errors.push('Ngày khám không được để trống');
        } else if (!this.validateDate(data.NgayKham)) {
            errors.push('Ngày khám không hợp lệ');
        } else if (!this.isValidAppointmentDate(data.NgayKham)) {
            errors.push('Ngày khám không được nhỏ hơn ngày hôm nay');
        }

        // Optional: check NgaySinh if provided
        if (data.NgaySinh && data.NgaySinh.trim() !== '') {
            if (!this.validateDate(data.NgaySinh)) {
                errors.push('Ngày sinh không hợp lệ');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Book appointment
    async BookAppointment(data) {
        try {
            console.log('[AppointmentService] BookAppointment bắt đầu với dữ liệu:', data);
            
            // Validate input
            const validation = this.validateBookingData(data);
            if (!validation.isValid) {
                console.log('[AppointmentService] Validation thất bại:', validation.errors);
                throw {
                    status: 400,
                    message: 'Dữ liệu không hợp lệ',
                    errors: validation.errors
                };
            }

            console.log('[AppointmentService] Validation thành công, kiểm tra bệnh nhân tồn tại');

            // ── Kiểm tra giới hạn số bệnh nhân trong ngày khám ──
            const ngayKham = data.NgayKham; // yyyy-mm-dd
            let maxBN = DEFAULT_MAX_PATIENTS;
            try {
                const raw = await ThamSoRepo.GetByName('SoBenhNhanToiDa');
                if (raw && !isNaN(Number(raw))) maxBN = Number(raw);
            } catch (e) { /* dùng mặc định */ }
            const countOnDay = await PhieuKhamRepo.CountByDate(ngayKham);
            if (countOnDay >= maxBN) {
                throw {
                    status: 400,
                    message: `Phòng mạch đã đạt giới hạn tối đa ${maxBN} bệnh nhân trong ngày ${ngayKham}. Vui lòng chọn ngày khác!`
                };
            }
            // ────────────────────────────────────────────────────
            
            // Check if patient already exists by CCCD
            const existingPatient = await AppointmentRepo.CheckPatientByCCCD(data.CCCD);
            
            let maBN, maPK;

            if (existingPatient) {
                console.log('[AppointmentService] Bệnh nhân đã tồn tại với MaBN:', existingPatient.MaBN);
                // Patient exists, create appointment for existing patient
                maBN = existingPatient.MaBN;
                // Cập nhật thông tin bệnh nhân nếu frontend gửi dữ liệu mới
                try {
                    await AppointmentRepo.UpdatePatient(maBN, {
                        TenBN: data.TenBN || existingPatient.TenBN,
                        GioiTinh: data.GioiTinh || existingPatient.GioiTinh,
                        SDT: data.SDT || existingPatient.SDT,
                        Email: data.Email || existingPatient.Email,
                        DiaChi: data.DiaChi || existingPatient.DiaChi,
                        NgaySinh: data.NgaySinh || existingPatient.NgaySinh
                    });
                } catch (updateErr) {
                    console.warn('[AppointmentService] Cập nhật bệnh nhân thất bại, tiếp tục tạo phiếu khám:', updateErr.message);
                }

                maPK = await AppointmentRepo.CreateAppointmentForExistingPatient(
                    maBN,
                    data.NgayKham,
                    data.MaNV || null
                );
            } else {
                console.log('[AppointmentService] Bệnh nhân mới, tạo bệnh nhân và lịch khám');
                // Create new patient and appointment in transaction
                const result = await AppointmentRepo.BookAppointment({
                    TenBN: data.TenBN,
                    CCCD: data.CCCD,
                    GioiTinh: data.GioiTinh,
                    SDT: data.SDT,
                    Email: (data.Email && String(data.Email).trim() !== '') ? data.Email : null,
                    DiaChi: data.DiaChi || '',
                    NgaySinh: data.NgaySinh || null,
                    NgayKham: data.NgayKham,
                    MaNV: data.MaNV || null
                });

                console.log('[AppointmentService] BookAppointment từ Repository trả về:', result);

                maBN = result.maBN;
                maPK = result.maPK;
            }

            console.log('[AppointmentService] Đặt lịch thành công - MaBN:', maBN, 'MaPK:', maPK);

            return {
                success: true,
                data: {
                    maBN: maBN,
                    maPK: maPK
                },
                message: 'Đặt lịch khám thành công! Chúng tôi sẽ liên hệ xác nhận sớm nhất.'
            };
        } catch (error) {
            console.error('[AppointmentService] Lỗi:', error);
            throw {
                status: error.status || 500,
                message: error.message || 'Lỗi đặt lịch khám',
                errors: error.errors || []
            };
        }
    }
}

module.exports = new AppointmentService();
