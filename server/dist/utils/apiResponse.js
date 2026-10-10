export const sendSuccess = (res, statusCode, message, data) => {
    const response = {
        success: true,
        message,
        data,
    };
    res.status(statusCode).json(response);
};
