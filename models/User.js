import { model, Schema } from "mongoose";
import { Roles } from "../util/Roles.js";
import { compare, hash } from "bcryptjs";
import { Region } from "./Region.js";
import { notFoundError, notFoundError2 } from "../util/ErrorsMessages.js";
import { Project } from "./Project.js";

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    unique: [true, "المستخدم موجود!"]
  },
  password: {
    type: String,
    required: [true, "يجب تعيين كلمة المرور الخاصة بالمستخدم!"],
    minlength: [6, "كلمة المرور لابد أن تكون من 6 أحرف أو أكثر!"],
    select: false
  },
  phone: {
    type: String,
    required: [true, "يجب ادراج الموبايل!"],
    unique: [true, "الموبايل لابد أن يكون فريداً!"]
  },
  role: {
    type: String,
    required: [true, "لابد من تحديد الدور الوظيفي"],
    enum: [Roles.MANAGER, Roles.REGION_MANAGER, Roles.PROJECT_MANAGER, Roles.SUPERVISOR, Roles.DRIVER, Roles.CONTRACTOR]
  },
  trip: {
    type: Number,
    required: [function () { return (this.role == Roles.DRIVER) }, "لابد من تحديد الترب الخاص بالسائق!"],
  },
  region: {
    type: Schema.Types.ObjectId,
    ref: "Region",
    required: [function () {

      return (this.role == Roles.REGION_MANAGER);
    }, `يجب تحديد المنطقة للمستخدم`]
  },
  project: {
    type: Schema.Types.ObjectId,
    ref: "Project",
    required: [function () {
      return ([Roles.PROJECT_MANAGER, Roles.SUPERVISOR, Roles.DRIVER, Roles.CONTRACTOR].includes(this.role))
    }, `يجب تحديد المشروع للمستخدم`]
  },
  userAgent: String,
  deviceIp: String,
  isLogining: Boolean
}, { timestamps: true });

UserSchema.pre("save", async function (next) {

  if (this.region) {
    const region = await Region.findById(this.region)

    if (!region) {
      return next({ statusCode: 404, status: "failed", message: notFoundError2("المنطقة") });
    }

    if (region.manager && this.role === Roles.REGION_MANAGER) {
      return next({ statusCode: 404, status: "fiald", message: "هذه المنطقة لديها مدير بالفعل!" });
    }
    if (this.role === Roles.REGION_MANAGER) {
      await Region.updateOne({ _id: this.region }, { manager: this._id });
    }

  }

  if (this.project) {
    const project = await Project.findById(this.project)

    if (!project) {
      return next({ statusCode: 404, status: "fiald", message: notFoundError("المشروع") });
    }

    if (project.manager && this.role === Roles.PROJECT_MANAGER) {
      return next({ statusCode: 404, status: "fiald", message: "هذا المشروع لديه مدير بالفعل!" });
    }
    if (this.role === Roles.PROJECT_MANAGER) {
      await Project.updateOne({ _id: this.project }, { manager: this._id });
    }
  }

  if (!this.isModified("password")) return next();
  this.password = await hash(this.password, 10);
  next();
})

UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  // إذا لم يكن هناك حقل password في التحديث → تجاهل
  if (!update.password) return next();

  // إذا تم إرسال كلمة مرور جديدة → نقوم بتشفيرها
  const hashedPassword = await hash(update.password, 10);
  this.setUpdate({ ...update, password: hashedPassword });
  next();
});

UserSchema.methods.correctPassword = async function (candidatePassword) {
  return await compare(candidatePassword, this.password);
};

export const User = model("User", UserSchema);
