import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import UserModel from "../models/user.model.js"

dotenv.config()

export const generatedRefreshToken = async (userId) => {
    const secretKey = process.env.SECRET_KEY_REFRESH_TOKEN;

    if (!secretKey) {
        throw new Error("SECRET_KEY_REFRESH_TOKEN is not defined");
    }

    const token = await jwt.sign({id: userId}, secretKey, {expiresIn: '7d'})

    await UserModel.updateOne({_id: userId}, {refresh_token: token})

    return token
}
