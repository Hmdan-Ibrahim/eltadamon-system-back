import { isValidObjectId, Types } from "mongoose";
import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { convertPopulates } from "../apiFeatures/ConvertPopulates.js";
import { SuccessGetMessage } from "../SuccessMessages.js";
import { filter } from "../apiFeatures/filter.js";
import { paginate } from "../apiFeatures/paginate.js";

export const getAllModels = (Model, ModelsName, populates) => {
    return asyncWrapperMiddleware(async (req, res) => {
        const { page, limit } = { ...req.query }

        let query = filter(Model, req.query)
        if (populates) query = convertPopulates(query, populates)
        // query = paginate(query, page, limit)

        const models = await query;

        res.status(200).json({
            status: "success",
            statusCode: 200,
            message: SuccessGetMessage(ModelsName),
            result: models.length,
            data: models
        });
    })
}
