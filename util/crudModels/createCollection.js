import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { SuccessCreateMessage } from "../SuccessMessages.js";

export const createCollection = (params) => {
    return asyncWrapperMiddleware(async (req, res, next) => {
        const { Model, ModelName, foundErrorMessage, searchObj, reqBody } = params

        const existingCollection = await Model.find(searchObj);

        if (existingCollection.length) {
            return next({ statusCode: 409, status: "errorrr", message: foundErrorMessage });
        }
        await Model.insertMany(reqBody);

        res.status(201).json({ statusCode: 201, status: "success", message: SuccessCreateMessage(`${ModelName}`) });
    })
}   