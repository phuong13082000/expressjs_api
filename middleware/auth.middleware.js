import dotenv from 'dotenv';
import jwt from 'jsonwebtoken'
import UserModel from "../models/user.model.js";

dotenv.config();

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.accessToken || req?.headers?.authorization?.split(" ")[1]

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Provide token"
            })
        }

        const decode = jwt.verify(token, process.env.SECRET_KEY_ACCESS_TOKEN)

        if (!decode) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access",
            })
        }

        const user = await UserModel.findById(decode.id);

        if (!user || !user.refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Session expired",
            });
        }

        req.userId = decode.id

        next()
    } catch (error) {
        switch (error.name) {
            case "TokenExpiredError":
                return res.status(401).json({
                    success: false,
                    message: "Token expired"
                });
            case "JsonWebTokenError":
                return res.status(401).json({
                    success: false,
                    message: "Invalid token"
                });
            default:
                return res.status(500).json({
                    success: false,
                    message: "Authentication failed"
                });
        }
    }
}

export default authMiddleware
