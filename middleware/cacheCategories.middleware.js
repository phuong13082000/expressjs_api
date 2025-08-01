import Redis from "ioredis";

const redis = new Redis();

const cacheCategoriesMiddleware = async (req, res, next) => {
    try {
        const data = await redis.get('categories');

        if (data) {
            return res.json({
                success: true,
                data: data,
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