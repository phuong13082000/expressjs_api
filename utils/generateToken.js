import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import UserModel from "../models/user.model.js";

dotenv.config()

class generateToken {
    access(userId) {
        const accessKey = process.env.SECRET_KEY_ACCESS_TOKEN;

        if (!accessKey) {
            throw new Error("SECRET_KEY_ACCESS_TOKEN is not defined");
        }

        return jwt.sign({ id: userId }, accessKey, { expiresIn: '5h' });
    }

    async refresh(userId) {
        const refreshKey = process.env.SECRET_KEY_REFRESH_TOKEN;

        if (!refreshKey) {
            throw new Error("SECRET_KEY_REFRESH_TOKEN is not defined");
        }

        const token = jwt.sign({ id: userId }, refreshKey, { expiresIn: '7d' })

        await UserModel.updateOne({ _id: userId }, { refreshToken: token })

        return token
    }
}

export default new generateToken();
