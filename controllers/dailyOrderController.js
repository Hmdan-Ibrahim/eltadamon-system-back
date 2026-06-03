import PptxGenJS from "pptxgenjs";
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
import path from "path";

const Model = DailyOrder
const ModelName = "الطلب اليومي"
const populates = [
    { path: "school", select: "name" },
    { path: "supervisor", select: "name" },
    { path: "transporter", select: "name" },
    { path: "vehicle", select: "name" },
    { path: "well", select: "name" },
];


const createDailyOrder = async (req, res, next) => {
    const isCollection = Array.isArray(req.body)

    if (!isCollection) {
        if (req.user.role == Roles.SUPERVISOR) {
            req.body.supervisor = req.user._id
        } else {
            const school = await School.findById(req.body.school)
            req.body.supervisor = school?.supervisor
        }
        return createModel(_ => ({
            Model, ModelName,
            foundErrorMessage: foundError(ModelName),
            reqBody: req.body,
        }))(req, res, next)
    }

    const { school, sendingDate } = req.body[0]
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
    const aggregateProject = {
        _id: 1,
        school: 1,
        supervisor: 1,
        transporter: 1,
        vehicle: 1,
        well: 1,
        operator: 1,
        RequiredCapacity: 1,
        replyPrice: 1,
        driverTrip: 1,
        status: 1,
        orderType: 1,
        sendingDate: 1,
        executionTime: 1,
        buildingImage: 1,
        images: 1,
        notes: 1
    }
    const dailyOrders = await getDailyOrdersByProjectID(req, res, aggregateProject)

    res.status(200).json({
        status: "success",
        statusCode: 200,
        message: "تم جلب الطلبات بنجاح",
        result: dailyOrders.length,
        data: dailyOrders
    });
})
const getDailyOrder = getModel(Model, ModelName, notFoundError(ModelName), populates)
const updateDailyOrder = updateModel(Model, ModelName, notFoundError(ModelName), populates)
const deleteDailyOrder = deleteModel(Model, ModelName, notFoundError(ModelName))

const createPowerPoint = asyncWrapperMiddleware(async function (req, res) {
    const aggregateProject = {
        _id: 1,
        school: 1,
        RequiredCapacity: 1,
        status: 1,
        orderType: 1,
        sendingDate: 1,
        buildingImage: 1,
        images: 1,
    }
    const orders = await getDailyOrdersByProjectID(req, res, aggregateProject)

    const pptx = new PptxGenJS();
    const TextPropsOptions = {
        x: 6.5, y: 3.4, w: 3.27, h: 1.7,
        rtlMode: true,
        align: "right",
        fontFace: "Arial",
        fontSize: 16
    }

    const roundedTitle = {
        x: 1.2, y: 1, w: 2.8, h: 0.3,
        align: "center",
        shape: pptx.ShapeType.roundRect,
        fill: {
            color: "0F9AA8",
        },
        line: {
            color: "003E41",
            pt: 2,
        },
        rectRadius: 0.5,
        color: "FFFFFF",
        fontSize: 17,
    }

    for (const order of orders) {
        const slide = pptx.addSlide();

        slide.addImage({
            path: "https://cbewgzwgdgorzcuccqsp.supabase.co/storage/v1/object/public/logos/tadamon",
            x: 0.1, y: 0.1, w: 1.3, h: 0.8,
        })

        slide.addText("التقرير المصور لمباشرة المواقع", {
            y: 0.1, w: 10, h: 0.58, align: "center", bold: true, color: "0099A1",
        })

        slide.addText("صور توضيحية لإتمام الاعمال", { ...roundedTitle, x: 1.8, y: 0.8 })
        slide.addText("صورة المبنى", { ...roundedTitle, x: 7, y: 0.8 })

        slide.addText([
            { text: ` ${order.school.name}:اسم المبنى\n` },
            { text: ` ${order.school.neighborhood || ""}:الموقع\n` },
            {
                text: ` ${order.school.ministerialNumber || "M023822342"
                    } :الرقم الوزاري\n`,
            },
            { text: ` طن ${order.RequiredCapacity}رد 1 : عدد الردود \n` },
            { text: ` ثابت : نوع المباشرة` },
        ], TextPropsOptions);

        if (order.buildingImage) {
            slide.addImage({
                path: order.buildingImage,
                x: 6.8,
                y: 1.2,
                w: 3,
                h: 2.3,
            });
        }

        if (Array.isArray(order.images)) {

            let x = 0.3;
            let y = 1.2;

            const images = [
                ...(order.images || []),
                ...(order.buildingImage ? [order.buildingImage] : []),
            ];

            const finalImages =
                images.length >= 4
                    ? images.slice(0, 4)
                    : Array.from(
                        { length: 4 },
                        (_, i) => images[i % images.length]
                    );

            finalImages.forEach((image, index) => {
                slide.addImage({
                    path: image, x, y, w: 3, h: 1.9,
                });

                x += 3.2;
                if ((index + 1) % 2 === 0) {
                    x = 0.3;
                    y += 2;
                }
            });

            slide.addImage({
                path: "https://cbewgzwgdgorzcuccqsp.supabase.co/storage/v1/object/public/logos/TBC",
                x: 0.3, y: 5.3, w: 0.42, h: 0.2,
            })

            slide.addShape(pptx.ShapeType.line, {
                x: 0.76, y: 5.25, w: 0, h: 0.27,
                line: { color: "A6A6A6", pt: 1.5 },
            });
            slide.addText("جميع الحقوق محفوظة لـ شركة تطوير للمباني © 2025", {
                x: 0.76, y: 5.28, w: 2.5, h: 0.25, fontSize: 8, color: "A6A6A6", rtlMode: true,
            })

            slide.addImage({
                path: "https://cbewgzwgdgorzcuccqsp.supabase.co/storage/v1/object/public/logos/land-sterling",
                x: 8.5, y: 5.3, w: 1.4, h: 0.25,
            })
        }
    }

    const buffer = await pptx.write("nodebuffer");

    // Headers
    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    );

    res.setHeader(
        "Content-Disposition",
        'attachment; filename="orders-report.pptx"'
    );

    res.send(buffer);
})


const getDailyOrdersByProjectID = async (req, res, aggregateProject) => {
    const projectId = new Types.ObjectId(req.params.projectId || req.query.projectId || req.user?.project);
    const userId = req.user._id;
    const userRole = req.user.role;
    const date = new Date(req.query.sendingDate);

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const matchStage = {
        sendingDate: {
            $gte: start,
            $lte: end,
        },
    };

    if (req.query.projectId) {
        matchStage.status = "منفذ";
    }

    if (userRole === Roles.SUPERVISOR) {
        matchStage.supervisor = userId;
    }

    if (userRole === Roles.DRIVER) {
        matchStage.transporter = userId;
    }

    const schoolMatchPipeline = [
        { $match: { $expr: { $eq: ["$_id", "$$schoolId"] } } },
        { $match: { project: projectId } }
    ];

    if (userRole === Roles.SUPERVISOR) {
        schoolMatchPipeline.push({ $match: { supervisor: userId } });
    }

    const pipeline = [
        {
            $match: matchStage
        },
        {
            $lookup: {
                from: "schools",
                let: { schoolId: "$school" },
                pipeline: schoolMatchPipeline,
                as: "school"
            }
        },
        { $unwind: "$school" },
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
        { $unwind: { path: "$supervisorInfo", preserveNullAndEmptyArrays: true } }
    ]

    if (aggregateProject?.vehicle) {
        pipeline.push(
            {
                $lookup: {
                    from: "vehicles",
                    let: { id: "$vehicle" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$id"] },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                plateNumber: 1,
                            },
                        },
                    ],
                    as: "vehicle",
                },
            },
            {
                $unwind: {
                    path: "$vehicle",
                    preserveNullAndEmptyArrays: true,
                },
            }
        );
    }

    if (aggregateProject?.well) {
        pipeline.push(
            {
                $lookup: {
                    from: "wells",
                    let: { id: "$well" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$id"] },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                            },
                        },
                    ],
                    as: "well",
                },
            },
            {
                $unwind: {
                    path: "$well",
                    preserveNullAndEmptyArrays: true,
                },
            }
        );
    }

    pipeline.push(
        {
            $project: aggregateProject,
        },
        {
            $sort: {
                sendingDate: -1,
            },
        }
    );

    const dailyOrders = await Model.aggregate(pipeline)

    return dailyOrders
}

export {
    createDailyOrder,
    getAllDailyOrders,
    getDailyOrder,
    updateDailyOrder,
    deleteDailyOrder,
    getDailyOrdersByProject,
    createPowerPoint,
}
