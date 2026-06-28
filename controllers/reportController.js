import mongoose from "mongoose";
import { DailyOrder } from "../models/DailyOrder.js";
import { getDaysInMonth } from "../util/functions.js";
import { StatusOrder as status } from "../util/StatusOrder.js";
import { SuccessGetMessage } from "../util/SuccessMessages.js";
import { Roles } from "../util/Roles.js";

const Model = DailyOrder

export async function gitReports(req, res) {
  const { project, groupBy = "transporter", sendingDate, ordersType, StatusOrder = status.IMPLEMENTED } = req.query
  const projectId = new mongoose.Types.ObjectId(project);
  const userId = req.user._id;
  const userRole = req.user.role;

  const year = new Date(sendingDate).getFullYear()
  const month = new Date(sendingDate).getMonth() + 1
  const numDays = getDaysInMonth(new Date(sendingDate).getFullYear(), month)

  const start = new Date(`${year}-${month}`);
  const end = new Date(`${year}-${month}-${numDays}`);

  const ContractPricePerTon = 11.5

  const groupFieldsMap = {
    transporter: "$transporter",
    school: "$school",
  };


  let firstMatch = {
    sendingDate: { $gte: start, $lte: end },
    orderType: ordersType,
    status: StatusOrder,
    ...(userRole === Roles.SUPERVISOR && { supervisor: userId }),
    ...(userRole === Roles.DRIVER && { transporter: userId })
  }

  const groupField = groupFieldsMap[groupBy] || "$transporter";
  const isGroupByTransporter = groupBy === "transporter";

  const reports = await Model.aggregate([
    {
      $match: firstMatch
    },
    {
      $lookup: {
        from: "schools",
        localField: "school",
        foreignField: "_id",
        pipeline: [
          { $project: { _id: 1, name: 1, project: 1 } },
        ],
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
          RequiredCapacity: isGroupByTransporter ? "$RequiredCapacity" : "$$REMOVE",
          day: { $dateToString: { format: "%Y-%m-%d", date: "$sendingDate" } },

          operator: isGroupByTransporter ? "$operator" : "$$REMOVE",
          vehicle: isGroupByTransporter ? "$vehicle" : "$$REMOVE",
          replyPrice: isGroupByTransporter ? "$replyPrice" : "$$REMOVE",
          well: isGroupByTransporter ? "$well" : "$$REMOVE",
        },
        totalCapacity: { $sum: "$RequiredCapacity" },
        ...(isGroupByTransporter && {
          totalPrice: { $sum: "$replyPrice" },
        }),
        totalOrders: { $sum: 1 },
        school: { $first: "$school" },
        transporter: { $first: "$transporter" },
      }
    },
    {
      $addFields: {
        totalRevenue: {
          $multiply: ["$totalCapacity", ContractPricePerTon]
        }
      }
    },
    {
      $group: {
        _id: {
          groupBy: "$_id.groupBy",
          RequiredCapacity: isGroupByTransporter ? "$_id.RequiredCapacity" : "$$REMOVE",
          operator: isGroupByTransporter ? "$_id.operator" : "$$REMOVE",
          vehicle: isGroupByTransporter ? "$_id.vehicle" : "$$REMOVE",
          replyPrice: isGroupByTransporter ? "$_id.replyPrice" : "$$REMOVE",
          well: isGroupByTransporter ? "$_id.well" : "$$REMOVE",
        },
        detailsOfDays: {
          $push: {
            day: "$_id.day",
            totalCapacityDay: "$totalCapacity",
            totalOrdersDay: isGroupByTransporter ? "$totalOrders" : "$$REMOVE",
            totalRevenueDay: isGroupByTransporter ? "$totalRevenue" : "$$REMOVE",
          }
        },
        monthlyOrders: { $sum: "$totalOrders" },
        monthlyCapacity: { $sum: "$totalCapacity" },
        ...(isGroupByTransporter && {
          monthlyPrice: { $sum: "$totalPrice" },
          monthlyRevenue: { $sum: "$totalRevenue" },
        }),
        school: { $first: "$school" },
        transporter: { $first: "$transporter" }
      }
    },
    {
      $lookup: {
        from: "schools",
        localField: "school",
        foreignField: "_id",
        pipeline: [
          { $project: { _id: 1, name: 1, ministerialNumber: 1 } },
        ],
        as: "schoolInfo"
      }
    },
    { $unwind: "$schoolInfo" },
    {
      $lookup: {
        from: "users",
        localField: "transporter",
        foreignField: "_id",
        pipeline: [
          { $project: { _id: 1, name: 1, accountNumber: 1, accountName: 1, trip: 1 } },
        ],
        as: "transporterInfo"
      }
    }, { $unwind: { path: "$transporterInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "vehicles",
        localField: "_id.vehicle",
        foreignField: "_id",
        pipeline: [
          { $project: { _id: 1, plateNumber: 1 } },
        ],
        as: "vehicleInfo"
      }
    },
    { $unwind: { path: "$vehicleInfo", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "wells",
        localField: "_id.well",
        foreignField: "_id",
        pipeline: [
          { $project: { _id: 1, name: 1 } },
        ],
        as: "wellInfo"
      }
    },
    { $unwind: { path: "$wellInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 1,
        ...(isGroupByTransporter && {
          transporter: "$transporterInfo",
          vehicle: "$vehicleInfo.plateNumber",
          well: "$wellInfo.name",

          RequiredCapacity: "$_id.RequiredCapacity",
          operator: "$_id.operator",

          replyPrice: {
            $round: [
              "$_id.replyPrice",
              2
            ]
          },
          monthlyPrice: {
            $round: ["$monthlyPrice", 2]
          },
          monthlyRevenue: {
            $round: ["$monthlyRevenue", 2]
          },
          ContractPricePerTon: { $literal: ContractPricePerTon }
        }),
        ...(!isGroupByTransporter && { school: "$schoolInfo.name", ministerialNumber: "$schoolInfo.ministerialNumber" }),
        detailsOfDays: 1,
        monthlyOrders: 1,
        totalCapacity: isGroupByTransporter ? { $multiply: ["$monthlyOrders", "$_id.RequiredCapacity"] } : "$monthlyCapacity",
      }
    },
    { $sort: { "operator": 1, "transporter.name": 1, "school": 1, "RequiredCapacity": 1 } },
    {
      $group: {
        _id: null,
        reports: { $push: "$$ROOT" },
        grandTotalOrders: { $sum: "$monthlyOrders" },
        grandTotalCapacity: { $sum: "$totalCapacity" },

        ...(isGroupByTransporter && {
          grandTotalPrice: { $sum: "$monthlyPrice" },
          grandTotalRevenue: { $sum: "$monthlyRevenue" }
        })
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
        grandTotalPrice: 1,
        grandTotalRevenue: 1,
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
