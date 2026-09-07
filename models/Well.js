import { model, Schema } from "mongoose";

const WellSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  pricePerUnit: {
    type: Number,
    required: [true, "حدد السعر!"]
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
  }
}, { timestamps: true });

WellSchema.index(
  { project: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: {
      project: { $exists: true }
    }
  }
);

WellSchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: {
      project: { $exists: false }
    }
  }
);

export const Well = model('Well', WellSchema);