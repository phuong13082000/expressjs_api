import dotenv from "dotenv";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'

import UserModel from '../models/user.model.js'
import {generatedAccessToken} from '../utils/generatedAccessToken.js'
import {generatedRefreshToken} from '../utils/generatedRefreshToken.js'
import {saveImage} from "../utils/uploadImageLocal.js";

dotenv.config();

export async function registerController(req, res) {
    try {
        const {name, email, password} = req.body

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Provide email, name, password",
            })
        }

        const user = await UserModel.findOne({email})

        if (user) {
            return res.json({
                success: false,
                message: "Already register email",
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(password, salt)

        const payload = {
            name,
            email,
            password: hashPassword
        }

        const newUser = new UserModel(payload)
        const save = await newUser.save()

        return res.json({
            success: true,
            data: save,
            message: "User register successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function verifyEmailController(req, res) {
    try {
        const {code} = req.body

        const user = await UserModel.findOne({_id: code})

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid code",
            })
        }

        await UserModel.updateOne({_id: code}, {verify_email: true})

        return res.json({
            success: true,
            message: "Verify email done",
        })
    } catch (error) {
        return res.status(500).json({
            success: true,
            message: error.message || error,
        })
    }
}

export async function loginController(req, res) {
    try {
        const {email, password} = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
            })
        }

        const user = await UserModel.findOne({email})

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            })
        }

        if (user.status !== "Active") {
            return res.status(400).json({
                success: false,
                message: "Your account is not active. Contact the administrator.",
            })
        }

        const checkPassword = await bcryptjs.compare(password, user.password)

        if (!checkPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            })
        }

        const accessToken = await generatedAccessToken(user._id)
        const refreshToken = await generatedRefreshToken(user._id)

        await UserModel.findByIdAndUpdate(user?._id, {last_login_date: new Date()})

        const cookiesOption = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        };

        res.cookie('accessToken', accessToken, cookiesOption)
        res.cookie('refreshToken', refreshToken, cookiesOption)

        return res.json({
            success: true,
            data: {
                accessToken: accessToken
            },
            message: "Login successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal Server Error',
        })
    }
}

export async function logoutController(req, res) {
    try {
        const userid = req.userId

        const cookiesOption = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
        }

        res.clearCookie("accessToken", cookiesOption)
        res.clearCookie("refreshToken", cookiesOption)

        await UserModel.findByIdAndUpdate(userid, {refresh_token: ""})

        return res.json({
            success: true,
            message: "Logout successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function uploadAvatar(req, res) {
    try {
        const userId = req.userId
        const image = req.file

        const upload = saveImage(image)

        await UserModel.findByIdAndUpdate(userId, {avatar: upload})

        return res.json({
            success: true,
            data: {
                idUser: userId,
                image: upload
            },
            message: "upload profile",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function updateDetails(req, res) {
    try {
        const userId = req.userId
        const {name, email, mobile, password} = req.body

        let hashPassword = ""

        if (password) {
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password, salt)
        }

        const updateUser = await UserModel.updateOne({_id: userId}, {
            ...(name && {name: name}),
            ...(email && {email: email}),
            ...(mobile && {mobile: mobile}),
            ...(password && {password: hashPassword})
        })

        return res.json({
            success: true,
            data: updateUser,
            message: "Updated successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function forgotPasswordController(req, res) {
    try {
        const {email} = req.body

        const user = await UserModel.findOne({email})

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email not available",
            })
        }

        const otp = generatedOtp()
        const expireTime = new Date() + 60 * 60 * 1000 // 1hr

        await UserModel.findByIdAndUpdate(user._id, {
            forgot_password_otp: otp,
            forgot_password_expiry: new Date(expireTime).toISOString()
        })

        await sendEmail({
            sendTo: email,
            subject: "Forgot password from @@",
            html: forgotPasswordTemplate({
                name: user.name,
                otp: otp
            })
        })

        return res.json({
            success: true,
            message: "check your email",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function verifyForgotPasswordOtp(req, res) {
    try {
        const {email, otp} = req.body

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Provide required field email, otp.",
            })
        }

        const user = await UserModel.findOne({email})

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email not available",
            })
        }

        const currentTime = new Date().toISOString()

        if (user.forgot_password_expiry < currentTime) {
            return res.status(400).json({
                success: false,
                message: "Otp is expired",
            })
        }

        if (otp !== user.forgot_password_otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid otp",
            })
        }

        await UserModel.findByIdAndUpdate(user?._id, {
            forgot_password_otp: "",
            forgot_password_expiry: ""
        })

        return res.json({
            success: true,
            message: "Verify otp successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function resetPassword(req, res) {
    try {
        const {email, newPassword, confirmPassword} = req.body

        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "provide required fields email, newPassword, confirmPassword"
            })
        }

        const user = await UserModel.findOne({email})

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email is not available",
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "newPassword and confirmPassword must be same.",
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword, salt)

        await UserModel.findOneAndUpdate(user._id, {password: hashPassword})

        return res.json({
            success: true,
            message: "Password updated successfully.",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function refreshToken(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            })
        }

        const verifyToken = await jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)

        if (!verifyToken) {
            return res.status(401).json({
                success: false,
                message: "token is expired",
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generatedAccessToken(userId)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        res.cookie('accessToken', newAccessToken, cookiesOption)

        return res.json({
            success: true,
            data: {
                accessToken: newAccessToken
            },
            message: "New Access token generated",
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function userDetails(req, res) {
    try {
        const userId = req.userId
        const user = await UserModel.findById(userId).select('-password -refresh_token')

        return res.json({
            success: true,
            data: user,
            message: 'user details',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Something is wrong",
        })
    }
}
