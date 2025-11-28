import express from "express";

const router = express.Router();

// ✅ إضافة رحلة جديدة
// router.post("/", async (req, res) => {
//   try {
//     const trip = new Trip(req.body);
//     await trip.save();
//     res.status(201).json(trip);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // ✅ تقرير يومي مع إجمالي اليوم وإجمالي الشهر
// router.get("/report/:date", async (req, res) => {

//   const date = new Date(req.params.date);
//   const startOfDay = new Date(date.setHours(0, 0, 0, 0));
//   const endOfDay = new Date(date.setHours(23, 59, 59, 999));

//   // جلب جميع الرحلات لليوم المحدد
//   const dailyTrips = await Trip.find({
//     date: { $gte: startOfDay, $lte: endOfDay }
//   });

//   console.log("get",dailyTrips);

//   // حساب الإجمالي اليومي
//   const totalDailyTons = dailyTrips.reduce((sum, t) => sum + (t.capacityTons * t.tripsCount), 0);
//   const totalDailyTrips = dailyTrips.reduce((sum, t) => sum + t.tripsCount, 0);

//   // حساب الإجمالي الشهري
//   const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
//   const monthlyTrips = await Trip.find({
//     date: { $gte: startOfMonth, $lte: endOfDay }
//   });
//   const totalMonthlyTons = monthlyTrips.reduce((sum, t) => sum + (t.capacityTons * t.tripsCount), 0);
//   console.log("totalMonthlyTons",totalMonthlyTons);

//   res.json({
//     date: startOfDay.toISOString().split("T")[0] | "dsfdfs",
//     totalDailyTrips,
//     totalDailyTons,
//     totalMonthlyTons,
//     dailyDetails: dailyTrips
//   });
// });

// // ✅ جميع الرحلات (اختياري)
// router.get("/", async (req, res) => {
//   const trips = await Trip.find();
//   res.json(trips);
// });
