import { Vehicle } from "../models/Vehicle.js";

import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError2, notFoundError2 } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";

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

const getAllVehicles = getAllModels(Model, "السيارات")
const getVehicle = getModel(Model, ModelName, notFoundError2(ModelName))
const updateVehicle = updateModel(Model, ModelName, notFoundError2(ModelName))
const deleteVehicle = deleteModel(Model, ModelName, notFoundError2(ModelName))

export {
    createVehicle,
    getAllVehicles,
    getVehicle,
    updateVehicle,
    deleteVehicle
}