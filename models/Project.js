import { model, Schema } from "mongoose";

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: [true, "لابد أن تذكر اسم المشروع!"],
    minlength: [3, "لابد أن يكون اسم المشروع أكثر من 3 أحرف!"]
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: "User",
    // required: [true, "لابد من كل منطقة أن يكون لها مدير."]
  },
  region: {
    type: Schema.Types.ObjectId,
    ref: 'Region',
    required: [true, "يجب تحديد المنطقة التابع لها هذا المشروع!"]
  }
}, { timestamps: true });

export const Project = model('Project', ProjectSchema);
//_server.  _connectionKey: '6::::5000',