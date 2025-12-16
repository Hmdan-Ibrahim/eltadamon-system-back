import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { foundError, ServerErrorMessage } from "../ErrorsMessages.js";
import { SuccessCreateMessage } from "../SuccessMessages.js";

export const createModel = (paramsFunction) => {

    return asyncWrapperMiddleware(async (req, res, next) => {
        const { Model, ModelName, foundErrorMessage, searchObj } = paramsFunction(req)

        const existingModel = await Model.findOne(searchObj);
        if (existingModel && Model.modelName != "DailyOrder") {
            return next({ statusCode: 409, status: "errorrr", message: foundErrorMessage });
        }
        const newModel = new Model(req.body);
        await newModel.save();

        res.status(201).json({ statusCode: 201, status: "success", message: SuccessCreateMessage(`${req.body.name || ModelName}`), data: newModel });
    })
}
