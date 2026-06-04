-- Migration: Sắp xếp lại PHIEUKHAM và tạo Trigger tự động tính SoThuTu
-- Ngày: 2026-06-01
-- Mục đích: Sắp xếp dữ liệu phiếu khám, xóa DEFAULT constraint, tạo trigger

USE QuanLyPhongMachTu;

-- Bước 1: Xóa trigger cũ nếu tồn tại
IF OBJECT_ID('trg_PHIEUKHAM_CalculateSoThuTu', 'TR') IS NOT NULL
    DROP TRIGGER trg_PHIEUKHAM_CalculateSoThuTu;
GO

-- Bước 2: Xóa DEFAULT constraint từ SoThuTu nếu tồn tại
IF OBJECT_ID('DF_PHIEUKHAM_SoThuTu', 'D') IS NOT NULL
    ALTER TABLE PHIEUKHAM DROP CONSTRAINT DF_PHIEUKHAM_SoThuTu;
GO

-- Bước 3: Tạo bảng tạm để lưu dữ liệu sắp xếp
IF OBJECT_ID('tempdb..#PhieuKhamSorted') IS NOT NULL 
    DROP TABLE #PhieuKhamSorted;

CREATE TABLE #PhieuKhamSorted (
    RowNum INT,
    MaPK INT,
    MaNV INT,
    MaBN INT,
    NgayKham DATE,
    SoThuTu INT
);

-- Bước 4: Chèn dữ liệu sắp xếp vào bảng tạm
INSERT INTO #PhieuKhamSorted
SELECT 
    ROW_NUMBER() OVER (ORDER BY NgayKham ASC, MaPK ASC) AS RowNum,
    MaPK,
    MaNV,
    MaBN,
    NgayKham,
    ROW_NUMBER() OVER (PARTITION BY NgayKham ORDER BY MaPK ASC) AS SoThuTu
FROM PHIEUKHAM;

-- Bước 5: Xóa dữ liệu cũ
DELETE FROM PHIEUKHAM;

-- Bước 6: Vô hiệu hóa IDENTITY để thêm dữ liệu mới với MaPK đúng
SET IDENTITY_INSERT PHIEUKHAM ON;

-- Bước 7: Chèn dữ liệu sắp xếp vào bảng gốc
INSERT INTO PHIEUKHAM (MaPK, MaNV, MaBN, NgayKham, SoThuTu)
SELECT 
    RowNum,
    MaNV,
    MaBN,
    NgayKham,
    SoThuTu
FROM #PhieuKhamSorted
ORDER BY RowNum ASC;

-- Bước 8: Kích hoạt lại IDENTITY
SET IDENTITY_INSERT PHIEUKHAM OFF;

-- Bước 9: Đặt lại seed của IDENTITY
DECLARE @MaxId INT;
SELECT @MaxId = MAX(MaPK) FROM PHIEUKHAM;
IF @MaxId IS NULL
    SET @MaxId = 0;
DBCC CHECKIDENT ('PHIEUKHAM', RESEED, @MaxId);

-- Bước 10: Xóa bảng tạm
DROP TABLE #PhieuKhamSorted;
GO

-- Bước 11: Tạo trigger AFTER INSERT để tự động tính SoThuTu cho phiếu mới
CREATE TRIGGER trg_PHIEUKHAM_CalculateSoThuTu
ON PHIEUKHAM
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Cập nhật SoThuTu cho các record vừa được INSERT
    -- Tính số thứ tự dựa trên NgayKham và MaPK
    UPDATE pk
    SET SoThuTu = rn.RowNum
    FROM PHIEUKHAM pk
    INNER JOIN (
        SELECT 
            MaPK,
            ROW_NUMBER() OVER (PARTITION BY NgayKham ORDER BY MaPK ASC) AS RowNum
        FROM PHIEUKHAM
    ) rn ON pk.MaPK = rn.MaPK
    WHERE pk.MaPK IN (SELECT MaPK FROM inserted);
END;
GO

-- Bước 12: Kiểm tra kết quả
SELECT MaPK, MaNV, MaBN, NgayKham, SoThuTu 
FROM PHIEUKHAM
ORDER BY NgayKham ASC, SoThuTu ASC;
