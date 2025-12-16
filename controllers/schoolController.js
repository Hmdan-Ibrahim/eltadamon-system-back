import { School } from "../models/School.js";
import { getCountDocs } from "../util/apiFeatures/getCountDocs.js";
import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError2, notFoundError2 } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";
import { Roles } from "../util/Roles.js";
import { Project } from "../models/Project.js";

const Model = School
const ModelName = "المدرسة"
const populates = {
    path: "project",
    select: "name",           
    populate: {
        path: "region",
        select: "name",           
    },
    path: "supervisor",
    select: "name"
}

const createSchool = createModel((req) => {
    const { name, project } = req.body
    return {
        Model, ModelName,
        foundErrorMessage: foundError2(ModelName),
        searchObj: { name, project }
    }
})

const getCountSchoolDocs = getCountDocs(Model, "عدد المدارس", async (req) => {
    const { role, _id, project, region } = req.user;
    let filter = {};

    switch (role) {
        case Roles.REGION_MANAGER:
            const areaProjects = await Project.find({ region }).select("_id");
            filter = { project: { $in: areaProjects.map((p) => p._id) } };
            break;

        case Roles.PROJECT_MANAGER:
            filter = { project };
            break;

        case Roles.SUPERVISOR:
            filter = { supervisor: _id };
            break;

        default:
            filter = {};
    }

    return filter;
});

const getAllSchools = getAllModels(Model, "المدارس", populates)
const getSchool = getModel(Model, ModelName, notFoundError2(ModelName), populates)
const updateSchool = updateModel(Model, ModelName, notFoundError2(ModelName), populates)
const deleteSchool = deleteModel(Model, ModelName, notFoundError2(ModelName))

export {
    createSchool,
    getCountSchoolDocs,
    getAllSchools,
    getSchool,
    updateSchool,
    deleteSchool
}
