import { model, Schema } from "mongoose";
import Operators from "../util/Operators.js";
import { Vehicle } from "./Vehicle.js";
import { Well } from "./Well.js";
import { StatusOrder } from "../util/StatusOrder.js";

const DailyOrderSchema = new Schema({
    school: {
        type: Schema.Types.ObjectId,
        required: [true, "حدد المدرسة!"],
        ref: "School",
    },
    supervisor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: [true, "حدد المشرف الذي قام بالطلب!"]
    },
    operator: {
        type: String,
        enum: [Operators.altadhamun, Operators.contractor, Operators.purchases],
        default: Operators.purchases
    },
    transporter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: [true, "حدد الموصل!"]
    },
    vehicle: {
        type: Schema.Types.ObjectId, ref: 'Vehicle',
        required: function () {
            return this.operator === Operators.altadhamun;
        }
    },
    RequiredCapacity: {
        type: Number,
        required: function () {
            return [Operators.contractor, Operators.purchases].includes(this.operator);
        }
    },
    replyPrice: {       // التعريفة لكل رد
        type: Number,
        // required: function () {
        //     return [Operators.contractor, Operators.purchases].includes(this.operator);
        // }
    },
    well: {
        type: Schema.Types.ObjectId,
        ref: 'Well',
        // required: [true, "حدد نوع الطلب!"]
    },
    status: { type: String, enum: [StatusOrder.NOT_IMPLEMENTED, StatusOrder.IMPLEMENTED], default: "لم ينفذ" },     // محسوب تلقائيًا = deliveredVolumeTon * replyPrice
    sendingDate: {
        type: Date,
        required: [true, "حدد موعد الارسال!"],
    },
    image: String,
    executionTime: Date,
    notes: String
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

DailyOrderSchema.pre("save", async function (next) {
    try {
        // تعيين default من vehicle.capacity إذا لم يُعطَ
        if (!this.RequiredCapacity && this.vehicle) {
            const vehicle = await Vehicle.findById(this.vehicle);
            if (vehicle) {
                this.RequiredCapacity = vehicle.capacity;
            }
        }

        if (this.operator === Operators.altadhamun) {
            const well = await Well.findById(this.well);
            if (!well) throw new Error("well غير موجود");

            this.replyPrice = this.RequiredCapacity * well.pricePerUnit;
        }
        next();
    } catch (err) {
        next(err);
    }
});

DailyOrderSchema.virtual("totalReplayPrice").get(function () {
    return this.RequiredCapacity * this.replyPrice;
})

export const DailyOrder = model("DailyOrder", DailyOrderSchema)