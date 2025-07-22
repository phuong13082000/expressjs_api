import UserModel from "../models/user.model.js"

const admin = async (request, response, next) => {
    try {
        const userId = request.userId

        const user = await UserModel.findById(userId)

        if (user.role !== 'ADMIN') {
            return response.status(400).json({
                success: false,
                message: "Permission denial"
            })
        }

        next()
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: "Permission denial"
        })
    }
}

export default admin
