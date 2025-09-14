import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import UserModel from "../models/user.model.js";

dotenv.config()

class Token {
    static genAccess(userId) {
        return jwt.sign({id: userId}, process.env.SECRET_KEY_ACCESS_TOKEN, {expiresIn: '5h'});
    }

    static async genRefresh(userId) {
        const token = jwt.sign({id: userId}, process.env.SECRET_KEY_REFRESH_TOKEN, {expiresIn: '7d'})

        await UserModel.updateOne({_id: userId}, {refreshToken: token})

        return token
    }

    static verifyRefresh(refreshToken) {
        return jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)
    }
}

export default Token;
