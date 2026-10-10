import AppError from "../utils/AppError.js";
const notFound = (req, _res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
};
export default notFound;
