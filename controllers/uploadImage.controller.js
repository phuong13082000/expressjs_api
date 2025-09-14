import {saveImage} from "../middleware/upload.middleware.js";
import {BaseController} from "./base.controller.js";

class UploadController extends BaseController {
    static async image(req, res) {
        const file = req.file

        try {
            if (!file) {
                return this.error(res, 'no file uploaded', 400);
            }

            const imagePath = await saveImage(file);

            return this.success(res, {url: imagePath});
        } catch (e) {
            console.log(e);
            return this.error(res)
        }
    }
}

export default new UploadController();
