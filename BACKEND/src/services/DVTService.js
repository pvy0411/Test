const DonViTinhRepo = require('../repositories/DVTRepo');

exports.GetAll = async () => DonViTinhRepo.GetAll();

exports.GetById = async (id) => {
    const data = await DonViTinhRepo.GetById(id);
    if (!data) 
        throw { status: 404, message: 'Không tìm thấy đơn vị tính' };
    return data;
};

exports.Create = async (body) => {
    const { TenDVT } = body;
    if (!TenDVT)
        throw { status: 400, message: 'Tên đơn vị tính không được để trống' };
    await DonViTinhRepo.Create({ TenDVT });
    // Lấy đơn vị tính vừa tạo để trả về
    return await DonViTinhRepo.GetByName(TenDVT);
};

exports.Update = async (id, body) => {
    const { TenDVT } = body;
    if (!TenDVT) 
        throw { status: 400, message: 'Tên đơn vị tính không được để trống' };
    const existing = await DonViTinhRepo.GetById(id);
    if (!existing) 
        throw { status: 404, message: 'Không tìm thấy đơn vị tính' };
    await DonViTinhRepo.Update(id, { TenDVT });
    return DonViTinhRepo.GetById(id);
};

exports.Delete = async (id) => {
    const existing = await DonViTinhRepo.GetById(id);
    if (!existing) 
        throw { status: 404, message: 'Không tìm thấy đơn vị tính' };
    const used = await DonViTinhRepo.IsUsed(id);
    if (used) 
        throw { status: 400, message: 'Không thể xóa do đang được sử dụng' };
    await DonViTinhRepo.Delete(id);
};