import { Project } from "../models/Project.js";
import { getCountDocs } from "../util/apiFeatures/getCountDocs.js";
import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError, notFoundError } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";
import { Roles } from "../util/Roles.js";

const Model = Project
const ModelName = "المشروع"
const populates = [
    { path: "region", select: "name" },
    { path: "manager", select: "name phone" },
];

const createProject = createModel((req) => {
    const { name, region, manager } = req.body
    return {
        Model, ModelName,
        foundErrorMessage: foundError(ModelName),
        searchObj: { name },
        reqBody: { name, region, manager },
    }
})

const getCountProjectDocs = getCountDocs(Model, "عدد المشاريع", async (req) => {
    const { role, _id, region } = req.user;
    console.log("getCountProjectDocs user", req.user);

    let filter = {};

    switch (role) {
        case Roles.REGION_MANAGER: // مدير منطقة
            // احصل على كل مشاريع المنطقة
            filter = { region };
            break;

        case Roles.PROJECT_MANAGER: // مدير مشروع
            filter = { manager: _id }; // مدارس المشروع فقط
            break;

        case Roles.SUPERVISOR: // مشرف
            filter = { supervisor: _id };
            break;

        default:
            filter = {}; // احتياط
    }

    console.log("filter filter", filter);

    return filter;
});

const getAllProjects = getAllModels(Model, "المشاريع", populates)
const getProject = getModel(Model, ModelName, notFoundError(ModelName), populates)
const updateProject = updateModel(Model, ModelName, notFoundError(ModelName), populates)
const deleteProject = deleteModel(Model, ModelName, notFoundError(ModelName))

export {
    createProject,
    getCountProjectDocs,
    getAllProjects,
    getProject,
    updateProject,
    deleteProject
}
