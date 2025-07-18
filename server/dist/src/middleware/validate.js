"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                res.status(400).json({
                    errors: error.errors.map((err) => ({
                        path: err.path,
                        message: err.message,
                    })),
                });
            }
            else {
                res.status(500).json({ error: 'Internal server error' });
            }
        }
    };
};
exports.validateRequest = validateRequest;
