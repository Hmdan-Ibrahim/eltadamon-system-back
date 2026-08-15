import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "../config/r2.js";

export async function deleteStorageImages(images = []) {

    if (!images.length) return;

    const r2Images = [];

    for (const image of images) {
        if (!image) continue;

        if (!image.startsWith("http")) {
            r2Images.push(image);
        }
    }

    try {
        await getR2Client().send(
            new DeleteObjectsCommand({
                Bucket: process.env.R2_BUCKET,
                Delete: {
                    Objects: r2Images.map(key => ({
                        Key: key
                    }))
                }
            })
        );
    } catch (err) {
        console.error("R2:", err);
    }
}