import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { SuccessGetMessage } from "../SuccessMessages.js";

export const getCountDocs = (Model, ModelName, searchQueryBuilder) => {
    return asyncWrapperMiddleware(async (req, res, next) => {
        const searchQuery = await searchQueryBuilder(req);

        const count = await Model.countDocuments(searchQuery);

        res.status(200).json({
            status: "success",
            statusCode: 200,
            message: SuccessGetMessage(ModelName),
            data: count,
        });
    });
};
