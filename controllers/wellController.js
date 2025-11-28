import { Well } from "../models/Well.js";

import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError2, notFoundError2 } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";

const Model = Well
const ModelName = "البئر"

const createWell = createModel((req) => {
    const { name, pricePerUnit } = req.body
    return {
        Model, ModelName,
        foundErrorMessage: foundError2(ModelName),
        searchObj: { name },
        reqBody: { name, pricePerUnit },
    }
})

const getAllWells = getAllModels(Model, "الآبار")
const getWell = getModel(Model, ModelName, notFoundError2(ModelName))
const updateWell = updateModel(Model, ModelName, notFoundError2(ModelName))
const deleteWell = deleteModel(Model, ModelName, notFoundError2(ModelName))

export {
    createWell,
    getAllWells,
    getWell,
    updateWell,
    deleteWell
}