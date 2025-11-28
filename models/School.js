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
  // optional extras
  address: String,
  gps: {
    lat: Number,
    lng: Number
  }
}, { timestamps: true });

export const School = model('School', SchoolSchema);


// import { model, Schema } from "mongoose";

// const SchoolSchema = new Schema({
//   name: {
//     type: String,
//     required: [true, "لابد من وجود أسم للمدرسة."]
//   },
//   neighbordhood: {
//     type: Schema.Types.ObjectId,
//     ref: 'Neighbordhood',
//     required: [true, "لابد من تحديد الحي التابع لها هذه المدرسة!"]
//     },
//     project: {
//       type: Schema.Types.ObjectId,
//       ref: 'Project',
//       // required: true
//   },
//   // optional extras
//   address: String,
//   gps: {
//     lat: Number,
//     lng: Number
//   }
// }, { timestamps: true });

// export const School = model('School', SchoolSchema);
