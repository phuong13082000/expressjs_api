import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class UploadService {
    constructor() {
        this.allowedTypes = /jpeg|jpg|png|gif|webp/;
        this.upload = multer({
            storage: multer.memoryStorage(),
            fileFilter: (req, file, cb) => this.fileFilter(req, file, cb)
        });
    }

    fileFilter(req, file, cb) {
        const extname = this.allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = this.allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error("Images Only!"));
        }
    }

    single(fieldName) {
        return this.upload.single(fieldName);
    }

    multiple(fieldName, maxCount) {
        return this.upload.array(fieldName, maxCount);
    }

    async saveImage(file, folder = "images") {
        if (!file) return null;

        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
        const dirPath = path.join(__dirname, `../public/${folder}`);
        const filePath = path.join(dirPath, filename);

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        await fs.promises.writeFile(filePath, file.buffer);

        const baseUrl = process.env.SERVER_URL?.replace(/\/$/, "");
        return `${baseUrl}/${folder}/${filename}`;
    }
}
