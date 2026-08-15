import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client } from "../config/r2.js";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function createUploadUrlService(key, contentType) {

    const command = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET,
        Key: key,
        ContentType: contentType
    });

    const uploadUrl = await getSignedUrl(getR2Client(),
        command,
        {
            expiresIn: 300
        }
    );

    return uploadUrl;
}