import { model, Schema } from "mongoose";

const VehicleSchema = new Schema({
  plateNumber: {
    type: String,
    required: [true, "رجاءاً حدد رقم لوحة السيارة!"],
    unique: [true, "هذه السيارة موجودة بالفعل!"]
  },
  capacity: {
    type: Number,
    required: [true, "حدد سعة السيارة!"]
  }, // e.g., liters
  driver: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },// e.g., liters
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, "يجب تحديد المشروع التابع لها هذه المدرسة!"]
  } // e.g., liters
}, { timestamps: true });

export const Vehicle = model('Vehicle', VehicleSchema)