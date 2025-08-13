import {UploadService} from "../utils/uploadImageLocal.js";

const uploadService = new UploadService();

export const uploadMiddlewareAvatar = uploadService.single("avatar");

export const uploadMiddlewareImage = uploadService.single("image");

export const saveImage = (file, folder) => {
    return uploadService.saveImage(file, folder);
};
