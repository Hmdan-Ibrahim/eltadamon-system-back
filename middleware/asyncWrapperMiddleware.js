import { ServerErrorMessage } from "../util/ErrorsMessages.js";

export const asyncWrapperMiddleware = (asyncMiddlewareFunction) => {
    return async (req, res, next) => {
        asyncMiddlewareFunction(req, res, next).catch((error) => {
            return next({ statusCode: 500, status: "error", message: error.message | ServerErrorMessage, error });
        })
    }
}