-- CREATE TABLE
CREATE TABLE CHUCVU
(
	MaCV int IDENTITY(1,1) primary key, 
	TenCV NVARCHAR(50) NOT NULL
);

CREATE TABLE CHUYENKHOA
(
	MaCK int IDENTITY(1,1) primary key, 
	TenCK NVARCHAR(50) NOT NULL
);

CREATE TABLE NHANVIEN
(
	MaNV int IDENTITY(1,1) Primary key,
	TenNV nvarchar(100) NOT NULL,
	CCCD VARCHAR(12) UNIQUE,
	GioiTinh NVARCHAR(3) NOT NULL,
	NgaySinh Date NOT NULL,
	NgayBatDauLamViec Date NOT NULL,
	BangCapChungChi NVARCHAR(255),
	DiaChi NVARCHAR(255),
	SDT varchar(10) NOT NULL,
	Email VARCHAR(100),
	MaCV int,
	MaCK int,
	CONSTRAINT fk_nv_cv FOREIGN KEY (MaCV) REFERENCES CHUCVU(MaCV),
	CONSTRAINT fk_nv_ck FOREIGN KEY (MaCK) REFERENCES CHUYENKHOA(MaCK)
);

CREATE TABLE TAIKHOAN
(
	TenDangNhap VARCHAR(50) PRIMARY KEY,
	MatKhau VARCHAR(10) NOT NULL,
	MaNV INT UNIQUE,
	CONSTRAINT fk_tk_nv FOREIGN KEY (MaNV) REFERENCES NHANVIEN(MaNV)
);

CREATE TABLE BENHNHAN
(
	MaBN INT IDENTITY(1,1) Primary Key,
	TenBN NVARCHAR(100) NOT NULL,
	CCCD VARCHAR(12) UNIQUE,
	GioiTinh NVARCHAR(3) NOT NULL,
	NgaySinh Date NOT NULL,
	DiaChi NVARCHAR(255),
	SDT VARCHAR(10) NOT NULL,
	Email VARCHAR(100)
);


CREATE TABLE PHIEUKHAM
(
	MaPK INT IDENTITY(1,1) PRIMARY KEY,
	MaNV INT,
	MaBN INT,
	NgayKham DATE NOT NULL DEFAULT GETDATE(),
	SoThuTu INT NOT NULL DEFAULT 1,
	CONSTRAINT fk_pk_nv FOREIGN KEY (MaNV) REFERENCES NHANVIEN(MaNV),
	CONSTRAINT fk_pk_bn FOREIGN KEY (MaBN) REFERENCES BENHNHAN(MaBN)
);

CREATE TABLE DONVITINH
(
	MaDVT INT IDENTITY(1,1) PRIMARY KEY,
	TenDVT NVARCHAR(20) NOT NULL
);

CREATE TABLE CACHDUNG
(
	MaCachDung INT IDENTITY(1,1) PRIMARY KEY,
	MoTaCachDung NVARCHAR(255) NOT NULL
);

CREATE TABLE THUOC
(
	MaThuoc INT IDENTITY(1,1) PRIMARY KEY,
	TenThuoc NVARCHAR(255) UNIQUE,
	DonGiaBan DECIMAL(18,2) NOT NULL,
	SoLuongTon INT DEFAULT 0,
	MaCachDung INT,
	MaDVT INT,
	CONSTRAINT fk_t_cd FOREIGN KEY (MaCachDung) REFERENCES CACHDUNG(MaCachDung),
	CONSTRAINT fk_t_dvt FOREIGN KEY (MaDVT) REFERENCES DONVITINH(MaDVT)
);

CREATE TABLE CT_PHIEUKHAM
(
	MaPK INT,
	MaThuoc INT,
	SoLuongThuoc INT NOT NULL,
	DonGiaBan DECIMAL(18,2) NOT NULL,
	ThanhTien DECIMAL(18,2) DEFAULT 0,
	CONSTRAINT pk_ctpk PRIMARY KEY(MaPK, MaThuoc),
	CONSTRAINT fk_ctpk_pk FOREIGN KEY (MaPK) REFERENCES PHIEUKHAM(MaPK),
	CONSTRAINT fk_ctpk_t FOREIGN KEY (MaThuoc) REFERENCES THUOC(MaThuoc)
);

CREATE TABLE PHIEUNHAPTHUOC
(
	MaPN INT IDENTITY(1,1) PRIMARY KEY,
	NgayNhap DATE NOT NULL,
	TongTienNhap DECIMAL(18,2) DEFAULT 0,
);

CREATE TABLE CT_PHIEUNHAPTHUOC
(
	MaPN INT,
	MaThuoc INT, 
	DonGiaNhap DECIMAL(18,2) NOT NULL,
	SoLuong INT NOT NULL,
	ThanhTien DECIMAL(18,2) NOT NULL,
	CONSTRAINT pk_pnt PRIMARY KEY(MaPN, MaThuoc),
	CONSTRAINT fk_ctpnt_pn FOREIGN KEY (MaPN) REFERENCES PHIEUNHAPTHUOC(MaPN),
	CONSTRAINT fk_ctpnt_t FOREIGN KEY (MaThuoc) REFERENCES THUOC(MaThuoc)
);

CREATE TABLE LOAIBENH
(
	MaLoaiBenh INT IDENTITY(1,1) PRIMARY KEY,
	TenLoaiBenh NVARCHAR(255) NOT NULL
);

CREATE TABLE CT_LOAIBENH
(
	MaPK INT, 
	MaLoaiBenh INT,
	TrieuChung NVARCHAR(255),
	GhiChu NVARCHAR(255),
	CONSTRAINT pk_ctlb PRIMARY KEY(MaPK, MaLoaiBenh),
	CONSTRAINT fk_ctlb_pk FOREIGN KEY (MaPK) REFERENCES PHIEUKHAM(MaPK),
	CONSTRAINT fk_ctlb_b FOREIGN KEY (MaLoaiBenh) REFERENCES LOAIBENH(MaLoaiBenh)
);

CREATE TABLE HOADON
(
	MaHD INT IDENTITY(1,1) PRIMARY KEY,
	MaPK INT,
	NgayLap DATETIME DEFAULT GETDATE(),
	TongTienThuoc DECIMAL(18,2) NOT NULL,
	TienKham DECIMAL(18,2) NOT NULL,
	TongTien DECIMAL(18,2) DEFAULT 0,
	CONSTRAINT fk_hd_pk FOREIGN KEY (MaPK) REFERENCES PHIEUKHAM(MaPK)
);

CREATE TABLE BCDOANHTHU
(
	Thang INT,
	Nam INT,
	TongDoanhThu DECIMAL(18,2) NOT NULL,
	TongSoBenhNhan INT NOT NULL,
	CONSTRAINT pk_bcdt PRIMARY KEY (Thang, Nam)
);

CREATE TABLE CT_BCDOANHTHU
(
	Ngay INT,
	Thang INT, 
	Nam INT,
	SoBenhNhan INT NOT NULL,
	DoanhThu DECIMAL(18,2) DEFAULT 0,
	TyLe DECIMAL(3,2) NOT NULL,
	CONSTRAINT pk_ctbcdt PRIMARY KEY (Ngay, Thang, Nam),
	CONSTRAINT fk_ctbcdt_bcdt FOREIGN KEY (Thang, Nam) REFERENCES BCDOANHTHU(Thang, Nam)
);

CREATE TABLE BCSUDUNGTHUOC
(
	Thang INT,
	Nam INT,
	MaThuoc INT,
	SoLanDung INT NOT NULL,
	SoLuongDung INT NOT NULL,
	SoLuongNhap INT NOT NULL,
	CONSTRAINT pk_bcsdt PRIMARY KEY(Thang, Nam, MaThuoc),
	CONSTRAINT fk_bcsdt_t FOREIGN KEY (MaThuoc) REFERENCES THUOC(MaThuoc)
);

CREATE TABLE THAMSO
(
	TenThamSo NVARCHAR(100) PRIMARY KEY,
	GiaTri DECIMAL(18,2) NOT NULL
);

---------------------------------------------------------------
-- TRIGGER
---------------------------------------------------------------
-- trigger: soluongton >=0
ALTER TABLE THUOC
ADD CONSTRAINT chk_thuoc_soluongton_khongam
CHECK (SoLuongTon >= 0);

-- check số lượng thuốc >= 0
ALTER TABLE CT_PHIEUKHAM
ADD CONSTRAINT CK_SoLuongThuoc_Positive
CHECK (SoLuongThuoc >= 0);

-- giá thuốc >= 0
ALTER TABLE THUOC
ADD CONSTRAINT CK_GiaThuoc
CHECK (DonGiaBan >= 0);
-- check số lượng nhâp
ALTER TABLE CT_PHIEUNHAPTHUOC
ADD CONSTRAINT CK_SoLuongNhap_Positive
CHECK (SoLuong >= 0);
-- giá nhập
ALTER TABLE CT_PHIEUNHAPTHUOC
ADD CONSTRAINT CK_DonGiaNhap_Positive
CHECK (DonGiaNhap >= 0);

-- trigger: ko xóa thuốc khi có bệnh nhân đnag dùng 
CREATE TRIGGER trg_KiemTraXoaThuoc
ON THUOC
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra xem thuốc bị xóa có tồn tại trong CT_PHIEUKHAM không
    IF EXISTS (
        SELECT 1
        FROM deleted d
        INNER JOIN CT_PHIEUKHAM ct ON d.MaThuoc = ct.MaThuoc
    )
    BEGIN
        RAISERROR(
            N'Không thể xóa thuốc vì thuốc này đã được kê trong phiếu khám của bệnh nhân.',
            16, 1
        );
        RETURN; -- Hủy lệnh xóa, không làm gì thêm
    END

    -- Nếu không có ràng buộc kê đơn nào thì cho phép xóa
    DELETE FROM THUOC
    WHERE MaThuoc IN (SELECT MaThuoc FROM deleted);
END;

-- TRIGGER: Khi kê đơn thuốc, SoLuongThuoc phải <= SoLuongTon
CREATE TRIGGER trg_KiemTraSoLuongKeDon
ON CT_PHIEUKHAM
INSTEAD OF INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Kiểm tra tồn kho hợp lệ
    IF EXISTS (
        SELECT 1
        FROM inserted i JOIN THUOC t ON i.MaThuoc = t.MaThuoc
        LEFT JOIN deleted d ON i.MaPK = d.MaPK AND i.MaThuoc = d.MaThuoc
        WHERE i.SoLuongThuoc > (t.SoLuongTon + ISNULL(d.SoLuongThuoc,0))
    )
    BEGIN
        RAISERROR(N'Số lượng thuốc vượt quá tồn kho.',16,1);
        RETURN;
    END

    -- UPDATE
    IF EXISTS (SELECT * FROM deleted)
    BEGIN
        UPDATE ct
        SET
            SoLuongThuoc = i.SoLuongThuoc,
            DonGiaBan = i.DonGiaBan,
            ThanhTien = i.SoLuongThuoc * i.DonGiaBan
        FROM CT_PHIEUKHAM ct JOIN inserted i ON ct.MaPK = i.MaPK AND ct.MaThuoc = i.MaThuoc;

        -- cập nhật kho
        UPDATE t
        SET t.SoLuongTon = t.SoLuongTon + d.SoLuongThuoc - i.SoLuongThuoc
        FROM THUOC t JOIN inserted i ON t.MaThuoc = i.MaThuoc
        JOIN deleted d ON i.MaPK = d.MaPK AND i.MaThuoc = d.MaThuoc;
    END
    ELSE
    BEGIN
        -- INSERT
        INSERT INTO CT_PHIEUKHAM
        (
            MaPK,
            MaThuoc,
            SoLuongThuoc,
            DonGiaBan,
            ThanhTien
        )
        SELECT
            MaPK,
            MaThuoc,
            SoLuongThuoc,
            DonGiaBan,
            SoLuongThuoc * DonGiaBan
        FROM inserted;

        -- trừ kho
        UPDATE t
        SET t.SoLuongTon = t.SoLuongTon - i.SoLuongThuoc
        FROM THUOC t JOIN inserted i ON t.MaThuoc = i.MaThuoc;
    END
END;


-- trigger hoàn kho khi xóa phiếu khám (xóa kê thuốc)
CREATE TRIGGER trg_HoanKhoKhiXoaDon
ON CT_PHIEUKHAM
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE T
    SET T.SoLuongTon = T.SoLuongTon + D.SoLuongThuoc
    FROM THUOC T INNER JOIN deleted D ON T.MaThuoc = D.MaThuoc;
END;
GO

-- trigger xóa phiếu khám thì tự động hoàn kho
CREATE TRIGGER trg_XoaPhieuKham
ON PHIEUKHAM
INSTEAD OF DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Không cho xóa nếu đã có hóa đơn
    IF EXISTS (
        SELECT 1
        FROM deleted d JOIN HOADON h ON d.MaPK = h.MaPK
    )
    BEGIN
        RAISERROR(N'Phiếu khám đã thanh toán, không thể xóa.',16,1);
        RETURN;
    END

    -- Xóa loại bệnh
    DELETE FROM CT_LOAIBENH
    WHERE MaPK IN (SELECT MaPK FROM deleted);

    -- Xóa thuốc kê đơn
    DELETE FROM CT_PHIEUKHAM
    WHERE MaPK IN (SELECT MaPK FROM deleted);

    -- Xóa phiếu khám
    DELETE pk
    FROM PHIEUKHAM pk JOIN deleted d ON pk.MaPK = d.MaPK;
END;
GO
CREATE TRIGGER trg_CapNhatHoaDon
ON CT_PHIEUKHAM
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE hd
    SET
        TongTienThuoc = ISNULL(x.TongTienThuoc,0),
        TongTien = ISNULL(x.TongTienThuoc,0) + hd.TienKham
    FROM HOADON hd
    OUTER APPLY
    (
        SELECT SUM(ThanhTien) TongTienThuoc
        FROM CT_PHIEUKHAM ct
        WHERE ct.MaPK = hd.MaPK
    ) x
    WHERE hd.MaPK IN
    (
        SELECT MaPK FROM inserted
        UNION
        SELECT MaPK FROM deleted
    );
END;
GO

-- Trigger nhập thuốc
CREATE TRIGGER trg_CongKhoKhiNhapThuoc
ON CT_PHIEUNHAPTHUOC
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE T
    SET T.SoLuongTon = T.SoLuongTon + I.SoLuong
    FROM THUOC T JOIN inserted I ON T.MaThuoc = I.MaThuoc;
END;

-- trigger tự động tính tiền trong hóa đơn
CREATE TRIGGER trg_TinhHoaDon
ON HOADON
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @TienKham DECIMAL(18,2);

    -- Lấy tiền khám từ bảng tham số
    SELECT @TienKham = GiaTri
    FROM THAMSO
    WHERE TenThamSo = 'TienKham';

    -- Cập nhật hóa đơn
    UPDATE HD
    SET
        HD.TongTienThuoc = ISNULL(CT.TongTienThuoc, 0),
        HD.TienKham = @TienKham,
        HD.TongTien = ISNULL(CT.TongTienThuoc, 0) + @TienKham
    FROM HOADON HD INNER JOIN inserted I ON HD.MaHD = I.MaHD
    OUTER APPLY
    (
        SELECT SUM(ThanhTien) AS TongTienThuoc
        FROM CT_PHIEUKHAM
        WHERE MaPK = HD.MaPK
    ) CT;
END;
GO

-- trigger trừ kho khi xóa phiếu nhập 
CREATE TRIGGER trg_TruKhoKhiXoaPhieuNhap
ON CT_PHIEUNHAPTHUOC
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE T
    SET T.SoLuongTon = T.SoLuongTon - D.SoLuong
    FROM THUOC T INNER JOIN deleted D ON T.MaThuoc = D.MaThuoc;
END;

-- trigger cập nhật lại số lượng tồn khi sửa phiếu nhập
CREATE TRIGGER trg_CapNhatKhoKhiSuaPhieuNhap
ON CT_PHIEUNHAPTHUOC
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE T
    SET T.SoLuongTon = T.SoLuongTon - D.SoLuong + I.SoLuong
    FROM THUOC T INNER JOIN inserted I ON T.MaThuoc = I.MaThuoc
    INNER JOIN deleted D ON I.MaPN = D.MaPN AND I.MaThuoc = D.MaThuoc;
END;

-- tư đông tính thành tiền
CREATE TRIGGER trg_TinhThanhTienNhap
ON CT_PHIEUNHAPTHUOC
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO CT_PHIEUNHAPTHUOC
    (
        MaPN,
        MaThuoc,
        DonGiaNhap,
        SoLuong,
        ThanhTien
    )
    SELECT
        MaPN,
        MaThuoc,
        DonGiaNhap,
        SoLuong,
        DonGiaNhap * SoLuong
    FROM inserted;
END;
GO

-- 2. Tạo Procedure doanh thu bản vá lỗi NULL tuyệt đối
CREATE PROCEDURE sp_LapBaoCaoDoanhThu
    @Thang INT,
    @Nam INT
AS
BEGIN
    SET NOCOUNT ON;

    -- BƯỚC 1: Dọn dẹp dữ liệu cũ của tháng/năm đang kết xuất
    DELETE FROM CT_BCDOANHTHU WHERE Thang = @Thang AND Nam = @Nam;
    DELETE FROM BCDOANHTHU WHERE Thang = @Thang AND Nam = @Nam;

    -- BƯỚC 2: Tính toán Tổng doanh thu và Tổng số bệnh nhân của cả tháng đó
    DECLARE @TongDoanhThuThang DECIMAL(18,2) = 0;
    DECLARE @TongBenhNhanThang INT = 0;

    SELECT 
        -- Sử dụng ISNULL để ép kết quả SUM luôn ra số nếu tất cả hóa đơn bị trống hoặc NULL
        @TongDoanhThuThang = ISNULL(SUM(ISNULL(hd.TongTien, 0)), 0),
        @TongBenhNhanThang = COUNT(DISTINCT pk.MaPK)
    FROM PHIEUKHAM pk
    LEFT JOIN HOADON hd ON pk.MaPK = hd.MaPK
    WHERE MONTH(pk.NgayKham) = @Thang AND YEAR(pk.NgayKham) = @Nam;

    -- Nếu tháng này hoàn toàn không có một bệnh nhân nào đăng ký khám, thoát ngay
    IF @TongBenhNhanThang = 0 RETURN;

    -- BƯỚC 3: Lưu trữ dữ liệu tổng quan vào bảng BCDOANHTHU
    INSERT INTO BCDOANHTHU (Thang, Nam, TongDoanhThu, TongSoBenhNhan)
    VALUES (@Thang, @Nam, @TongDoanhThuThang, @TongBenhNhanThang);

    -- BƯỚC 4: Tính toán chi tiết từng ngày và đổ vào bảng CT_BCDOANHTHU (Xử lý an toàn TyLe)
    INSERT INTO CT_BCDOANHTHU (Ngay, Thang, Nam, SoBenhNhan, DoanhThu, TyLe)
    SELECT 
        DAY(pk.NgayKham) AS Ngay,
        @Thang AS Thang,
        @Nam AS Nam,
        COUNT(DISTINCT pk.MaPK) AS SoBenhNhan,
        ISNULL(SUM(ISNULL(hd.TongTien, 0)), 0) AS DoanhThu,
        
        -- VÁ LỖI TẠI ĐÂY: Nếu mẫu số bằng 0 hoặc phép tính ra NULL, hàm ISNULL ngoài cùng sẽ ép về 0.00
        ISNULL(
            CAST((ISNULL(SUM(ISNULL(hd.TongTien, 0)), 0) / NULLIF(@TongDoanhThuThang, 0)) AS DECIMAL(3,2)), 
            0.00
        ) AS TyLe

    FROM PHIEUKHAM pk
    LEFT JOIN HOADON hd ON pk.MaPK = hd.MaPK
    WHERE MONTH(pk.NgayKham) = @Thang AND YEAR(pk.NgayKham) = @Nam
    GROUP BY DAY(pk.NgayKham);

    PRINT N'Đã vá lỗi và lập xong Báo cáo Doanh thu tháng ' + CAST(@Thang AS VARCHAR) + '/' + CAST(@Nam AS VARCHAR);
END;
GO

-- 2. Tạo Trigger tối ưu: Tự động tăng số thứ tự theo ngày + Chặn quá tải
CREATE TRIGGER trg_TuDongTangVaKiemTraSoThuTu_PhieuKham
ON PHIEUKHAM
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    -- Nếu không có dòng nào được thêm thì bỏ qua
    IF NOT EXISTS (SELECT 1 FROM inserted) RETURN;

    -- BƯỚC 1: Tính toán và cập nhật số thứ tự tự động tăng theo từng ngày khám
    ;WITH CTE_MaxSTT AS (
        SELECT 
            NgayKham,
            ISNULL(MAX(SoThuTu), 0) AS MaxSTT
        FROM PHIEUKHAM
        WHERE MaPK NOT IN (SELECT MaPK FROM inserted) -- Chỉ tìm số thứ tự lớn nhất của các phiếu đã lưu trước đó
        GROUP BY NgayKham
    ),
    CTE_NewSTT AS (
        SELECT 
            i.MaPK,
            ISNULL(m.MaxSTT, 0) + ROW_NUMBER() OVER (PARTITION BY i.NgayKham ORDER BY i.MaPK) AS NewSoThuTu
        FROM inserted i
        LEFT JOIN CTE_MaxSTT m ON i.NgayKham = m.NgayKham
    )
    UPDATE pk
    SET pk.SoThuTu = n.NewSoThuTu
    FROM PHIEUKHAM pk
    JOIN CTE_NewSTT n ON pk.MaPK = n.MaPK;


    -- BƯỚC 2: Lấy giới hạn số bệnh nhân tối đa từ bảng THAMSO để kiểm tra
    DECLARE @SoBenhNhanToiDa INT;
    SELECT @SoBenhNhanToiDa = CAST(GiaTri AS INT) FROM THAMSO WHERE TenThamSo = 'SoBenhNhanToiDa';

    -- Nếu số thứ tự vừa cấp vượt quá giới hạn cấu hình (ví dụ: 40), hủy giao dịch ngay
    IF EXISTS (
        SELECT 1 
        FROM PHIEUKHAM pk
        JOIN inserted i ON pk.MaPK = i.MaPK
        WHERE pk.SoThuTu > @SoBenhNhanToiDa
    )
    BEGIN
        RAISERROR(N'Lỗi: Đã đạt giới hạn tối đa %d bệnh nhân trong ngày! Không thể tiếp nhận thêm.', 16, 1, @SoBenhNhanToiDa);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

CREATE TRIGGER trg_TuDongCapNhatBaoCaoDoanhThu
ON HOADON
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Khai báo các biến phục vụ vòng lặp duyệt qua từng tháng
    DECLARE @DuyetThang INT, @DuyetNam INT;

    -- Tạo một bảng tạm lưu danh sách duy nhất các cặp Tháng/Năm có biến động dữ liệu
    DECLARE @DanhSachThangNam TABLE (
        Thang INT,
        Nam INT,
        DaXuLy BIT DEFAULT 0
    );

    -- Gom toàn bộ Tháng/Năm từ dữ liệu Thêm/Sửa (inserted) hoặc Xóa (deleted)
    INSERT INTO @DanhSachThangNam (Thang, Nam)
    SELECT DISTINCT MONTH(NgayLap), YEAR(NgayLap) FROM inserted WHERE NgayLap IS NOT NULL
    UNION
    SELECT DISTINCT MONTH(NgayLap), YEAR(NgayLap) FROM deleted WHERE NgayLap IS NOT NULL;

    -- Vòng lặp: Duyệt qua từng cặp Tháng/Năm phát hiện được để chạy báo cáo doanh thu tương ứng
    WHILE EXISTS (SELECT 1 FROM @DanhSachThangNam WHERE DaXuLy = 0)
    BEGIN
        -- Lấy ra một cặp Tháng/Năm chưa được xử lý
        SELECT TOP 1 
            @DuyetThang = Thang, 
            @DuyetNam = Nam 
        FROM @DanhSachThangNam 
        WHERE DaXuLy = 0;

        -- Tiến hành gọi Procedure làm mới báo cáo cho riêng tháng/năm đó
        EXEC sp_LapBaoCaoDoanhThu @Thang = @DuyetThang, @Nam = @DuyetNam;

        -- Đánh dấu cặp Tháng/Năm này đã hoàn tất để chuyển sang cặp tiếp theo
        UPDATE @DanhSachThangNam 
        SET DaXuLy = 1 
        WHERE Thang = @DuyetThang AND Nam = @DuyetNam;
    END
END;
GO

CREATE PROCEDURE sp_LapBaoCaoSuDungThuoc
    @Thang INT,
    @Nam INT
AS
BEGIN
    -- Ngăn thông báo dòng ảnh hưởng làm rối Backend khi gọi API
    SET NOCOUNT ON;

    -- BƯỚC 1: Xóa dữ liệu cũ của tháng/năm đang chọn (tránh trùng lặp hoặc cộng dồn sai lệch)
    DELETE FROM BCSUDUNGTHUOC 
    WHERE Thang = @Thang AND Nam = @Nam;

    -- BƯỚC 2: Tổng hợp dữ liệu và đổ vào bảng báo cáo BCSUDUNGTHUOC
    INSERT INTO BCSUDUNGTHUOC (Thang, Nam, MaThuoc, SoLanDung, SoLuongDung, SoLuongNhap)
    SELECT 
        @Thang AS Thang,
        @Nam AS Nam,
        t.MaThuoc,
        
        -- 1. Số lần dùng: Đếm xem thuốc xuất hiện ở bao nhiêu Phiếu khám khác nhau trong tháng
        ISNULL(COUNT(DISTINCT pk.MaPK), 0) AS SoLanDung,
        
        -- 2. Số lượng dùng: Tổng số lượng thuốc mà bác sĩ đã kê đơn trong tháng
        ISNULL(SUM(ct.SoLuongThuoc), 0) AS SoLuongDung,
        
        -- 3. Số lượng nhập: Dùng Subquery để tính tổng số lượng đã nhập kho trong tháng
        ISNULL((
            SELECT SUM(ctn.SoLuong)
            FROM CT_PHIEUNHAPTHUOC ctn
            JOIN PHIEUNHAPTHUOC pn ON ctn.MaPN = pn.MaPN
            WHERE ctn.MaThuoc = t.MaThuoc 
              AND MONTH(pn.NgayNhap) = @Thang 
              AND YEAR(pn.NgayNhap) = @Nam
        ), 0) AS SoLuongNhap

    FROM THUOC t
    -- LEFT JOIN với chi tiết đơn thuốc để lấy được toàn bộ danh mục thuốc
    LEFT JOIN CT_PHIEUKHAM ct ON t.MaThuoc = ct.MaThuoc
    -- LEFT JOIN với phiếu khám để lọc đúng dòng thuộc Tháng và Năm đang tính toán
    LEFT JOIN PHIEUKHAM pk ON ct.MaPK = pk.MaPK 
        AND MONTH(pk.NgayKham) = @Thang 
        AND YEAR(pk.NgayKham) = @Nam
    
    GROUP BY t.MaThuoc
    
    -- BỘ LỌC THÔNG MINH: Chỉ lưu vào báo cáo những thuốc thực sự có phát sinh (có bán HOẶC có nhập)
    -- Giúp bảng báo cáo ngắn gọn, không bị tràn ngập những dòng toàn số 0
    HAVING COUNT(DISTINCT pk.MaPK) > 0 
       OR ISNULL((
            SELECT SUM(ctn.SoLuong)
            FROM CT_PHIEUNHAPTHUOC ctn
            JOIN PHIEUNHAPTHUOC pn ON ctn.MaPN = pn.MaPN
            WHERE ctn.MaThuoc = t.MaThuoc 
              AND MONTH(pn.NgayNhap) = @Thang 
              AND YEAR(pn.NgayNhap) = @Nam
          ), 0) > 0;

    PRINT N'Đã lập xong Báo cáo Sử dụng thuốc tháng ' + CAST(@Thang AS VARCHAR) + '/' + CAST(@Nam AS VARCHAR);
END;
GO

CREATE TRIGGER trg_TuDongCapNhatBaoCaoSuDungThuoc
ON CT_PHIEUKHAM
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Khai báo các biến phục vụ vòng lặp duyệt qua từng tháng
    DECLARE @DuyetThang INT, @DuyetNam INT;

    -- Tạo một bảng tạm lưu danh sách duy nhất các cặp Tháng/Năm có biến động đơn thuốc
    DECLARE @DanhSachThangNam TABLE (
        Thang INT,
        Nam INT,
        DaXuLy BIT DEFAULT 0
    );

    -- Lấy Tháng/Năm từ ngày khám của phiếu khám tương ứng với các chi tiết vừa biến động
    INSERT INTO @DanhSachThangNam (Thang, Nam)
    SELECT DISTINCT MONTH(pk.NgayKham), YEAR(pk.NgayKham)
    FROM PHIEUKHAM pk
    WHERE pk.MaPK IN (SELECT MaPK FROM inserted UNION SELECT MaPK FROM deleted);

    -- Vòng lặp: Duyệt qua từng cặp Tháng/Năm để cập nhật báo cáo sử dụng thuốc
    WHILE EXISTS (SELECT 1 FROM @DanhSachThangNam WHERE DaXuLy = 0)
    BEGIN
        -- Lấy ra một cặp Tháng/Năm chưa được xử lý
        SELECT TOP 1 
            @DuyetThang = Thang, 
            @DuyetNam = Nam 
        FROM @DanhSachThangNam 
        WHERE DaXuLy = 0;

        -- Tiến hành gọi Procedure lập báo cáo sử dụng thuốc (Procedure Vy đã tạo ở các bước trước)
        EXEC sp_LapBaoCaoSuDungThuoc @Thang = @DuyetThang, @Nam = @DuyetNam;

        -- Đánh dấu cặp Tháng/Năm này đã hoàn tất
        UPDATE @DanhSachThangNam 
        SET DaXuLy = 1 
        WHERE Thang = @DuyetThang AND Nam = @DuyetNam;
    END
END;
GO

CREATE TRIGGER trg_TuDongCapNhatBaoCaoThuocKhiNhapKho
ON CT_PHIEUNHAPTHUOC
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Khai báo các biến phục vụ vòng lặp duyệt qua từng tháng
    DECLARE @DuyetThang INT, @DuyetNam INT;

    -- Tạo một bảng tạm lưu danh sách duy nhất các cặp Tháng/Năm có biến động nhập kho
    DECLARE @DanhSachThangNam TABLE (
        Thang INT,
        Nam INT,
        DaXuLy BIT DEFAULT 0
    );

    -- Lấy Tháng/Năm từ Ngày Nhập của phiếu nhập tương ứng với các chi tiết vừa biến động
    INSERT INTO @DanhSachThangNam (Thang, Nam)
    SELECT DISTINCT MONTH(pn.NgayNhap), YEAR(pn.NgayNhap)
    FROM PHIEUNHAPTHUOC pn
    WHERE pn.MaPN IN (SELECT MaPN FROM inserted UNION SELECT MaPN FROM deleted);

    -- Vòng lặp: Duyệt qua từng cặp Tháng/Năm để cập nhật lại cột SoLuongNhap trong báo cáo
    WHILE EXISTS (SELECT 1 FROM @DanhSachThangNam WHERE DaXuLy = 0)
    BEGIN
        -- Lấy ra một cặp Tháng/Năm chưa được xử lý
        SELECT TOP 1 
            @DuyetThang = Thang, 
            @DuyetNam = Nam 
        FROM @DanhSachThangNam 
        WHERE DaXuLy = 0;

        -- Gọi lại đúng Procedure báo cáo thuốc để tính toán lại toàn bộ (cả Xuất lẫn Nhập)
        EXEC sp_LapBaoCaoSuDungThuoc @Thang = @DuyetThang, @Nam = @DuyetNam;

        -- Đánh dấu cặp Tháng/Năm này đã hoàn tất
        UPDATE @DanhSachThangNam 
        SET DaXuLy = 1 
        WHERE Thang = @DuyetThang AND Nam = @DuyetNam;
    END
END;
GO

CREATE FUNCTION dbo.fn_ChuanHoaTen (@InputString NVARCHAR(255))
RETURNS NVARCHAR(255)
AS
BEGIN
    DECLARE @Index INT = 1;
    DECLARE @Char NCHAR(1);
    DECLARE @OutputString NVARCHAR(255);

    -- Ép toàn bộ chuỗi về chữ thường trước (vd: nGUyễn vĂN a -> nguyễn văn a)
    SET @OutputString = LOWER(LTRIM(RTRIM(@InputString)));

    -- Vòng lặp duyệt qua từng chữ cái để viết hoa chữ cái đầu tiên và chữ sau khoảng trắng
    WHILE @Index <= LEN(@OutputString)
    BEGIN
        SET @Char = SUBSTRING(@OutputString, @Index, 1);
        
        IF @Index = 1 OR SUBSTRING(@OutputString, @Index - 1, 1) = ' '
        BEGIN
            SET @OutputString = STUFF(@OutputString, @Index, 1, UPPER(@Char));
        END
        
        SET @Index = @Index + 1;
    END

    RETURN @OutputString;
END;
GO



-----------------------------------------------------------
-- INSERT DATA
-----------------------------------------------------------


--1. CHUCVU
INSERT INTO CHUCVU (TenCV) VALUES
(N'Bác sĩ'),
(N'Lễ tân'),
(N'Admin');

--2. CHUYENKHOA
INSERT INTO CHUYENKHOA (TenCK) VALUES
(N'Nội tổng quát'),
(N'Tim mạch'),
(N'Y học cổ truyền'),
(N'Tai mũi họng'),
(N'Nhi khoa');


--3. NHANVIEN
INSERT INTO NHANVIEN (TenNV, CCCD, GioiTinh, NgaySinh, NgayBatDauLamViec, BangCapChungChi, DiaChi, SDT, Email, MaCV, MaCK) VALUES
(N'Trần Minh Phúc', '123456789001', 'Nam', '1988-06-25', '2012-03-01', N'Tiến Sĩ Y Học', N'456 Đường Lê Lợi, TP.HCM', '0912345678', 'tran.minh.phuc@clinic.com', 1, 1),
(N'Nguyễn Vũ Thùy Trâm', '123456789002', 'Nữ', '1995-07-18', '2018-05-12', N'Thạc Sĩ Y Khoa', N'Thủ Đức', '0901234562', 'tram@clinic.com', 1, 2),
(N'Dương Thanh Hiếu', '123456789003', 'Nam', '1992-09-12', '2017-08-01', N'Bác Sĩ Chuyên Khoa I', N'Quận 3', '0901234563', 'hieu@clinic.com', 1, 5),
(N'Nguyễn Trần Phương Vy', '123456789004', 'Nữ', '1996-02-20', '2019-11-15', N'Bác Sĩ Đa Khoa', N'Gò Vấp', '0901234565', 'vy@clinic.com', 1, 4),
(N'Trần Triệu Dân', '123456789005', 'Nam', '1994-11-08', '2016-06-20', N'Bác Sĩ Chuyên Khoa II', N'Bình Thạnh', '0901234561', 'dan@clinic.com', 1, 3),
(N'Nguyễn Văn Quản', '987654321098', 'Nam', '1980-01-01', '2010-01-01', NULL, N'456 Đường Lê Lợi, TP.HCM', '0912345678', 'admin@clinic.com', 3, NULL),
(N'Nguyễn Nhâm', '123456789012', 'Nữ', '1995-05-15', '2022-03-01', NULL, N'123 Đường Trần Hưng Đạo, TP.HCM', '0901234567', 'le.thi.thu@clinic.com', 2, NULL);


--4. TAIKHOAN
INSERT INTO TAIKHOAN (TenDangNhap, MatKhau, MaNV) VALUES
('admin', '123', 6),
('bacsi1', '123', 1),
('bacsi2', '123', 2),
('letan1', '123', 7);

--5. BENHNHAN
INSERT INTO BENHNHAN (TenBN, CCCD, GioiTinh, NgaySinh, DiaChi, SDT, Email) VALUES
(N'Nguyễn Thị Mai', '001234567890', N'Nữ', '2000-05-12', N'Thủ Đức', '0911111111', 'mai@gmail.com'),
(N'Trần Văn Nam', '001234567891', 'Nam', '1998-03-15', N'Quận 9', '0911111112', 'nam@gmail.com'),
(N'Lê Thị Hoa', '001234567892', N'Nữ', '2001-09-20', N'Dĩ An', '0911111113', 'hoa@gmail.com'),
(N'Phạm Văn Long', '001234567893', 'Nam', '1995-12-01', N'Bình Thạnh', '0911111114', 'long@gmail.com'),
(N'Đỗ Minh Anh', '001234567894', N'Nữ', '2002-07-25', N'Thủ Đức', '0911111115', 'anh@gmail.com'),
(N'Nguyễn Hoàng Bách', '001234567895', 'Nam', '1993-11-22', N'Bình Thạnh, TP.HCM', '0922222221', 'bach.nguyen@gmail.com'), 
(N'Vũ Hoàng Diệp',    '001234567896', N'Nữ',   '2004-02-05', N'Phú Nhuận, TP.HCM',  '0922222222', 'diep.vu@gmail.com'),   
(N'Phan Đình Tùng',   '001234567897', 'Nam', '1985-08-14', N'Tân Bình, TP.HCM',   '0922222223', 'tung.phan@gmail.com'); 


--6. LOAIBENH (loại bệnh)
INSERT INTO LOAIBENH (TenLoaiBenh) VALUES
-- Nội tổng quát (1-5 cũ + mở rộng)
(N'Cảm cúm'),                       -- 1
(N'Sốt'),                            -- 2
(N'Đau dạ dày'),                     -- 3
(N'Dị ứng'),                         -- 4
(N'Viêm họng'),                      -- 5
(N'Đau đầu'),                        -- 6
(N'Mất ngủ'),                        -- 7
(N'Táo bón'),                        -- 8
(N'Tiêu chảy'),                      -- 9
(N'Viêm loét dạ dày'),               -- 10
(N'Trào ngược dạ dày'),              -- 11
(N'Đái tháo đường'),                 -- 12
(N'Béo phì'),                        -- 13
(N'Thiếu máu'),                      -- 14
(N'Suy nhược cơ thể'),               -- 15
-- Tim Mạch
(N'Tăng huyết áp'),                  -- 16
(N'Hạ huyết áp'),                    -- 17
(N'Rối loạn nhịp tim'),              -- 18
(N'Suy tim'),                        -- 19
(N'Xơ vữa động mạch'),               -- 20
-- Hô Hấp
(N'Hen suyễn'),                      -- 21
(N'Viêm phế quản'),                  -- 22
(N'Viêm phổi'),                      -- 23
(N'COPD'),                           -- 24
(N'Viêm xoang'),                     -- 25
-- Tai Mũi Họng
(N'Viêm tai giữa'),                  -- 26
(N'Viêm amidan'),                    -- 27
(N'Polyp mũi'),                      -- 28
(N'Ù tai'),                          -- 29
-- Nhi Khoa
(N'Sốt xuất huyết'),                 -- 30
(N'Tay chân miệng'),                 -- 31
(N'Sởi'),                            -- 32
(N'Thủy đậu'),                       -- 33
(N'Rối loạn tiêu hóa trẻ em'),       -- 34
-- Thần Kinh
(N'Đau nửa đầu (Migraine)'),         -- 35
(N'Chóng mặt'),                      -- 36
(N'Động kinh'),                      -- 37
(N'Tê liệt'),                        -- 38
-- Y Học Cổ Truyền
(N'Đau lưng'),                       -- 39
(N'Đau cổ vai gáy'),                 -- 40
(N'Đau khớp'),                       -- 41
(N'Thoái hóa cột sống'),             -- 42
-- Mắt
(N'Viêm kết mạc'),                   -- 43
(N'Khô mắt'),                        -- 44
(N'Cận thị'),                        -- 45
-- Nha Khoa
(N'Sâu răng'),                       -- 46
(N'Viêm nướu'),                      -- 47
(N'Viêm nha chu'),                   -- 48
-- Da liễu
(N'Mề đay mãn tính'),                -- 49
(N'Viêm da tiếp xúc'),               -- 50
(N'Nấm da'),                         -- 51
(N'Zona thần kinh'),                 -- 52
-- Nhiễm trùng
(N'Nhiễm khuẩn đường tiết niệu'),    -- 53
(N'Nhiễm giun sán'),                 -- 54
(N'Nhiễm trùng da'),                 -- 55
(N'Viêm gan');                       -- 56

--7. CACHDUNG
INSERT INTO CACHDUNG (MoTaCachDung) VALUES
(N'Uống sau ăn'),
(N'Uống trước ăn'),
(N'Ngày 2 lần'),
(N'Ngày 3 lần'),
(N'Khi cần');

--8. DONVITINH
INSERT INTO DONVITINH (TenDVT) VALUES
(N'Viên'),
(N'Chai'),
(N'Gói'),
(N'Ống'),
(N'Tuýp');


--9. THUOC
INSERT INTO THUOC (TenThuoc, DonGiaBan, SoLuongTon, MaCachDung, MaDVT) VALUES
(N'Paracetamol',       5000, 100, 1, 1),
(N'Amoxicillin',      10000,  80, 3, 1),
(N'Vitamin C',         3000, 200, 5, 1),
(N'Efferalgan',        7000, 120, 2, 1),
(N'Sirô ho',          25000,  50, 4, 2),
(N'Ibuprofen',         2000,  50, 3, 1),
(N'Aspirin',            800,  80, 1, 1),
(N'Metformin',         1500, 120, 3, 1),
(N'Lisinopril',        2500,  90, 1, 1),
(N'Omeprazole',        2000,  75, 1, 1),
(N'Cephalexin',        3500,  55, 5, 1),
(N'Loratadine',        1200, 110, 1, 1),
(N'Fluticasone',       5000,  30, 3, 2),
(N'Salbutamol',        4500,  25, 4, 2),
(N'Dexamethasone',     1800,  40, 3, 1),
(N'Ciprofloxacin',     2200,  65, 3, 1),
(N'Azithromycin',      3200,  50, 1, 1),
(N'Ambroxol',           900, 150, 4, 1),
(N'Guaifenesin',       4000,  35, 3, 2),
(N'Hydrocodone',       4800,  30, 5, 1),
(N'Diphenhydramine',   1100,  85, 1, 1),
(N'Cetirizine',         950, 130, 1, 1),
(N'Acyclovir',         3800,  45, 5, 1),
(N'Nystatin',          5500,  20, 3, 2),
(N'Albendazole',       2300,  55, 3, 1),
(N'Mebendazole',       2100,  60, 4, 1),
(N'Pyrantel Pamoate',  4200,  25, 1, 2),
(N'Tetracycline',      1900,  70, 5, 1),
(N'Doxycycline',       2400,  65, 3, 1),
(N'Clarithromycin',    3100,  50, 3, 1),
(N'Clindamycin',       2600,  55, 4, 1),
(N'Metronidazole',     1400,  80, 4, 1);

--10.PHIEUKHAM
INSERT INTO PHIEUKHAM(MaNV, MaBN) VALUES
(1, 1),
(2, 2),
(3, 3),
(1, 4),
(2, 5),
(1, 6),
(2, 7),
(4, 8);


--11. CT_PHIEUKHAM
INSERT INTO CT_PHIEUKHAM (MaPK, MaThuoc, SoLuongThuoc, DonGiaBan, ThanhTien) VALUES
(1, 1, 2, 5000, 10000),
(1, 3, 1, 3000, 3000),
(2, 2, 1, 10000, 10000),
(3, 5, 1, 25000, 25000),
(4, 4, 2, 7000, 14000),
(5, 1, 1, 5000, 5000);

-- Additional sample prescriptions for testing
INSERT INTO CT_PHIEUKHAM (MaPK, MaThuoc, SoLuongThuoc, DonGiaBan, ThanhTien) VALUES
(1, 2, 1, 10000, 10000),
(2, 1, 3, 5000, 15000),
(2, 4, 1, 7000, 7000),
(3, 3, 2, 3000, 6000),
(3, 1, 1, 5000, 5000),
(4, 5, 2, 25000, 50000),
(4, 2, 1, 10000, 10000),
(5, 3, 5, 3000, 15000),
(5, 4, 1, 7000, 7000),
(6, 2, 2, 10000, 20000), 
(6, 3, 3, 3000,  9000),  
(7, 1, 4, 5000,  20000), 
(7, 4, 2, 7000,  14000), 
(8, 1, 2, 5000,  10000), 
(8, 2, 2, 10000, 20000);

--12. HOADON
INSERT INTO HOADON (MaPK, TongTienThuoc, TienKham, TongTien) VALUES
(1, 13000, 30000, 43000),
(2, 10000, 30000, 40000),
(3, 15000, 30000, 45000),
(4, 14000, 30000, 44000),
(5, 25000, 30000, 55000),
(6, 29000, 30000, 59000),
(7, 34000, 30000, 64000),
(8, 30000, 30000, 60000);

INSERT INTO THAMSO (TenThamSo, GiaTri) VALUES
('SoBenhNhanToiDa',   40),
('TienKham',          30000),
('TyLeTinhDonGiaBan', 1.5),
('ThoiGianLuuLichSuKham', 5);

--13. CT_LOAIBENH
INSERT INTO CT_LOAIBENH (MaPK, MaLoaiBenh, TrieuChung, GhiChu) VALUES
(1, 1, N'Sốt cao, đau đầu, mệt mỏi', N'Bệnh thường gặp vào mùa đông'),
(2, 2, N'Sốt nhẹ, đau họng', N'Bệnh thường gặp vào mùa hè'),
(3, 3, N'Đau vùng thượng vị, buồn nôn', N'Bệnh thường gặp khi ăn uống không hợp vệ sinh'),
(4, 4, N'Ngứa da, nổi mề đay', N'Bệnh thường gặp khi tiếp xúc với dị nguyên'),
(5, 5, N'Đau họng, khó nuốt', N'Bệnh thường gặp vào mùa lạnh'),
(6, 3, N'Đau âm ỉ vùng thượng vị, ợ chua', N'Tránh ăn đồ cay nóng'),
(7, 1, N'Hắt hơi liên tục, chảy nước mũi', N'Nghỉ ngơi, uống nhiều nước ấm'),
(8, 5, N'Đau rát họng, nuốt vướng, sốt nhẹ', N'Súc miệng nước muối sinh lý');

-- 14. PHIEUNHAP
INSERT INTO PHIEUNHAPTHUOC (NgayNhap, TongTienNhap) VALUES 
('2026-05-02', 2900000.00), -- MaPN: 1
('2026-05-15', 1100000.00); -- MaPN: 2
GO

-- Nạp chi tiết số lượng thuốc nhập kho tương ứng
-- Công thức: DonGiaNhap * SoLuong = ThanhTien
INSERT INTO CT_PHIEUNHAPTHUOC (MaPN, MaThuoc, DonGiaNhap, SoLuong, ThanhTien) VALUES
-- Đợt nhập ngày 02/05 (Nhập Paracetamol và Amoxicillin)
(1, 1, 4000.00, 500, 2000000.00),  -- Nhập 500 viên Paracetamol
(1, 2, 9000.00, 100, 900000.00),   -- Nhập 100 viên Amoxicillin

-- Đợt nhập ngày 15/05 (Nhập thêm Vitamin C và Sirô ho)
(2, 3, 2000.00, 300, 600000.00),   -- Nhập 300 viên Vitamin C
(2, 5, 25000.00, 20, 500000.00);   -- Nhập 20 chai Sirô ho
GO
-- Tạo thêm bệnh nhân mới để khám bệnh
INSERT INTO BENHNHAN (TenBN, CCCD, GioiTinh, NgaySinh, DiaChi, SDT, Email) VALUES
(N'Vũ Hoàng Long', '001234567899', 'Nam', '1990-04-12', N'Quận 1, TP.HCM', '0933333331', 'long.vu@gmail.com'); -- MaBN: 9
GO

-- Lập phiếu khám cho bệnh nhân số 9 vào ngày 25/05/2026
INSERT INTO PHIEUKHAM(MaNV, MaBN, NgayKham) VALUES 
(1, 9, '2026-05-25'); -- MaPK: 9 (Trigger tự nhảy STT)
GO

-- Kê đơn thuốc cho phiếu khám số 9 này
INSERT INTO CT_PHIEUKHAM (MaPK, MaThuoc, SoLuongThuoc, DonGiaBan, ThanhTien) VALUES
(9, 1, 10, 5000.00, 50000.00), -- Kê 10 viên Paracetamol
(9, 5, 2, 25000.00, 50000.00);  -- Kê 2 chai Sirô ho
GO

