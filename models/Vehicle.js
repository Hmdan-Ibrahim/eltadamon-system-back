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
  },
  driver: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, "يجب تحديد المشروع التابع لها هذه السيارة!"]
  }
}, { timestamps: true });

export const Vehicle = model('Vehicle', VehicleSchema)