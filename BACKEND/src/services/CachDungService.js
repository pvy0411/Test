const CachDungRepo = require('../repositories/CachDungRepo');

exports.GetAll = async () => CachDungRepo.GetAll();

exports.GetById = async (id) => {
    const data = await CachDungRepo.GetById(id);
    if (!data) 
        throw { status: 404, message: 'Không tìm thấy cách dùng' };
    return data;
};

exports.Create = async (body) => {
    const { MoTaCachDung } = body;
    if ( !MoTaCachDung)
        throw { status: 400, message: 'Mô tả cách dùng không được để trống' };
    const ID = await CachDungRepo.Create({ MoTaCachDung });
    return CachDungRepo.GetById(ID);
};

exports.Update = async (id, body) => {
    const { MoTaCachDung } = body;
    if (!MoTaCachDung) 
        throw { status: 400, message: 'Mô tả cách dùng không được để trống' };
    const existing = await CachDungRepo.GetById(id);
    if (!existing) 
        throw { status: 404, message: 'Không tìm thấy cách dùng' };
    await CachDungRepo.Update(id, { MoTaCachDung });
    return CachDungRepo.GetById(id);
};

exports.Delete = async (id) => {
    const existing = await CachDungRepo.GetById(id);
    if (!existing) 
        throw { status: 404, message: 'Không tìm thấy cách dùng' };
    const used = await CachDungRepo.IsUsed(id);
    if (used) 
        throw { status: 400, message: 'Không thể xóa do đang được sử dụng' };
    await CachDungRepo.Delete(id);
};