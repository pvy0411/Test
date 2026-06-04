const SendSuccess = (res, message, data = null, meta = null, statusCode = 200) => {
    const response = { status: 'success', message };
    if (data !== null) response.data = data;
    if (meta !== null) response.meta = meta;
    return res.status(statusCode).json(response);
};

const SendFail = (res, message, errors = null, statusCode = 400) => {
    const response = { status: 'fail', message };
    if (errors !== null) response.errors = errors;
    return res.status(statusCode).json(response);
};

const SendError = (res, message = 'Lỗi máy chủ nội bộ', statusCode = 500) => {
    return res.status(statusCode).json({
        status: 'error',
        message
    });
};

module.exports = { SendSuccess, SendFail, SendError };
