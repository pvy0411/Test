USE QuanLyPhongMachTu;
GO

-- 1) Add new columns (safe if rerun)
IF COL_LENGTH('NHANVIEN', 'CCCD') IS NULL
BEGIN
    ALTER TABLE NHANVIEN ADD CCCD VARCHAR(12) NULL;
END
GO

IF COL_LENGTH('NHANVIEN', 'NgaySinh') IS NULL
BEGIN
    ALTER TABLE NHANVIEN ADD NgaySinh DATE NULL;
END
GO

IF COL_LENGTH('NHANVIEN', 'NgayBatDauLamViec') IS NULL
BEGIN
    ALTER TABLE NHANVIEN ADD NgayBatDauLamViec DATE NULL;
END
GO

IF COL_LENGTH('NHANVIEN', 'BangCapChungChi') IS NULL
BEGIN
    ALTER TABLE NHANVIEN ADD BangCapChungChi NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('NHANVIEN', 'DiaChi') IS NULL
BEGIN
    ALTER TABLE NHANVIEN ADD DiaChi NVARCHAR(255) NULL;
END
GO

IF COL_LENGTH('NHANVIEN', 'Email') IS NULL
BEGIN
    ALTER TABLE NHANVIEN ADD Email VARCHAR(100) NULL;
END
GO

-- 2) Backfill NgaySinh from NamSinh (yyyy-01-01)
IF COL_LENGTH('NHANVIEN', 'NamSinh') IS NOT NULL
BEGIN
    UPDATE NHANVIEN
    SET NgaySinh = DATEFROMPARTS(NamSinh, 1, 1)
    WHERE NgaySinh IS NULL AND NamSinh IS NOT NULL;
END
GO

-- 3) Ensure NgaySinh is not NULL before enforcing constraint
UPDATE NHANVIEN
SET NgaySinh = '2000-01-01'
WHERE NgaySinh IS NULL;
GO

-- 3.0) Ensure NgayBatDauLamViec is not NULL
UPDATE NHANVIEN
SET NgayBatDauLamViec = '2020-01-01'
WHERE NgayBatDauLamViec IS NULL;
GO

-- 3.1) Backfill missing CCCD and Email with generated values
DECLARE @baseCccd BIGINT;
SELECT @baseCccd = ISNULL(
    MAX(CASE WHEN CCCD NOT LIKE '%[^0-9]%' THEN CAST(CCCD AS BIGINT) END),
    100000000000
)
FROM NHANVIEN;

;WITH MissingCccd AS (
    SELECT MaNV, ROW_NUMBER() OVER (ORDER BY MaNV) AS rn
    FROM NHANVIEN
    WHERE CCCD IS NULL OR LTRIM(RTRIM(CCCD)) = ''
)
UPDATE NV
SET CCCD = RIGHT('000000000000' + CAST(@baseCccd + MC.rn AS VARCHAR(12)), 12)
FROM NHANVIEN NV
JOIN MissingCccd MC ON NV.MaNV = MC.MaNV;

;WITH MissingEmail AS (
    SELECT MaNV, ROW_NUMBER() OVER (ORDER BY MaNV) AS rn
    FROM NHANVIEN
    WHERE Email IS NULL OR LTRIM(RTRIM(Email)) = ''
)
UPDATE NV
SET Email = CONCAT('user', RIGHT('0000' + CAST(ME.rn AS VARCHAR(4)), 4), '@clinic.com')
FROM NHANVIEN NV
JOIN MissingEmail ME ON NV.MaNV = ME.MaNV;
GO

-- 3.2) Backfill missing DiaChi with generated values
;WITH MissingDiaChi AS (
    SELECT MaNV, ROW_NUMBER() OVER (ORDER BY MaNV) AS rn
    FROM NHANVIEN
    WHERE DiaChi IS NULL OR LTRIM(RTRIM(DiaChi)) = ''
)
UPDATE NV
SET DiaChi = CONCAT('Address ', RIGHT('0000' + CAST(MD.rn AS VARCHAR(4)), 4), ', TP.HCM')
FROM NHANVIEN NV
JOIN MissingDiaChi MD ON NV.MaNV = MD.MaNV;
GO

-- 4) Enforce NOT NULL on NgaySinh
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('NHANVIEN')
      AND name = 'NgaySinh'
      AND is_nullable = 1
)
BEGIN
    ALTER TABLE NHANVIEN ALTER COLUMN NgaySinh DATE NOT NULL;
END
GO

-- 4.0) Enforce NOT NULL on NgayBatDauLamViec
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('NHANVIEN')
      AND name = 'NgayBatDauLamViec'
      AND is_nullable = 1
)
BEGIN
    ALTER TABLE NHANVIEN ALTER COLUMN NgayBatDauLamViec DATE NOT NULL;
END
GO

-- 4.1) Ensure GioiTinh supports Unicode (NVARCHAR)
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('NHANVIEN')
      AND name = 'GioiTinh'
      AND system_type_id = TYPE_ID('varchar')
)
BEGIN
    ALTER TABLE NHANVIEN ALTER COLUMN GioiTinh NVARCHAR(3) NOT NULL;
END
GO

IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID('BENHNHAN')
      AND name = 'GioiTinh'
      AND system_type_id = TYPE_ID('varchar')
)
BEGIN
    ALTER TABLE BENHNHAN ALTER COLUMN GioiTinh NVARCHAR(3) NOT NULL;
END
GO

-- 4.2) Normalize GioiTinh values (fix corrupted characters like N?)
UPDATE NHANVIEN
SET GioiTinh = CASE
    WHEN GioiTinh IN (N'Nữ', N'Nu', N'N?') THEN N'Nữ'
    WHEN GioiTinh IN (N'Nam') THEN N'Nam'
    ELSE GioiTinh
END;
GO

UPDATE BENHNHAN
SET GioiTinh = CASE
    WHEN GioiTinh IN (N'Nữ', N'Nu', N'N?') THEN N'Nữ'
    WHEN GioiTinh IN (N'Nam') THEN N'Nam'
    ELSE GioiTinh
END;
GO

-- 5) Drop NamSinh if it exists
IF COL_LENGTH('NHANVIEN', 'NamSinh') IS NOT NULL
BEGIN
    ALTER TABLE NHANVIEN DROP COLUMN NamSinh;
END
GO

-- 6) Add filtered unique index for CCCD if missing (allows multiple NULLs)
IF NOT EXISTS (
    SELECT 1
    FROM sys.indexes
    WHERE name = 'UX_NHANVIEN_CCCD_NOT_NULL'
      AND object_id = OBJECT_ID('NHANVIEN')
)
BEGIN
    CREATE UNIQUE INDEX UX_NHANVIEN_CCCD_NOT_NULL
    ON NHANVIEN (CCCD)
    WHERE CCCD IS NOT NULL;
END
GO
