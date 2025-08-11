import dotenv from "dotenv";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { OAuth2Client } from "google-auth-library";

import UserModel from '../models/user.model.js'
import { saveImage } from "../utils/uploadImageLocal.js";
import generateToken from "../utils/generateToken.js";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function registerController(req, res) {
    try {
        const { name, email, password } = req.body

        const user = await UserModel.findOne({ email })

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

        // await sendEmail({
        //     sendTo: email,
        //     subject: "Verify email",
        //     html: verifyEmailTemplate({
        //         name,
        //         url: `${process.env.FRONTEND_URL}/verify-email?code=${save?._id}`
        //     })
        // })

        return res.json({
            success: true,
            data: save,
            message: '',
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
        const { code } = req.body

        const user = await UserModel.findOne({ _id: code })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid code",
            })
        }

        await UserModel.updateOne({ _id: code }, { verifyEmail: true })

        return res.json({
            success: true,
            message: '',
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
        const { email, password } = req.body

        const user = await UserModel.findOne({ email })

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

        const checkPassword = bcryptjs.compare(password, user.password)

        if (!checkPassword) {
            return res.status(400).json({
                success: false,
                message: "Invalid email or password",
            })
        }

        const accessToken = await generateToken.access(user._id)
        const refreshToken = await generateToken.refresh(user._id)

        await UserModel.findByIdAndUpdate(user?._id, { lastLoginDate: new Date() })

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
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                mobile: user.mobile,
                refreshToken: user.refreshToken,
                verifyEmail: user.verifyEmail,
                lastLoginDate: user.lastLoginDate,
                status: user.status,
                role: user.role,
                provider: user.provider,
                token: accessToken
            },
            message: "",
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

        await UserModel.findByIdAndUpdate(userid, { refreshToken: "" })

        return res.json({
            success: true,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function uploadAvatarController(req, res) {
    try {
        const userId = req.userId
        const image = req.file

        const upload = saveImage(image)

        await UserModel.findByIdAndUpdate(userId, { avatar: upload })

        return res.json({
            success: true,
            data: {
                image: upload
            },
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function updateDetailsController(req, res) {
    try {
        const userId = req.userId
        const { name, email, mobile, password } = req.body

        let hashPassword = ""

        if (password) {
            const salt = await bcryptjs.genSalt(10)
            hashPassword = await bcryptjs.hash(password, salt)
        }

        await UserModel.updateOne({ _id: userId }, {
            ...(name && { name: name }),
            ...(email && { email: email }),
            ...(mobile && { mobile: mobile }),
            ...(password && { password: hashPassword })
        })

        return res.json({
            success: true,
            message: '',
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
        const { email } = req.body

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email not available",
            })
        }

        const otp = Math.floor(Math.random() * 900000) + 100000 // 100.000 to 999.999
        const expireTime = new Date() + 60 * 60 * 1000 // 1hr

        await UserModel.findByIdAndUpdate(user._id, {
            forgotPasswordOtp: otp,
            forgotPasswordExpiry: new Date(expireTime).toISOString()
        })

        // await sendEmail({
        //     sendTo: email,
        //     subject: "Forgot password",
        //     html: forgotPasswordTemplate({
        //         name: user.name,
        //         otp: otp
        //     })
        // })

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

export async function verifyForgotPasswordOtpController(req, res) {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Provide required field email, otp.",
            })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email not available",
            })
        }

        const currentTime = new Date().toISOString()

        if (user.forgotPasswordExpiry < currentTime) {
            return res.status(400).json({
                success: false,
                message: "Otp is expired",
            })
        }

        if (otp !== user.forgotPasswordOtp) {
            return res.status(400).json({
                success: false,
                message: "Invalid otp",
            })
        }

        await UserModel.findByIdAndUpdate(user?._id, {
            forgotPasswordOtp: "",
            forgotPasswordExpiry: ""
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

export async function resetPasswordController(req, res) {
    try {
        const { email, newPassword, confirmPassword } = req.body

        if (!email || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "Provide required fields"
            })
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "new password and confirm password must be same.",
            })
        }

        const user = await UserModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email is not available",
            })
        }

        const salt = await bcryptjs.genSalt(10)
        const hashPassword = await bcryptjs.hash(newPassword, salt)

        await UserModel.findOneAndUpdate(user._id, { password: hashPassword })

        return res.json({
            success: true,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function refreshTokenController(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            })
        }

        const verifyToken = jwt.verify(refreshToken, process.env.SECRET_KEY_REFRESH_TOKEN)

        if (!verifyToken) {
            return res.status(401).json({
                success: false,
                message: "Token is expired",
            })
        }

        const userId = verifyToken?._id

        const newAccessToken = await generateToken.access(userId)

        const cookiesOption = {
            httpOnly: true,
            secure: true,
            sameSite: "None"
        }

        res.cookie('accessToken', newAccessToken, cookiesOption)

        return res.json({
            success: true,
            data: {
                token: newAccessToken
            },
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function userDetailsController(req, res) {
    try {
        const userId = req.userId
        const user = await UserModel.findById(userId)

        if(!user) {
            return res.status(401).json({
                success: false,
                message: "Token is expired",
            })
        }

        return res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                mobile: user.mobile,
                refreshToken: user.refreshToken,
                verifyEmail: user.verifyEmail,
                lastLoginDate: user.lastLoginDate,
                status: user.status,
                role: user.role,
                provider: user.provider,
            },
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function googleLoginController(req, res) {
    try {
        const { idToken } = req.body;

        const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID })

        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await UserModel.findOne({ email });

        if (user.status !== "Active") {
            return res.status(400).json({
                success: false,
                message: "Your account is not active. Contact the administrator.",
            })
        }

        if (!user) {
            user = await UserModel.create({
                email: email,
                name: name,
                avatar: picture,
                provider: 'google',
            });
        }

        const accessToken = await generateToken.access(user._id)
        const refreshToken = await generateToken.refresh(user._id)

        await UserModel.findByIdAndUpdate(user?._id, { lastLoginDate: new Date() })

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
                _id: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                mobile: user.mobile,
                refreshToken: user.refreshToken,
                verifyEmail: user.verifyEmail,
                lastLoginDate: user.lastLoginDate,
                status: user.status,
                role: user.role,
                provider: user.provider,
                token: accessToken
            },
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export async function deactivateUserController(req, res) {
    try {
        const userId = req.userId

        await UserModel.findByIdAndUpdate(userId, { status: "Suspended" })

        return res.json({
            success: true,
            message: '',
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}
