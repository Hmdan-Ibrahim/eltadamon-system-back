import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { convertPopulates } from "../apiFeatures/ConvertPopulates.js";
import { SuccessUpdatetMessage } from "../SuccessMessages.js";

export const updateModel = (Model, ModelName, notFoundErrorMessage, populates) => {
    return asyncWrapperMiddleware(async (req, res, next) => {
        const updates = req.body;

        let query = Model.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true })
        if (populates) query = convertPopulates(query, populates)
        const model = await query;

        if (!model) {
            return next({ statusCode: 404, status: "fiald", message: notFoundErrorMessage });
        }
        res.status(203).json({ status: "success", statusCode: 203, message: SuccessUpdatetMessage(ModelName), data: model });
    })
}
