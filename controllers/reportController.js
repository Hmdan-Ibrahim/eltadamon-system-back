import mongoose from "mongoose";
import { DailyOrder } from "../models/DailyOrder.js";
import { getDaysInMonth } from "../util/functions.js";
import { StatusOrder as status } from "../util/StatusOrder.js";
import { SuccessGetMessage } from "../util/SuccessMessages.js";

const Model = DailyOrder

export async function gitReports(req, res) {
  const { project, groupBy = "transporter", sendingDate, ordersType, StatusOrder = status.IMPLEMENTED } = req.query
  const projectId = new mongoose.Types.ObjectId(project);

  const year = new Date(sendingDate).getFullYear()
  const month = new Date(sendingDate).getMonth() + 1
  const numDays = getDaysInMonth(new Date(sendingDate).getFullYear(), month)

  const start = new Date(`${year}-${month}`);
  const end = new Date(`${year}-${month}-${numDays}`);

  const groupFieldsMap = {
    transporter: "$transporter",
    school: "$school",
    supervisor: "$supervisor",
    operator: "$operator",
    vehicle: "$vehicle"
  };

  
  let firstMatch = {
    sendingDate: { $gte: start, $lte: end },
    orderType: ordersType
  }

  if (StatusOrder) {
    firstMatch.status = StatusOrder
  }

  const groupField = groupFieldsMap[groupBy] || "$transporter";

  // نحدد هل نعرض operator - vehicle - price
  const includeExtraFields = groupBy === "transporter";

  const reports = await Model.aggregate([
    {
      $match: firstMatch
    },
    {
      $lookup: {
        from: "schools",
        localField: "school",
        foreignField: "_id",
        as: "schoolInfo"
      }
    },
    { $unwind: "$schoolInfo" },
    {
      $match: {
        "schoolInfo.project": projectId,
      }
    },
    {
      $group: {
        _id: {
          groupBy: groupField,
          RequiredCapacity: "$RequiredCapacity",
          day: { $dateToString: { format: "%Y-%m-%d", date: "$sendingDate" } },
          // operator: "$operator",
          // vehicle: "$vehicle",
          // replyPrice: "$replyPrice",

          // operator: {
          //   $cond: [
          //     { $eq: [groupBy, "transporter"] },
          //     "$operator",
          //     null
          //   ]
          // },

          // vehicle: {
          //   $cond: [
          //     { $eq: [groupBy, "transporter"] },
          //     "$vehicle",
          //     null
          //   ]
          // },
          // replyPrice: {
          //   $cond: [
          //     { $eq: [groupBy, "transporter"] },
          //     "$replyPrice",
          //     null
          //   ]
          // },

          operator: includeExtraFields ? "$operator" : "$$REMOVE",
          vehicle: includeExtraFields ? "$vehicle" : "$$REMOVE",
          replyPrice: includeExtraFields ? "$replyPrice" : "$$REMOVE",
        },
        totalPrice: { $sum: "$replyPrice" },
        totalOrders: { $sum: 1 },
        school: { $first: "$school" },
        supervisor: { $first: "$supervisor" },
        transporter: { $first: "$transporter" },
      }
    },
    {
      $group: {
        _id: {
          groupBy: "$_id.groupBy",
          RequiredCapacity: "$_id.RequiredCapacity",
          // operator: "$_id.operator",
          // vehicle: "$_id.vehicle",
          // replyPrice: "$_id.replyPrice",
          operator: includeExtraFields ? "$_id.operator" : "$$REMOVE",
          vehicle: includeExtraFields ? "$_id.vehicle" : "$$REMOVE",
          replyPrice: includeExtraFields ? "$_id.replyPrice" : "$$REMOVE",
        },
        detailsOfDays: {
          $push: {
            day: "$_id.day",
            totalOrders: "$totalOrders"
          }
        },
        monthlyOrders: { $sum: "$totalOrders" },
        monthlyPrice: { $sum: "$totalPrice" },

        school: { $first: "$school" },
        supervisor: { $first: "$supervisor" },
        transporter: { $first: "$transporter" },
      }
    },
    {
      $lookup: {
        from: "schools",
        localField: "school",
        foreignField: "_id",
        as: "schoolInfo"
      }
    },
    { $unwind: "$schoolInfo" },
    {
      $lookup: {
        from: "users",
        localField: "transporter",
        foreignField: "_id",
        as: "transporterInfo"
      }
    }, { $unwind: { path: "$transporterInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "supervisor",
        foreignField: "_id",
        as: "supervisorInfo"
      }
    },
    { $unwind: { path: "$supervisorInfo", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "vehicles",
        localField: "_id.vehicle",
        foreignField: "_id",
        as: "vehicleInfo"
      }
    },
    { $unwind: { path: "$vehicleInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        transporter: "$transporterInfo",
        school: "$schoolInfo.name",
        supervisor: "$supervisorInfo.name",
        RequiredCapacity: "$_id.RequiredCapacity",
        operator: "$_id.operator",
        vehicle: "$vehicleInfo.plateNumber",
        replyPrice: {
          $round: [
            "$_id.replyPrice",
            2
          ]
        },
        detailsOfDays: 1,
        monthlyOrders: 1,
        totalCapacity: { $multiply: ["$monthlyOrders", "$_id.RequiredCapacity"] },
        monthlyPrice: {
          $round: ["$monthlyPrice", 2]
        }
      }
    },
    { $sort: { "operator": 1, "transporter.name": 1, "school": 1, "RequiredCapacity": 1 } },
    {
      $group: {
        _id: null,
        reports: { $push: "$$ROOT" },
        grandTotalOrders: { $sum: "$monthlyOrders" },
        // grandTotalOrdersDone: { $sum: "$monthlyOrdersDone" },
        grandTotalCapacity: { $sum: "$totalCapacity" },
        // grandTotalCapacityDone: { $sum: "$totalCapacityDone" },
        grandTotalPrice: { $sum: "$monthlyPrice" }
      }
    },
    {
      $project: {
        _id: 0,
        reports: 1,
        grandTotalOrders: 1,
        grandTotalOrdersDone: 1,
        grandTotalCapacity: 1,
        grandTotalCapacityDone: 1,
        grandTotalPrice: {
          $round: [
            "$grandTotalPrice",
            2
          ]
        }
      }
    }
  ])

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: SuccessGetMessage("التقارير"),
    result: reports[0]?.reports?.length || 0,
    data: reports[0] || {}
  });
}
