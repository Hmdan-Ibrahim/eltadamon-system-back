import { randomUUID } from "crypto";
import { asyncWrapperMiddleware } from "../middleware/asyncWrapperMiddleware.js";
import { createUploadUrlService } from "../util/createUploadUrlService.js";
import { deleteStorageImages } from "../util/deleteStorageImages.js";
import { SuccessDeleteMessage, SuccessGetMessage } from "../util/SuccessMessages.js";

const createUploadUrl = asyncWrapperMiddleware(async (req, res, next) => {
    const {
        projectId,
        sendingDate,
        contentType
    } = req.body;

    const date = new Date(sendingDate);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const extension = contentType.split("/")[1];

    const key =
        `${projectId}/${year}/${month}/${day}/${randomUUID()}.${extension}`;

    const uploadUrl = await createUploadUrlService(key, contentType)

    res.status(200).send({
        status: "success", statusCode: 200, message: SuccessGetMessage("المفتاح"), data: {
            key,
            uploadUrl,
            publicUrl:
                `${process.env.R2_PUBLIC_URL}/${key}`
        }
    });

})

const deleteManyImages = asyncWrapperMiddleware(async (req, res, next) => {
    const { keys } = req.body;
    if (!Array.isArray(keys) || !keys.length)
        return next({ statusCode: 400, status: "error", message: "المفتاح مطلوب" });

    await deleteStorageImages(keys);

    res.status(204).send({ status: "success", statusCode: 204, message: SuccessDeleteMessage("الصور"), data: "null" });

})

export {
    createUploadUrl,
    deleteManyImages
}