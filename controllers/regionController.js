import { Region } from "../models/Region.js";
import { createModel } from "../util/crudModels/createModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";
import { getModel } from "../util/crudModels/getModel.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { foundError2, notFoundError2 } from "../util/ErrorsMessages.js";

const Model = Region
const ModelName = "المنطقة"
const populates = { path: "manager", select: "name phone" }

const createRegion = createModel((req) => {
    const { name, manager } = req.body
    return {
        Model, ModelName,
        foundErrorMessage: foundError2(ModelName),
        searchObj: { name },
        reqBody: { name, manager },
    }
})

const getAllRegions = getAllModels(Region, "جميع المناطق", populates)
const getRegion = getModel(Region, ModelName, notFoundError2(ModelName))
const updateRegion = updateModel(Region, ModelName, notFoundError2(ModelName))
const deleteRegion = deleteModel(Region, ModelName, notFoundError2(ModelName))

export {
    createRegion,
    getAllRegions,
    getRegion,
    updateRegion,
    deleteRegion
}


