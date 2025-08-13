import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

import UserModel from "../models/user.model.js";

dotenv.config()

class generateToken {
    access(userId) {
        return jwt.sign(
            {id: userId},
            process.env.SECRET_KEY_ACCESS_TOKEN,
            {expiresIn: '5h'}
        );
    }

    async refresh(userId) {
        const token = jwt.sign(
            {id: userId},
            process.env.SECRET_KEY_REFRESH_TOKEN,
            {expiresIn: '7d'}
        )

        await UserModel.updateOne({_id: userId}, {refreshToken: token})

        return token
    }
}

export default new generateToken();
