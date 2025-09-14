import dotenv from "dotenv";
import {OAuth2Client} from "google-auth-library";

import UserModel from '../models/user.model.js'
import {saveImage} from "../middleware/upload.middleware.js";
import {BaseController} from "./base.controller.js";
import Password from "../utils/password.js";
import Token from "../utils/token.js";

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

class UserController extends BaseController {
    static async register(req, res) {
        try {
            const {name, email, password} = req.body

            const user = await UserModel.findOne({email})

            if (user) {
                return this.error(res, "user already exists with the same email! Please try again");
            }

            const hashPassword = await Password.hash(password);

            const newUser = new UserModel({
                name,
                email,
                password: hashPassword
            })

            const save = await newUser.save()

            return this.success(res, save, "register successfully")
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async verifyEmail(req, res) {
        try {
            const {code} = req.body

            const user = await UserModel.findOne({_id: code})

            if (!user) {
                return this.error(res, "invalid code", 400);
            }

            await UserModel.updateOne({_id: code}, {verifyEmail: true})

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async login(req, res) {
        const {email, password} = req.body

        try {
            const user = await UserModel.findOne({email})

            if (!user) {
                return this.error(res, "user doesnt exists! please register first", 400);
            }

            const checkPasswordMatch = await Password.check(password, user.password);

            if (!checkPasswordMatch) {
                return this.error(res, "incorrect password! please try again");
            }

            if (user.status !== "Active") {
                return this.error(res, "Your account is not active. Contact the administrator", 400);
            }

            const accessToken = Token.genAccess(user._id)
            const refreshToken = await Token.genRefresh(user._id)

            await UserModel.findByIdAndUpdate(user?._id, {lastLoginDate: new Date()})

            const cookiesOption = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            };

            res.cookie('accessToken', accessToken, cookiesOption)
            res.cookie('refreshToken', refreshToken, cookiesOption)

            return this.success(res, {
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
            })
        } catch (e) {
            console.log(e);
            return this.error(res);
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

            return this.success(res);
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async uploadAvatar(req, res) {
        try {
            const userId = req.userId
            const image = req.file

            const upload = await saveImage(image)

            await UserModel.findByIdAndUpdate(userId, {avatar: upload})

            return this.success(res, {image: upload})
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async updateDetails(req, res) {
        try {
            const userId = req.userId
            const {name, email, mobile, password} = req.body

            let hashPassword = ""

            if (password) {
                hashPassword = await Password.hash(password)
            }

            await UserModel.updateOne({_id: userId}, {
                ...(name && {name: name}),
                ...(email && {email: email}),
                ...(mobile && {mobile: mobile}),
                ...(password && {password: hashPassword})
            })

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async forgotPassword(req, res) {
        try {
            const {email} = req.body

            const user = await UserModel.findOne({email})

            if (!user) {
                return this.error(res, "email not available", 400);
            }

            const otp = Math.floor(Math.random() * 900000) + 100000 // 100.000 to 999.999
            const expireTime = new Date() + 60 * 60 * 1000 // 1hr

            await UserModel.findByIdAndUpdate(user._id, {
                forgotPasswordOtp: otp,
                forgotPasswordExpiry: new Date(expireTime).toISOString()
            })

            return this.success(res, {}, `otp: ${otp}`)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async verifyForgotPasswordOtp(req, res) {
        try {
            const {email, otp} = req.body

            if (!email || !otp) {
                return this.error(res, "provide required field email, otp", 400);
            }

            const user = await UserModel.findOne({email})

            if (!user) {
                return this.error(res, "email not available", 400);
            }

            const currentTime = new Date().toISOString()

            if (user.forgotPasswordExpiry < currentTime) {
                return this.error(res, "otp is expired", 400);
            }

            if (otp !== user.forgotPasswordOtp) {
                return this.error(res, "invalid otp", 400);
            }

            await UserModel.findByIdAndUpdate(user?._id, {
                forgotPasswordOtp: null,
                forgotPasswordExpiry: null
            })

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async resetPassword(req, res) {
        try {
            const {email, newPassword, confirmPassword} = req.body

            if (!email || !newPassword || !confirmPassword) {
                return this.error(res, "provide required fields", 400);
            }

            if (newPassword !== confirmPassword) {
                return this.error(res, "new password and confirm password must be same", 400);
            }

            const user = await UserModel.findOne({email})

            if (!user) {
                return this.error(res, "email isn't available", 400);
            }

            const hashPassword = await Password.hash(newPassword)

            await UserModel.findOneAndUpdate(user._id, {password: hashPassword})

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken || req?.headers?.authorization?.split(" ")[1]

            if (!refreshToken) {
                return this.error(res, "invalid token", 401);
            }

            const verifyToken = Token.verifyRefresh(refreshToken)

            if (!verifyToken) {
                return this.error(res, "token is expired", 401);
            }

            const userId = verifyToken?._id

            const newAccessToken = Token.genAccess(userId)

            const cookiesOption = {
                httpOnly: true,
                secure: true,
                sameSite: "None"
            }

            res.cookie('accessToken', newAccessToken, cookiesOption)

            return this.success(res, {token: newAccessToken})
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async userDetails(req, res) {
        try {
            const userId = req.userId

            const user = await UserModel.findById(userId)
                .select("-password -createdAt -updatedAt -__v")
                .populate({
                    path: 'addressDetails',
                    select: '-createdAt -updatedAt -userId -__v',
                })
                .populate({
                    path: 'shoppingCart',
                    select: '-createdAt -updatedAt -userId -__v',
                    populate: {
                        path: 'product',
                        select: '-createdAt -updatedAt -__v',
                        populate: {
                            path: 'category',
                            select: '-createdAt -updatedAt -__v -parent',
                        }
                    }
                })
                .populate({
                    path: 'orderHistory',
                    select: '-userId -createdAt -updatedAt -__v',
                    populate: {
                        path: 'deliveryAddress',
                        select: '-createdAt -updatedAt -userId -__v',
                    }
                })
                .populate({
                    path: 'favoriteProduct',
                    select: '-createdAt -updatedAt -__v',
                    populate: {
                        path: 'category',
                        select: '-createdAt -updatedAt -parent -__v',
                    }
                })

            if (!user) {
                return this.error(res, "token is expired", 401)
            }

            return this.success(res, user)
        } catch (e) {
            console.log(e);
            return this.error(res);
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
                return this.error(res, "your account isn't active. contact the admin", 401);
            }

            if (!user) {
                user = await UserModel.create({
                    email: email,
                    name: name,
                    avatar: picture,
                    provider: 'google',
                });
            }

            const accessToken = Token.genAccess(user._id)
            const refreshToken = await Token.genRefresh(user._id)

            await UserModel.findByIdAndUpdate(user?._id, {lastLoginDate: new Date()})

            const cookiesOption = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "Strict" : "Lax",
            };

            res.cookie('accessToken', accessToken, cookiesOption)
            res.cookie('refreshToken', refreshToken, cookiesOption)

            return this.success(res, {
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
            });
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }

    static async deactivate(req, res) {
        try {
            const userId = req.userId

            await UserModel.findByIdAndUpdate(userId, {status: "Suspended"})

            return this.success(res)
        } catch (e) {
            console.log(e);
            return this.error(res);
        }
    }
}

export default new UserController();
