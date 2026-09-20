import { Types } from "mongoose";
import { SchoolQuota } from "../models/SchoolQuota.js";
import { createModel } from "../util/crudModels/createModel.js";
import { foundError2 } from "../util/ErrorsMessages.js";

const Model = SchoolQuota
const ModelName = "حصة المدرسة"
const populates = {
    path: "school",
    select: "name",
    path: "supervisor",
    select: "name"
}

export const createSchoolQuota = createModel((req) => {
    const {
        school,
        startDate,
        endDate,
        monthlyQuantity,
        notes
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return {
        Model, ModelName,
        foundErrorMessage: foundError2(ModelName),
        searchObj: {
            school, startDate: {
                $lte: end,
            },
            endDate: {
                $gte: start,
            },
        },
        data: {
            school,
            startDate: start,
            endDate: end,
            monthlyQuantity,
            notes,
        },
    }
})



// جلب كل الفترات الخاصة بمدرسة
// const getSchoolQuotas = async (req, res, next) => {
//     try {
//         const { schoolId } = req.params;

//         const quotas = await SchoolQuota.find({
//             school: schoolId,
//         })
//             .sort({ startDate: -1 });

//         res.json({
//             success: true,
//             data: quotas,
//         });

//     } catch (error) {
//         next(error);
//     }
// };


// // جلب الفترة الحالية
// const getCurrentQuota = async (req, res, next) => {
//     try {
//         const schoolId = req.params.schoolId;

//         const date = req.query.date
//             ? new Date(req.query.date)
//             : new Date();

//         const quota = await SchoolQuota.findOne({
//             school: schoolId,
//             startDate: { $lte: date },
//             endDate: { $gte: date },
//         });

//         if (!quota) {
//             return res.status(404).json({
//                 success: false,
//                 message: "لا توجد حصة محددة لهذه المدرسة في هذه الفترة",
//             });
//         }

//         res.json({
//             success: true,
//             data: quota,
//         });

//     } catch (error) {
//         next(error);
//     }
// };


// // جلب الحصة مع الكمية الموردة والمتبقية
// const getQuotaBalance = async (req, res, next) => {
//     try {
//         const { schoolId } = req.params;

//         const date = req.query.date
//             ? new Date(req.query.date)
//             : new Date();

//         const quota = await SchoolQuota.findOne({
//             school: schoolId,
//             startDate: { $lte: date },
//             endDate: { $gte: date },
//         });

//         if (!quota) {
//             return res.status(404).json({
//                 success: false,
//                 message: "لا توجد حصة لهذه المدرسة في هذه الفترة",
//             });
//         }

//         const result = await DailyOrder.aggregate([
//             {
//                 $match: {
//                     school: new Types.ObjectId(schoolId),

//                     sendingDate: {
//                         $gte: quota.startDate,
//                         $lte: quota.endDate,
//                     },

//                     status: "IMPLEMENTED",
//                 },
//             },
//             {
//                 $group: {
//                     _id: null,

//                     suppliedQuantity: {
//                         $sum: "$RequiredCapacity",
//                     },
//                 },
//             },
//         ]);

//         const suppliedQuantity =
//             result[0]?.suppliedQuantity || 0;

//         const remainingQuantity =
//             quota.totalQuantity - suppliedQuantity;

//         res.json({
//             success: true,

//             data: {
//                 quotaId: quota._id,

//                 school: quota.school,

//                 startDate: quota.startDate,
//                 endDate: quota.endDate,

//                 monthlyQuantity: quota.monthlyQuantity,

//                 totalQuantity: quota.totalQuantity,

//                 suppliedQuantity,

//                 remainingQuantity: Math.max(
//                     remainingQuantity,
//                     0
//                 ),

//                 exceeded:
//                     remainingQuantity < 0,
//             },
//         });

//     } catch (error) {
//         next(error);
//     }
// };


// return {
//     getSchoolQuotas,
//     getCurrentQuota,
//     getQuotaBalance,
// };
