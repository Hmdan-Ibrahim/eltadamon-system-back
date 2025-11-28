import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { DailyOrder } from "../../models/DailyOrder.js";
import { foundError, ServerErrorMessage } from "../ErrorsMessages.js";
import { SuccessCreateMessage } from "../SuccessMessages.js";

export const createModel = (paramsFunction) => {

    return asyncWrapperMiddleware(async (req, res, next) => {
        const { Model, ModelName, foundErrorMessage, searchObj, reqBody } = paramsFunction(req)

        const existingModel = await Model.findOne(searchObj);
        if (existingModel && Model.modelName != "DailyOrder") {
            return next({ statusCode: 409, status: "errorrr", message: foundErrorMessage });
        }
        const newModel = new Model(reqBody);
        await newModel.save();

        res.status(201).json({ statusCode: 201, status: "success", message: SuccessCreateMessage(`${reqBody.name || ModelName}`), data: newModel });
    })
}
