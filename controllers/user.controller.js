import dotenv from "dotenv";
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import {OAuth2Client} from "google-auth-library";

import UserModel from '../models/user.model.js'
import {saveImage} from "../utils/uploadImageLocal.js";
import generateToken from "../utils/generateToken.js";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export class UserController {
    static async register(req, res) {
        try {
            const {name, email, password} = req.body

            const user = await UserModel.findOne({email})

            if (user) {
                return res.json({
                    success: false,
                    message: "User already exists with the same email! Please try again",
                })
            }

            const salt = await bcryptjs.genSalt(10)
            const hashPassword = await bcryptjs.hash(password, salt)

            const newUser = new UserModel({
                name,
                email,
                password: hashPassword
            })

            const save = await newUser.save()

            return res.json({
                success: true,
                data: save,
                message: 'Register successfully',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async verifyEmail(req, res) {
        try {
            const {code} = req.body

            const user = await UserModel.findOne({_id: code})

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid code",
                })
            }

            await UserModel.updateOne({_id: code}, {verifyEmail: true})

            return res.json({
                success: true,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async login(req, res) {
        const {email, password} = req.body

        try {
            const user = await UserModel.findOne({email})

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User doesn't exists! Please register first",
                })
            }

            const checkPasswordMatch = await bcryptjs.compare(password, user.password);

            if (!checkPasswordMatch) {
                return res.json({
                    success: false,
                    message: "Incorrect password! Please try again",
                });
            }

            if (user.status !== "Active") {
                return res.status(400).json({
                    success: false,
                    message: "Your account is not active. Contact the administrator.",
                })
            }

            const accessToken = generateToken.access(user._id)
            const refreshToken = await generateToken.refresh(user._id)

            await UserModel.findByIdAndUpdate(user?._id, {lastLoginDate: new Date()})

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
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async logout(req, res) {
        try {
            const userId = req.userId

            await UserModel.findByIdAndUpdate(userId, {refreshToken: ""})

            const cookiesOption = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            }

            res.clearCookie("accessToken", cookiesOption)
            res.clearCookie("refreshToken", cookiesOption)

            return res.json({
                success: true,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async uploadAvatar(req, res) {
        try {
            const userId = req.userId
            const image = req.file

            const upload = saveImage(image)

            await UserModel.findByIdAndUpdate(userId, {avatar: upload})

            return res.json({
                success: true,
                data: {
                    image: upload
                },
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async updateDetails(req, res) {
        try {
            const userId = req.userId
            const {name, email, mobile, password} = req.body

            let hashPassword = ""

            if (password) {
                const salt = await bcryptjs.genSalt(10)
                hashPassword = await bcryptjs.hash(password, salt)
            }

            await UserModel.updateOne({_id: userId}, {
                ...(name && {name: name}),
                ...(email && {email: email}),
                ...(mobile && {mobile: mobile}),
                ...(password && {password: hashPassword})
            })

            return res.json({
                success: true,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async forgotPassword(req, res) {
        try {
            const {email} = req.body

            const user = await UserModel.findOne({email})

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

            return res.json({
                success: true,
                message: `otp: ${otp}`,
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async verifyForgotPasswordOtp(req, res) {
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
                forgotPasswordOtp: null,
                forgotPasswordExpiry: null
            })

            return res.json({
                success: true,
                message: "Verify otp successfully",
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async resetPassword(req, res) {
        try {
            const {email, newPassword, confirmPassword} = req.body

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

            const user = await UserModel.findOne({email})

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Email is not available",
                })
            }

            const salt = await bcryptjs.genSalt(10)
            const hashPassword = await bcryptjs.hash(newPassword, salt)

            await UserModel.findOneAndUpdate(user._id, {password: hashPassword})

            return res.json({
                success: true,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async refreshToken(req, res) {
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

            const newAccessToken = generateToken.access(userId)

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
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async userDetails(req, res) {
        try {
            const userId = req.userId

            const user = await UserModel.findById(userId)
                .populate({
                    path: 'addressDetails',
                    select: '-createdAt -updatedAt -userId -__v',
                }).populate({
                    path: 'favoriteProduct',
                    select: '-createdAt -updatedAt -__v',
                    populate: {
                        path: 'category',
                        select: '-createdAt -updatedAt -parent -__v',
                    }
                })
                .select("-password -createdAt -updatedAt -__v")

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Token is expired",
                })
            }

            return res.json({
                success: true,
                data: user,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async googleLogin(req, res) {
        try {
            const {idToken} = req.body;

            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.GOOGLE_CLIENT_ID
            })

            const payload = ticket.getPayload();
            const {email, name, picture} = payload;

            let user = await UserModel.findOne({email});

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

            const accessToken = generateToken.access(user._id)
            const refreshToken = await generateToken.refresh(user._id)

            await UserModel.findByIdAndUpdate(user?._id, {lastLoginDate: new Date()})

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
                    refreshToken: refreshToken,
                    verifyEmail: user.verifyEmail,
                    lastLoginDate: user.lastLoginDate,
                    status: user.status,
                    role: user.role,
                    provider: user.provider,
                    token: accessToken
                },
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }

    static async deactivate(req, res) {
        try {
            const userId = req.userId

            await UserModel.findByIdAndUpdate(userId, {status: "Suspended"})

            return res.json({
                success: true,
                message: '',
            })
        } catch (e) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }
}
