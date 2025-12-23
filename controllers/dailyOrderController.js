import { Types } from "mongoose";
import { asyncWrapperMiddleware } from "../middleware/asyncWrapperMiddleware.js";
import { DailyOrder } from "../models/DailyOrder.js";
import { School } from "../models/School.js";
import { createModel } from "../util/crudModels/createModel.js";
import { deleteModel } from "../util/crudModels/deleteModel.js";
import { getAllModels } from "../util/crudModels/getAllModels.js";
import { getModel } from "../util/crudModels/getModel.js";
import { updateModel } from "../util/crudModels/updateModel.js";
import { foundError, notFoundError } from "../util/ErrorsMessages.js";
import { getDaysInMonth } from "../util/functions.js";
import { createCollection } from "../util/crudModels/createCollection.js";
import { Roles } from "../util/Roles.js";

const Model = DailyOrder
const ModelName = "الطلب اليومي"
const populates = [
    { path: "school", select: "name" },
    { path: "supervisor", select: "name" },
    { path: "transporter", select: "name" },
    { path: "vehicle", select: "name" },
    { path: "well", select: "name" },
];


const createDailyOrder = async(req, res, next) => {
    const isCollection = Array.isArray(req.body)

    if (!isCollection) {
        if (req.user.role == Roles.SUPERVISOR) {
            req.body.supervisor = req.user._id
        } else {
            const school =  await School.findById(req.body.school)
            req.body.supervisor = school?.supervisor
        }
        return createModel(_ => ({
            Model, ModelName,
            foundErrorMessage: foundError(ModelName),
            reqBody: req.body,
        }))(req, res, next)
    }

    const { school, sendingDate } = req.body[0]
    //      $expr: {
    //     $and: [
    //       { $eq: [{ $month: "$sendingDate" }, month] },
    //       { $eq: [{ $year: "$sendingDate" }, year] }
    //     ]
    //   }
    // }
    const year = new Date(sendingDate).getFullYear()
    const month = new Date(sendingDate).getMonth() + 1

    return createCollection({
        Model, ModelName: "الطلبات اليومية",
        foundErrorMessage: "تم اضافة هذه الطلبات الخاصة بهذه المدرسة لهذا الشهر سابقاً",
        reqBody: req.body,
        searchObj: {
            school,
            $expr: {
                $and: [
                    { $eq: [{ $month: "$sendingDate" }, month] },
                    { $eq: [{ $year: "$sendingDate" }, year] }
                ]
            }
        }
    })(req, res, next)
}


const getAllDailyOrders = getAllModels(Model, "الطلبات", populates)

const getDailyOrdersByProject = asyncWrapperMiddleware(async (req, res) => {
    const projectId = new Types.ObjectId(req.params.projectId) || user?.project;
    const userId = req.user._id;
    const userRole = req.user.role;
    const date = new Date(req.query.sendingDate);
    // if (isNaN(date)) {
    //     return res.status(400).json({
    //         status: "fail",
    //         message: "المدخل الخاص بالتاريخ غير صالح"
    //     });
    // }
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    // ========== إعداد pipeline ==========
    const schoolMatchPipeline = [
        { $match: { $expr: { $eq: ["$_id", "$$schoolId"] } } },
        { $match: { project: projectId } }
    ];



    // إذا المستخدم مشرف، فلترة حسب المشرف فقط
    if (userRole === Roles.SUPERVISOR) {
        schoolMatchPipeline.push({ $match: { supervisor: userId } });
    }
    schoolMatchPipeline.push({ $project: { _id: 1, name: 1, supervisor: 1 } })

    const dailyOrders = await Model.aggregate([
        {
            $match: {
                sendingDate: { $gte: start, $lte: end },
            }
        },
        {
            $lookup: {
                from: "schools",
                let: { schoolId: "$school" },
                pipeline: schoolMatchPipeline,
                as: "school"
            }
        },
        // { $match: { "school.0": { $exists: true } } },  // faster filtering
        { $unwind: "$school" },
        // ========== 2) SUPERVISOR FROM SCHOOL ==========
        {
            $lookup: {
                from: "users",
                let: { supervisorId: "$school.supervisor" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$supervisorId"] } } },
                    { $project: { _id: 1, name: 1 } }
                ],
                as: "supervisor"
            }
        },
        { $unwind: { path: "$supervisor", preserveNullAndEmptyArrays: true } },

        // TRANSPORTER
        {
            $lookup: {
                from: "users",
                let: { userId: "$transporter" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
                    { $project: { _id: 1, name: 1 } }
                ],
                as: "transporter"
            }
        },
        { $unwind: { path: "$transporter", preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: "users",
                localField: "supervisor",
                foreignField: "_id",
                as: "supervisorInfo"
            }
        },
        { $unwind: { path: "$supervisorInfo", preserveNullAndEmptyArrays: true } },
        // VEHICLE
        {
            $lookup: {
                from: "vehicles",
                let: { id: "$vehicle" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                    { $project: { _id: 1, plateNumber: 1 } }
                ],
                as: "vehicle"
            }
        },
        { $unwind: { path: "$vehicle", preserveNullAndEmptyArrays: true } },
        // WELL
        {
            $lookup: {
                from: "wells",
                let: { id: "$well" },
                pipeline: [
                    { $match: { $expr: { $eq: ["$_id", "$$id"] } } },
                    { $project: { _id: 1, name: 1 } }
                ],
                as: "well"
            }
        },
        { $unwind: { path: "$well", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                school: 1,
                supervisor: 1,
                transporter: 1,
                vehicle: 1,
                well: 1,
                operator: 1,
                RequiredCapacity: 1,
                replyPrice: 1,
                status: 1,
                sendingDate: 1,
                executionTime: 1,
                notes: 1
            }
        },
        { $sort: { sendingDate: -1 } },
    ])

    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "تم جلب الطلبات بنجاح",
        result: dailyOrders.length,
        data: dailyOrders
    });
})
const getDailyOrder = getModel(Model, ModelName, notFoundError(ModelName), populates)
// const getDailyOrderByProject = getModel(Model, ModelName, notFoundError(ModelName), populates)
const updateDailyOrder = updateModel(Model, ModelName, notFoundError(ModelName), populates)
const deleteDailyOrder = deleteModel(Model, ModelName, notFoundError(ModelName))


export {
    createDailyOrder,
    getAllDailyOrders,
    getDailyOrder,
    updateDailyOrder,
    deleteDailyOrder,
    getDailyOrdersByProject
}
