import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import UserModel from "../models/user.model.js";

dotenv.config()

export const generatedAccessToken = (userId) => {
    const secretKey = process.env.SECRET_KEY_ACCESS_TOKEN;

    if (!secretKey) {
        throw new Error("SECRET_KEY_ACCESS_TOKEN is not defined");
    }

    return jwt.sign({id: userId}, secretKey, {expiresIn: '5h'});
}

export const generatedRefreshToken = async (userId) => {
    const secretKey = process.env.SECRET_KEY_REFRESH_TOKEN;

    if (!secretKey) {
        throw new Error("SECRET_KEY_REFRESH_TOKEN is not defined");
    }

    const token = await jwt.sign({id: userId}, secretKey, {expiresIn: '7d'})

    await UserModel.updateOne({_id: userId}, {refresh_token: token})

    return token
}
