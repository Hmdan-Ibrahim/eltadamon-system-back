import { Vehicle } from "../models/Vehicle.js";
import { getCountDocs } from "../util/apiFeatures/getCountDocs.js"
import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError2, notFoundError2 } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";
import { Roles } from "../util/Roles.js";
import { Project } from "../models/Project.js";

const Model = Vehicle
const ModelName = "السيارة"

const createVehicle = createModel((req) => {
    const { plateNumber, capacity } = req.body
    return {
        Model, ModelName,
        foundErrorMessage: foundError2(ModelName),
        searchObj: { plateNumber },
        reqBody: { plateNumber, capacity },
    }
})

getCountDocs(Model, "عدد المدارس", async (req) => {
    const { role, _id, project = '', region = '' } = req.user;


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

const getCountVehicleDocs = getCountDocs(Model, "عدد السيارات", async (req) => {
    const { _id, role, project, region } = req.user

    let filter = {};

    switch (role) {
        case Roles.REGION_MANAGER: // مدير منطقة
            // احصل على كل مشاريع المنطقة
            const areaProjects = await Project.find({ region }).select("_id");
            filter = { project: { $in: areaProjects.map((p) => p._id) } };
            break;

        case Roles.PROJECT_MANAGER: // مدير مشروع
            filter = { project }; // مدارس المشروع فقط
            break;

        case Roles.SUPERVISOR: // مشرف
            filter = { supervisor: _id };
            break;

        default:
            filter = {}; // احتياط
    }

    return filter;

})

const getAllVehicles = getAllModels(Model, "السيارات")
const getVehicle = getModel(Model, ModelName, notFoundError2(ModelName))
const updateVehicle = updateModel(Model, ModelName, notFoundError2(ModelName))
const deleteVehicle = deleteModel(Model, ModelName, notFoundError2(ModelName))

export {
    createVehicle,
    getCountVehicleDocs,
    getAllVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
}