import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { convertPopulates } from "../apiFeatures/ConvertPopulates.js";
import { SuccessGetMessage } from "../SuccessMessages.js";

export const getModel = (Model, ModelName, notFoundErrorMessage, populates) => {
    return asyncWrapperMiddleware(async (req, res, next) => {
        let query = Model.findById(req.params.id)
        if (populates) query = convertPopulates(query, populates)
        const model = await query;

        if (!model) {
            return next({ statusCode: 404, status: "fiald", message: notFoundErrorMessage });
        }
        res.status(200).json({ status: "success", statusCode: 200, message: SuccessGetMessage(ModelName), data: model });
    })
}
