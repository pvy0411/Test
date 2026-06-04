-- Migration: Cập nhật SoThuTu cho toàn bộ dữ liệu mà không xóa MaPK
-- Ngày: 2026-06-01

USE QuanLyPhongMachTu;

-- Cập nhật SoThuTu cho TẤT CẢ các record dựa trên NgayKham và MaPK
UPDATE PHIEUKHAM
SET SoThuTu = rn.RowNum
FROM PHIEUKHAM pk
INNER JOIN (
    SELECT 
        MaPK,
        ROW_NUMBER() OVER (PARTITION BY NgayKham ORDER BY MaPK ASC) AS RowNum
    FROM PHIEUKHAM
) rn ON pk.MaPK = rn.MaPK;

-- Kiểm tra kết quả
SELECT MaPK, MaNV, MaBN, NgayKham, SoThuTu 
FROM PHIEUKHAM
ORDER BY NgayKham ASC, SoThuTu ASC;
