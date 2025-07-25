import {Router} from 'express'
import {
    forgotPasswordController,
    googleLogin,
    loginController,
    logoutController,
    refreshToken,
    registerController,
    resetPassword,
    updateDetails,
    uploadAvatar,
    userDetails,
    verifyEmailController,
    verifyForgotPasswordOtp
} from '../controllers/user.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import {uploadMiddlewareAvatar} from "../utils/uploadImageLocal.js";
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {loginSchema, registerSchema} from "../schemas/user.schema.js";

const userRouter = Router()

userRouter.get('/user-details', authMiddleware, userDetails)

userRouter.post('/register', validateMiddleware(registerSchema), registerController)
userRouter.post('/verify-email', verifyEmailController)
userRouter.post('/login', validateMiddleware(loginSchema), loginController)
userRouter.post('/refresh-token', refreshToken)
userRouter.post('/login-google', googleLogin)
userRouter.post('/logout', authMiddleware, logoutController)

userRouter.put('/upload-avatar', authMiddleware, uploadMiddlewareAvatar, uploadAvatar)
userRouter.put('/update-user', authMiddleware, updateDetails)
userRouter.put('/forgot-password', forgotPasswordController)
userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtp)
userRouter.put('/reset-password', resetPassword)

export default userRouter
