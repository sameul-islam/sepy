import AppError from "../utils/AppError.js";
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            body: req.body,
            params: req.params,
            query: req.query,
        });
        if (!result.success) {
            const details = result.error.issues.map((issue) => ({
                path: issue.path.join("."),
                message: issue.message,
            }));
            next(new AppError("Validation failed", 400, details));
            return;
        }
        res.locals.validatedData = result.data;
        next();
    };
};
export default validate;
