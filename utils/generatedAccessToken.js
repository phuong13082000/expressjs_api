import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export const generatedAccessToken = async (userId) => {
    const secretKey = process.env.SECRET_KEY_ACCESS_TOKEN;

    if (!secretKey) {
        throw new Error("SECRET_KEY_ACCESS_TOKEN is not defined");
    }

    return await jwt.sign({id: userId}, secretKey, {expiresIn: '5h'})
}
