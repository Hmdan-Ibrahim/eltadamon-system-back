import mongoose, { isObjectIdOrHexString, Types } from "mongoose";
import { DailyOrder } from "../models/DailyOrder.js";
import { getDaysInMonth } from "../util/functions.js";
import { StatusOrder as status } from "../util/StatusOrder.js";

const Model = DailyOrder

export async function gitReports(req, res) {

  const { project, groupBy = "transporter", sendingDate, StatusOrder = status.IMPLEMENTED } = req.query
  const year = new Date(sendingDate).getFullYear()
  const month = new Date(sendingDate).getMonth() + 1
  const numDays = getDaysInMonth(new Date(sendingDate).getFullYear(), month)
  const projectId = new mongoose.Types.ObjectId(project);
  const start = new Date(`${year}-${month}`);
  const end = new Date(`${year}-${month}-${numDays}`);

  const groupFieldsMap = {
    transporter: "$transporter",
    school: "$school",
    supervisor: "$supervisor",
    operator: "$operator",
    vehicle: "$vehicle"
  };

  // الافتراضي لو لم يتم إرسال groupBy
  const groupField = groupFieldsMap[groupBy] || "$transporter";
  const reports = await Model.aggregate([
    {
      $match: {
        sendingDate: { $gte: start, $lte: end },
        status: StatusOrder
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
          operator: "$operator",
          vehicle: "$vehicle",
          replyPrice: "$replyPrice",
        },
        totalPrice: { $sum: "$replyPrice" },
        totalOrders: { $sum: 1 },
        totalOrdersDone: { $sum: { $cond: [{ $ifNull: ["$executionTime", false] }, 1, 0] } },
        // totalAmount: { $sum: "$amount" },
        school: { $first: "$school" },
        supervisor: { $first: "$supervisor" },
        transporter: { $first: "$transporter" },
      }
    },

    // { $sort: { "_id.day": 1 } },
    {
      $group: {
        _id: {
          groupBy: "$_id.groupBy",
          RequiredCapacity: "$_id.RequiredCapacity",
          operator: "$_id.operator",
          vehicle: "$_id.vehicle",
          replyPrice: "$_id.replyPrice",

        },
        detailsOfDays: {
          $push: {
            day: "$_id.day",
            totalOrders: "$totalOrders"
          }
        },
        monthlyOrders: { $sum: "$totalOrders" },
        monthlyOrdersDone: { $sum: "$totalOrdersDone" },

        totalPrice: { $sum: "$totalPrice" },


        school: { $first: "$school" },
        supervisor: { $first: "$supervisor" },
        transporter: { $first: "$transporter" },

        // totalPrice: { $sum: "$totalAmount" },
      }
    },
    // ...(groupBy === "transporter" ? [
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
    // ] : []),
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
    // {
    //   $lookup: {
    //     from: "users",
    //     localField: "_id.supervisor",
    //     foreignField: "_id",
    //     as: "supervisorInfo",
    //   },
    // },
    // { $unwind: { path: "$supervisorInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        transporter: "$transporterInfo.name",
        trip: "$transporterInfo.trip",
        school: "$schoolInfo.name",
        supervisor: "$supervisorInfo.name",
        RequiredCapacity: "$_id.RequiredCapacity",
        operator: "$_id.operator",
        vehicle: "$vehicleInfo.plateNumber",
        replyPrice: "$_id.replyPrice",
        // replyPrice: 1,
        detailsOfDays: 1,
        monthlyOrders: 1,
        monthlyOrdersDone: 1,
        totalCapacity: { $multiply: ["$monthlyOrders", "$_id.RequiredCapacity"] },
        totalCapacityDone: { $multiply: ["$monthlyOrdersDone", "$_id.RequiredCapacity"] },

        totalPrice: 1,
      }
    },
    { $sort: { operator: 1, transporter: 1, RequiredCapacity: 1 } },
    {
      $group: {
        _id: null,
        reports: { $push: "$$ROOT" },
        grandTotalOrders: { $sum: "$monthlyOrders" },
        grandTotalOrdersDone: { $sum: "$monthlyOrdersDone" },
        grandTotalCapacity: { $sum: "$totalCapacity" },
        grandTotalCapacityDone: { $sum: "$totalCapacityDone" },
        grandTotalPrice: { $sum: "$totalPrice" }
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
      }
    }
  ])

  res.status(200).json({
    status: "success",
    statusCode: 200,
    message: "SuccessGetMessage(ModelsName)",
    result: reports.length,
    data: reports[0]
  });
}




/**
 * Create a daily delivery document.
 * Body:
 * {
 *   date: "2025-10-19",
 *   school: "<schoolId>",
 *   supervisor: "<supervisorId>",
 *   details: [
 *     { driver: "<id>", vehicle: "<id>", well: "<id>", tripsCount: 2 },
 *     ...
 *   ]
 * }
 */
// exports.createDailyDelivery = async (req, res) => {
//   try {
//     const { date, school, supervisor, details = [], notes } = req.body;
//     // preload vehicle capacities to calculate deliveredVolume
//     const vehicleIds = Array.from(new Set(details.map(d => d.vehicle)));
//     const vehicles = await Vehicle.find({ _id: { $in: vehicleIds } }).lean();
//     const capMap = {};
//     vehicles.forEach(v => capMap[v._id.toString()] = v.capacity);

//     // build details with computed deliveredVolume
//     const mappedDetails = details.map(d => {
//       const cap = capMap[d.vehicle];
//       if (cap === undefined) throw new Error(`Vehicle ${d.vehicle} not found`);
//       const trips = Number(d.tripsCount || 0);
//       const deliveredVolume = trips * cap;
//       return {
//         driver: d.driver,
//         vehicle: d.vehicle,
//         well: d.well,
//         tripsCount: trips,
//         deliveredVolume
//       };
//     });

//     const dd = new DailyDelivery({
//       date: new Date(date),
//       school,
//       supervisor,
//       details: mappedDetails,
//       notes
//     });

//     await dd.save();
//     res.status(201).json(dd);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// };

/**
 * GET daily report for a school & date
 * query: ?schoolId=...&date=YYYY-MM-DD
 */

// exports.getDailyReport = async (req, res) => {
//   try {
//     const { schoolId, date } = req.query;
//     if (!schoolId || !date) return res.status(400).json({ error: 'schoolId and date required' });

//     const d = new Date(date);
//     const start = new Date(d.setHours(0, 0, 0, 0));
//     const end = new Date(d.setHours(23, 59, 59, 999));

//     const deliveries = await DailyDelivery.find({
//       school: schoolId,
//       date: { $gte: start, $lte: end }
//     })
//       .populate('supervisor', 'name')
//       .populate('details.driver', 'name')
//       .populate('details.vehicle', 'plate capacity')
//       .populate('details.well', 'name')
//       .lean();

//     // Summarize per well and total capacity
//     let totalVolume = 0;
//     const wellCounts = {}; // wellId -> { wellName, trips, volume }
//     const rows = [];

//     deliveries.forEach(del => {
//       del.details.forEach(dt => {
//         const v = dt.deliveredVolume || (dt.tripsCount * (dt.vehicle?.capacity || 0));
//         totalVolume += v;
//         const wid = dt.well._id.toString();
//         if (!wellCounts[wid]) wellCounts[wid] = { wellName: dt.well.name, trips: 0, volume: 0 };
//         wellCounts[wid].trips += dt.tripsCount;
//         wellCounts[wid].volume += v;

//         rows.push({
//           driver: dt.driver.name,
//           vehicle: dt.vehicle.plate,
//           vehicleCapacity: dt.vehicle.capacity,
//           well: dt.well.name,
//           tripsCount: dt.tripsCount,
//           deliveredVolume: v
//         });
//       });
//     });

//     res.json({
//       schoolId,
//       date,
//       totalVolume,
//       wellBreakdown: Object.values(wellCounts),
//       rows,
//       deliveriesCount: deliveries.length
//     });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

/**
 * Monthly aggregation for a school: total volume & per well for given month
 * query: ?schoolId=...&year=2025&month=10
 */
// exports.getMonthlyReport = async (req, res) => {
//   try {
//     const { schoolId, year, month } = req.query;
//     if (!schoolId || !year || !month) return res.status(400).json({ error: 'schoolId, year, month required' });
//     const y = Number(year);
//     const m = Number(month); // 1-12
//     const start = new Date(y, m - 1, 1);
//     const end = new Date(y, m, 1); // exclusive

//     // Aggregate: unwind details, group by well and sum deliveredVolume, sum tripsCount, and total
//     const pipeline = [
//       { $match: { school: new require('mongoose').Types.ObjectId(schoolId), date: { $gte: start, $lt: end } } },
//       { $unwind: "$details" },
//       {
//         $group: {
//           _id: "$details.well",
//           totalTrips: { $sum: "$details.tripsCount" },
//           totalVolume: { $sum: "$details.deliveredVolume" }
//         }
//       },
//       { $lookup: { from: "wells", localField: "_id", foreignField: "_id", as: "well" } },
//       { $unwind: { path: "$well", preserveNullAndEmptyArrays: true } },
//       { $project: { wellId: "$_id", wellName: "$well.name", totalTrips: 1, totalVolume: 1, _id: 0 } }
//     ];

//     const perWell = await DailyDelivery.aggregate(pipeline);

//     // total for month
//     const total = perWell.reduce((s, r) => s + (r.totalVolume || 0), 0);

//     res.json({ schoolId, year: y, month: m, totalVolume: total, perWell });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
