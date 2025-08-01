import RedisClient from '../utils/redis.js';

const cacheCategoriesMiddleware = async (req, res, next) => {
    try {
        const data = await RedisClient.getData('categories');

        if (data) {
            return res.json({
                success: true,
                data: JSON.parse(data),
                message: "list category cache"
            })
        }

        next()
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "false load cache categories"
        })
    }
}

export default cacheCategoriesMiddleware