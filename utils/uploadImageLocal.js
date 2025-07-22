import multer from "multer";
import path from "path";
import fs from "fs";
import {fileURLToPath} from 'url';

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb("Error: Images Only!");
        }
    }
});

export const saveImage = (file) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
    const dirPath = path.join(path.dirname(fileURLToPath(import.meta.url)), `../public/images`);
    const filePath = path.join(dirPath, filename);

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
    }

    fs.writeFileSync(filePath, file.buffer);

    return `${process.env.SERVER_URL}/images/${filename}`;
}

export const uploadMiddlewareAvatar = upload.single("avatar");
export const uploadMiddlewareImage = upload.single("image");

export default upload
