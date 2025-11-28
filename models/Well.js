import { model, Schema } from "mongoose";

const WellSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  pricePerUnit: {
    type: Number,
    required: [true, "حدد السعر!"]
  }
}, { timestamps: true });

export const Well = model('Well', WellSchema);