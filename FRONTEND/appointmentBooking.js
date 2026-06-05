/**
 * Appointment Booking Handler
 * Xử lý form đặt lịch khám, validate, gửi API, hiển thị thông báo
 */

class AppointmentBooking {
    constructor(formSelector = '.appt-form') {
        this.form = document.querySelector(formSelector);
        this.apiUrl = 'https://quanlyphongmachtu.onrender.com/api/appointments/book';
        this.submitBtn = null;
        this.init();
    }

    init() {
        if (!this.form) {
            console.error('Form không tìm thấy');
            return;
        }

        // Lấy button submit và thêm event listener
        this.submitBtn = this.form.querySelector('button.btn-submit');
        if (this.submitBtn) {
            // Remove onclick attribute nếu có
            this.submitBtn.removeAttribute('onclick');
            // Thêm event listener
            this.submitBtn.addEventListener('click', (e) => this.handleSubmit(e));
        }

        // Tạo phần hiển thị sức chứa cạnh input ngày (nếu có)
        this.ngayKhamInput = this.form.querySelector('#appointmentDate') || this.form.querySelector('input[type="date"]');
        if (this.ngayKhamInput) {
            // tạo phần hiển thị nếu chưa có
            this.capacityDisplay = this.form.querySelector('.capacity-display');
            if (!this.capacityDisplay) {
                this.capacityDisplay = document.createElement('div');
                this.capacityDisplay.className = 'capacity-display';
                this.capacityDisplay.style.marginTop = '6px';
                this.capacityDisplay.style.fontSize = '0.95em';
                this.capacityDisplay.style.color = '#333';
                this.ngayKhamInput.insertAdjacentElement('afterend', this.capacityDisplay);
            }

            // Lắng nghe khi thay đổi ngày
            this.ngayKhamInput.addEventListener('change', () => {
                const date = this.ngayKhamInput.value;
                if (date) this.fetchCapacity(date);
            });

            // Nếu có giá trị sẵn, gọi check một lần
            if (this.ngayKhamInput.value) this.fetchCapacity(this.ngayKhamInput.value);
        }
    }

    /**
     * Lấy dữ liệu từ form
     */
    getFormData() {
        // Lấy tất cả inputs & selects theo thứ tự
        const allInputs = this.form.querySelectorAll('input, select');
        
        // Tìm các input theo placeholder/type để chắc chắn
        const tenBNInput = this.form.querySelector('input[placeholder="Nguyễn Văn A"]');
        const sdtInput = this.form.querySelector('input[type="tel"]');
        const gioiTinhSelect = this.form.querySelector('select');
        const cccdInput = this.form.querySelector('input[placeholder="123456789012"]');
        const emailInput = this.form.querySelector('#email') || this.form.querySelector('input[type="email"]');
        const ngayKhamInput = this.form.querySelector('#appointmentDate') || this.form.querySelector('input[type="date"]');
        const ngaySinhInput = this.form.querySelector('#dob');
        const addressInput = this.form.querySelector('#address');
        
        return {
            TenBN: tenBNInput?.value?.trim() || '',
            SDT: sdtInput?.value?.trim() || '',
            GioiTinh: gioiTinhSelect?.value?.trim() || '',
            CCCD: cccdInput?.value?.trim() || '',
            Email: emailInput?.value?.trim() || '',
            NgayKham: ngayKhamInput?.value?.trim() || '',
            DiaChi: addressInput?.value?.trim() || '',
            NgaySinh: ngaySinhInput?.value?.trim() || ''
        };
    }

    /**
     * Validate email
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number (VN format)
     */
    validatePhoneNumber(phone) {
        const phoneRegex = /^(0|\+84)[0-9]{9}$/;
        return phoneRegex.test(phone);
    }

    /**
     * Validate CCCD (12 digits)
     */
    validateCCCD(cccd) {
        const cccdRegex = /^[0-9]{12}$/;
        return cccdRegex.test(cccd);
    }

    /**
     * Validate date format
     */
    validateDate(dateString) {
        const date = new Date(dateString);
        return !isNaN(date.getTime());
    }

    /**
     * Check if date is not in the past
     */
    isValidAppointmentDate(dateString) {
        const appointmentDate = new Date(dateString);
        const today = new Date();
        
        today.setHours(0, 0, 0, 0);
        appointmentDate.setHours(0, 0, 0, 0);
        
        return appointmentDate >= today;
    }

    /**
     * Client-side validation
     */
    validateForm(data) {
        const errors = [];

        if (!data.TenBN) {
            errors.push('Họ tên bệnh nhân không được để trống');
        }

        if (!data.CCCD) {
            errors.push('CCCD không được để trống');
        } else if (!this.validateCCCD(data.CCCD)) {
            errors.push('CCCD phải là 12 chữ số');
        }

        if (!data.SDT) {
            errors.push('Số điện thoại không được để trống');
        } else if (!this.validatePhoneNumber(data.SDT)) {
            errors.push('Số điện thoại không hợp lệ (0xxxxxxxxx hoặc +84xxxxxxxxx)');
        }

        if (data.Email && !this.validateEmail(data.Email)) {
            errors.push('Email không hợp lệ (Vui lòng điền đúng định dạng hoặc để trống)');
        }

        if (!data.GioiTinh) {
            errors.push('Giới tính không được để trống');
        }

        if (!data.NgayKham) {
            errors.push('Ngày khám không được để trống');
        } else if (!this.validateDate(data.NgayKham)) {
            errors.push('Ngày khám không hợp lệ');
        } else if (!this.isValidAppointmentDate(data.NgayKham)) {
            errors.push('Ngày khám không được nhỏ hơn ngày hôm nay');
        }

        // Ngày sinh bắt buộc để tránh lỗi DB (tránh gửi NULL)
        if (!data.NgaySinh) {
            errors.push('Ngày sinh không được để trống');
        } else if (!this.validateDate(data.NgaySinh)) {
            errors.push('Ngày sinh không hợp lệ');
        } else {
            // Ngày sinh phải nhỏ hơn ngày hôm nay
            const dob = new Date(data.NgaySinh);
            const today = new Date();
            dob.setHours(0,0,0,0);
            today.setHours(0,0,0,0);
            if (dob >= today) errors.push('Ngày sinh phải nhỏ hơn ngày hôm nay');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * Hiển thị thông báo lỗi
     */
    showErrorMessage(errors) {
        if (Array.isArray(errors) && errors.length > 0) {
            const errorMessage = errors.join(' ');
            this.showAlert(errorMessage, 'error');
        }
    }

    /**
     * Show alert/modal/toast
     */
    showAlert(message, type = 'success') {
        // Nếu có thư viện like Swal2 (Sweet Alert 2)
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                title: type === 'success' ? 'Thành công!' : 'Lỗi!',
                html: message,
                icon: type,
                confirmButtonText: 'OK',
                confirmButtonColor: type === 'success' ? '#4CAF50' : '#f44336'
            });
        } else {
            // Fallback: dùng alert thường
            alert(message);
        }
    }

    /**
     * Show loading state
     */
    showLoading(isLoading) {
        if (this.submitBtn) {
            if (isLoading) {
                this.submitBtn.disabled = true;
                this.submitBtn.innerHTML = '<span class="spinner"></span> Đang xử lý...';
            } else {
                this.submitBtn.disabled = false;
                this.submitBtn.innerHTML = 'Xác Nhận Đặt Lịch →';
            }
        }
    }

    // Fetch capacity from backend for a given date
    async fetchCapacity(date) {
        try {
            const capacityEndpoint = this.apiUrl.replace('/book', '/check-capacity');
            const resp = await fetch(`${capacityEndpoint}?date=${encodeURIComponent(date)}`);
            const json = await resp.json();
            if (!resp.ok) {
                // show error in capacity area
                this.capacityDisplay && (this.capacityDisplay.textContent = json.message || 'Không thể kiểm tra sức chứa');
                return;
            }

            const data = json.data || {};
            const current = data.currentCount ?? 0;
            const max = data.maxCount ?? 0;
            const available = data.available === true;

            if (this.capacityDisplay) {
                this.capacityDisplay.textContent = `Hiện tại: ${current}/${max} bệnh nhân`;
                this.capacityDisplay.style.color = available ? '#2b8a3e' : '#c62828';
            }

            if (this.submitBtn) {
                this.submitBtn.disabled = !available;
            }
        } catch (err) {
            console.error('Lỗi fetchCapacity:', err);
            if (this.capacityDisplay) this.capacityDisplay.textContent = 'Lỗi khi kiểm tra sức chứa';
        }
    }

    /**
     * Handle form submit
     */
    async handleSubmit(e) {
        e.preventDefault();

        const formData = this.getFormData();
        const validation = this.validateForm(formData);

        if (!validation.isValid) {
            this.showErrorMessage(validation.errors);
            return;
        }

        try {
            this.showLoading(true);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (!response.ok) {
                // Backend error
                const errorMessage = result.errors?.join(' ') || result.message || 'Đặt lịch khám thất bại';
                this.showAlert(errorMessage, 'error');
                return;
            }

            // Success
            const successMessage = `Đặt lịch khám thành công!<br>Mã bệnh nhân: ${result.data.maBN}<br>Mã phiếu khám: ${result.data.maPK}<br>Chúng tôi sẽ liên hệ xác nhận sớm nhất.`;
            this.showAlert(successMessage, 'success');

            // Reset form - xóa giá trị từng input
            const inputs = this.form.querySelectorAll('input, select');
            inputs.forEach(input => {
                if (input.type === 'date') {
                    input.value = '';
                } else if (input.tagName === 'SELECT') {
                    input.selectedIndex = 0;
                } else {
                    input.value = '';
                }
            });

        } catch (error) {
            this.showAlert(`Lỗi kết nối: ${error.message}`, 'error');
            console.error('Error:', error);
        } finally {
            this.showLoading(false);
        }
    }
}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new AppointmentBooking('.appt-form');
});
