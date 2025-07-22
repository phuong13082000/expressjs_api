export const validateMiddleware = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const { fieldErrors } = result.error.flatten();

        return res.status(400).json({
            success: false,
            message: fieldErrors,
        })
    }

    req.body = result.data;
    next();
}
