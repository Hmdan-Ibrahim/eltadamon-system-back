import { Project } from "../models/Project.js";
import { asyncWrapperMiddleware } from "../middleware/asyncWrapperMiddleware.js";
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
        case Roles.MANAGER: 
            filter = {};
            break;
        case Roles.REGION_MANAGER: 
            filter = { region };
            break;

        case Roles.PROJECT_MANAGER: 
            filter = { manager: _id }; 
            break;

        case Roles.SUPERVISOR: 
            filter = { supervisor: _id };
            break;

        default:
            throw new Error("دور المستخدم غير صالح!")
    }

    return filter;
});

const getAllProjects = getAllModels(Model, "المشاريع", populates)
const getProject = getModel(Model, ModelName, notFoundError(ModelName), populates)
const getProjectSignatures = asyncWrapperMiddleware(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
      .populate({
        path: "manager",
        select: "name signature role",
      })
      .populate({
        path: "region",
        populate: {
          path: "manager",
          select: "name signature role",
        },
      })
      .lean();
      
    if (!project) {
      return res.status(404).json({ message: "المشروع غير موجود" });
    }

    const projectManager = project.manager
      ? {
          name: project.manager.name,
          imageSignature: `${req.protocol}://${req.get("host")}:3000/uploads/${project.manager.signature}`,
        }
      : null;

    const regionManager = project.region?.manager
      ? {
          name: project.region.manager.name,
          imageSignature: `${req.protocol}://${req.get("host")}:3000/uploads/${project.region.manager.signature}`,
        }
      : null;

    res.status(200).json({
      projectManager,
      regionManager,
    });
})

const updateProject = updateModel(Model, ModelName, notFoundError(ModelName), populates)
const deleteProject = deleteModel(Model, ModelName, notFoundError(ModelName))

export {
    createProject,
    getCountProjectDocs,
    getAllProjects,
    getProject,
    getProjectSignatures,
    updateProject,
    deleteProject
}
