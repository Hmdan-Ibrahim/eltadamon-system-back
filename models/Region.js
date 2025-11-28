import { model, Schema } from "mongoose";

const RegionSchema = new Schema({
  name: {
    type: String,
    required: [true, "لابد من وجود أسم للمنطقة!"],
    unique: [true, "هذه المنطقة موجودة بالفعل!"]
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: "User",
    // required: [true, "لابد من كل منطقة أن يكون لها مدير."]
  }
  ,
  discription: {
    type: String,
    // required: [true, "لابد من كل منطقة أن يكون لها مدير."]
  }
}, { timestamps: true });

export const Region = model('Region', RegionSchema);
