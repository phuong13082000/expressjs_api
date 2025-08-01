import UserModel from "../models/user.model.js"

const adminMiddleware = async (req, res, next) => {
    try {
        const userId = req.userId

        const user = await UserModel.findById(userId)

        if (user.role !== 'ADMIN') {
            return res.status(400).json({
                success: false,
                message: "Permission denial"
            })
        }

        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Permission denial"
        })
    }
}

export default adminMiddleware
