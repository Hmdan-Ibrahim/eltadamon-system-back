import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { convertPopulates } from "../apiFeatures/ConvertPopulates.js";
import { SuccessUpdatetMessage } from "../SuccessMessages.js";

export const updateModel = (Model, ModelName, notFoundErrorMessage, populates, callBackFun) => {
    return asyncWrapperMiddleware(async (req, res, next) => {
        const updates = req.body;
        const oldDoc = await Model.findById(req.params.id);

        if (!oldDoc) {
            return next({
                statusCode: 404,
                status: "failed",
                message: notFoundErrorMessage
            });
        }

        let query = Model.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
        if (populates) query = convertPopulates(query, populates)
        const newDoc = await query;

        if (callBackFun) {
            await callBackFun({
                oldDoc,
                newDoc,
                updates
            });
        }

        res.status(203).json({ status: "success", statusCode: 203, message: SuccessUpdatetMessage(ModelName), data: newDoc });
    })
}
