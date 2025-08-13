import {saveImage} from "../middleware/upload.middleware.js";

export class UploadController {
    static async image(req, res) {
        const file = req.file

        try {
            if (!file) {
                return res.status(400).json({
                    success: false,
                    message: "No file uploaded",
                });
            }

            const imagePath = await saveImage(file);

            return res.json({
                success: true,
                data: {
                    url: imagePath
                },
                message: "Upload done"
            })
        } catch (error) {
            console.log(e);
            res.status(500).json({
                success: false,
                message: "Some error occurred",
            });
        }
    }
}
