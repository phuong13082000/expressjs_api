export class BaseController {
    success(res, data = null, message = "success") {
        return res.status(200).json({success: true, data, message})
    }

    error(res, message = "something went wrong", status = 500) {
        return res.status(status).json({success: false, message})
    }
}
