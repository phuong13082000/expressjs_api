import {Router} from 'express'
import {
    forgotPasswordController,
    googleLoginController,
    loginController,
    logoutController,
    refreshTokenController,
    registerController,
    resetPasswordController,
    updateDetailsController,
    uploadAvatarController,
    userDetailsController,
    verifyEmailController,
    verifyForgotPasswordOtpController,
    deactiveUserController
} from '../controllers/user.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import {uploadMiddlewareAvatar} from "../utils/uploadImageLocal.js";
import {validateMiddleware} from "../middleware/validate.middleware.js";
import {loginSchema, registerSchema} from "../schemas/user.schema.js";

const userRouter = Router()

userRouter.get('/user-details', authMiddleware, userDetailsController)

userRouter.post('/register', validateMiddleware(registerSchema), registerController)
userRouter.post('/verify-email', verifyEmailController)
userRouter.post('/login', validateMiddleware(loginSchema), loginController)
userRouter.post('/refresh-token', refreshTokenController)
userRouter.post('/login-google', googleLoginController)
userRouter.post('/logout', authMiddleware, logoutController)

userRouter.put('/upload-avatar', authMiddleware, uploadMiddlewareAvatar, uploadAvatarController)
userRouter.put('/update-user', authMiddleware, updateDetailsController)
userRouter.put('/forgot-password', forgotPasswordController)
userRouter.put('/verify-forgot-password-otp', verifyForgotPasswordOtpController)
userRouter.put('/reset-password', resetPasswordController)
userRouter.put('/deactive', authMiddleware, deactiveUserController)

export default userRouter
