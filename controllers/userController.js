import { User } from "../models/User.js";
import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError, notFoundError } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";

const Model = User
const ModelName = "المستخدم"

const createUser = createModel((req) => {
    const { name, userName, password, phone, role, project, region } = req.body
    return {
        Model, ModelName,
        foundErrorMessage: foundError(ModelName),
        searchObj: { $or: [{ userName }, { phone }] },
        reqBody: { name, userName, password, phone, role, project, region },
    }
})

const getAllUsers = getAllModels(Model, "المستخدمين")
const getUser = getModel(Model, ModelName, notFoundError(ModelName))
const updateUser = updateModel(Model, ModelName, notFoundError(ModelName))
const deleteUser = deleteModel(Model, ModelName, notFoundError(ModelName))

export {
    createUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser
}













// const getUser = async (req, res, next) => {
//     try {
//         const user = await User.findById(req.params.id);

//         if (!user) {
//             return next({
//                 statusCode: 404,
//                 status: "fiald",
//                 message: notFoundError("المستخدم"),
//             });
//         }

//         res.status(200).json({
//             status: "success",
//             statusCode: 200,
//             message: SuccessGetMessage("المستخدم"),
//             data: user
//         });
//     } catch (error) {
//         return next({
//             statusCode: 500,
//             status: "error",
//             message: ServerErrorMessage,
//         });
//     }
// }