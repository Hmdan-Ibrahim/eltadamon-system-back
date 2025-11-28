import { Project } from "../models/Project.js";

import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError, notFoundError } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";

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

const getAllProjects = getAllModels(Model, "المشاريع", populates)
const getProject = getModel(Model, ModelName, notFoundError(ModelName), populates)
const updateProject = updateModel(Model, ModelName, notFoundError(ModelName), populates)
const deleteProject = deleteModel(Model, ModelName, notFoundError(ModelName))

export {
    createProject,
    getAllProjects,
    getProject,
    updateProject,
    deleteProject
}
