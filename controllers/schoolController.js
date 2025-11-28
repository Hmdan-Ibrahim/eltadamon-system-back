import { School } from "../models/School.js";

import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError2, notFoundError2 } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";

const Model = School
const ModelName = "المدرسة"
const populates = {
    path: "project",
    select: "name",           // نختار فقط هذه الحقول من المشروع
    populate: {
        path: "region",
        select: "name",           // نختار فقط هذه الحقول من المنطقة
    },
    path: "supervisor",
    select: "name"
}

const createSchool = createModel((req) => {
    const { name, project, address, gps } = req.body
    return {
        Model, ModelName,
        foundErrorMessage: foundError2(ModelName),
        searchObj: { name, project },
        reqBody: { name, project, address, gps },
    }
})

const getAllSchools = getAllModels(Model, "المدارس", populates)
const getSchool = getModel(Model, ModelName, notFoundError2(ModelName), populates)
const updateSchool = updateModel(Model, ModelName, notFoundError2(ModelName), populates)
const deleteSchool = deleteModel(Model, ModelName, notFoundError2(ModelName))

export {
    createSchool,
    getAllSchools,
    getSchool,
    updateSchool,
    deleteSchool
}