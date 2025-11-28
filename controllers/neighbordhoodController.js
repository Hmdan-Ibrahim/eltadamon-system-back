import { Neighbordhood } from "../models/Neighbordhood.js";

import { createModel } from "../util/crudModels/createModel.js";
import { getModel } from "../util/crudModels/getModel.js";
import { foundError, notFoundError } from "../util/ErrorsMessages.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";

const Model = Neighbordhood
const ModelName = "الحي"
const populates = [
    { path: "project", select: "name" },
    { path: "supervisor", select: "name phone" },
];

const createNeighbordhood = createModel((req) => {
    const { name, project, supervisor } = req.body
    return {
        Model, ModelName,
        foundErrorMessage: foundError(ModelName),
        searchObj: { name },
        reqBody: { name, project, supervisor },
    }
})

const getAllNeighbordhoods = getAllModels(Model, "الأحياء", populates)
const getNeighbordhood = getModel(Model, ModelName, notFoundError(ModelName), populates)
const updateNeighbordhood = updateModel(Model, ModelName, notFoundError(ModelName), populates)
const deleteNeighbordhood = deleteModel(Model, ModelName, notFoundError(ModelName))

export {
    createNeighbordhood,
    getAllNeighbordhoods,
    getNeighbordhood,
    updateNeighbordhood,
    deleteNeighbordhood
}

// const getAllNeighbordhoods = async (req, res) => {
//     try {
//         const projects = await Project.find().populate("region");
//         res.json(projects);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }

// const getProject = async (req, res) => {
//     async (req, res) => {
//         try {
//             const projects = await Project.find().populate("region");
//             res.json(projects);
//         } catch (err) {
//             res.status(500).json({ error: err.message });
//         }
//     }
// }

// controllers/ProjectController.js
// import { Project } from '../models/Project.js';
// export const getProjects = async (req,res)=>{const list=await Project.find();res.json({success:true,data:list});}
// export const getProject = async (req,res)=>{const r=await Project.findById(req.params.id);if(!r)return res.status(404).json({success:false,message:"غير موجود"});res.json({success:true,data:r});}
