import { Types } from "mongoose";
import { asyncWrapperMiddleware } from "../middleware/asyncWrapperMiddleware.js";
import { DailyOrder } from "../models/DailyOrder.js";
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

// const createDailyOrder = createModel(reqq => ({
//     Model, ModelName,
//     foundErrorMessage: foundError(ModelName),
//     reqBody: reqq.body,
// }))
const createDailyOrder = (req, res, next) => {
    const isCollection = Array.isArray(req.body)

    if (!isCollection) {
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
    const projectId = new Types.ObjectId(req.params.projectId);
    const userId = req.user._id;           // المستخدم الحالي
    const userRole = req.user.role;        // دوره، مثل "supervisor"
    const date = new Date(req.query.sendingDate);
    // if (isNaN(date)) {
    //     return res.status(400).json({
    //         status: "fail",
    //         message: "المدخل الخاص بالتاريخ غير صالح"
    //     });
    // }
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));

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
        message: "(ModelsName)",
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


// async (req, res) => {
//     try {
//         const order = new DailyOrder(req.body);
//         await order.save();
//         res.status(201).json(order);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// }

// const getAllDailyOrders = async (req, res) => {
//     try {
//         const { school, driver, operator, startDate, endDate } = req.query;
//         const filter = {};
//         if (school) filter.school = school;
//         if (driver) filter.driver = driver;
//         if (operator) filter.operator = operator;
//         if (startDate || endDate) filter.createdAt = {};
//         if (startDate) filter.createdAt.$gte = new Date(startDate);
//         if (endDate) filter.createdAt.$lte = new Date(endDate);

//         const orders = await DailyOrder.find(filter)
//             .populate("school")
//             .populate("driver")
//             .populate("supervisor")
//             .populate("vehicle")
//             .populate("well");

//         res.json(orders);
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// }