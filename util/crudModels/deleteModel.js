import { asyncWrapperMiddleware } from "../../middleware/asyncWrapperMiddleware.js";
import { SuccessDeleteMessage } from "../SuccessMessages.js";

export const deleteModel = (Model, ModelName, notFoundErrorMessage, callBackFun) => {
    return asyncWrapperMiddleware(async (req, res, next) => {
        const model = await Model.findByIdAndDelete(req.params.id);
        if (!model) {
            return next({ statusCode: 404, status: "fiald", message: notFoundErrorMessage });
        }
        if (callBackFun) {
            await callBackFun(model, req)
        }
        res.status(204).send({ status: "success", statusCode: 204, message: SuccessDeleteMessage(ModelName), data: "null" });
    })
}
