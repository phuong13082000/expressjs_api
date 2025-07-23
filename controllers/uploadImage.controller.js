import {saveImage} from "../utils/uploadImageLocal.js";

const uploadImageController = async (req, res) => {
    try {
        const file = req.file

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }

        const imagePath = saveImage(file);

        return res.json({
            success: true,
            data: {
                url: imagePath
            },
            message: "Upload done"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || error,
        })
    }
}

export default uploadImageController
