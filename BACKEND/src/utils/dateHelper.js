// Định dang ngày tháng cho DB (SQL Server chấp nhận định dạng YYYY-MM-DD)
const GetDateForDB = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`; 
};

// Định dạng ngày tháng cho hiển thị cho người dùng (DD-MM-YYYY)
const GetDateForDisplay = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    
    return `${day}-${month}-${year}`; 
};

module.exports = {
    GetDateForDB,
    GetDateForDisplay
};