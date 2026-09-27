import { model, Schema } from "mongoose";

const SchoolSchema = new Schema({
  name: {
    type: String,
    required: [true, "لابد من وجود أسم للمدرسة."]
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: [true, "يجب تحديد المشروع التابع لها هذه المدرسة!"]
  },
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    // required: [true, "لابد من كل منطقة أن يكون لها مدير."]
  },
  district: String,
  neighborhood: String,
  sex: {
    type: String, enum: ["بنين", "بنات"],
    //  required: [true, "حقل الجنس مطلوب"] 
  },
  ministerialNumber: {
    type: String,
    // required: [true, "لابد من وجود الرقم الوزاري!"],
    unique: [true, "هذه الرقم موجود بالفعل!"]
  },
  gps: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

SchoolSchema.index({ project: 1, supervisor: 1 });
export const School = model('School', SchoolSchema);

