import { model, Schema } from "mongoose";
import Operators from "../util/Operators.js";
import { Vehicle } from "./Vehicle.js";
import { Well } from "./Well.js";
import { User } from "./User.js";
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
        required: [function () {
            return this.operator !== Operators.purchases;
        }, "حدد الموصل!"]
    },
    vehicle: {
        type: Schema.Types.ObjectId, ref: 'Vehicle',
        required: [function () {
            return this.operator === Operators.altadhamun;
        }, "حدد السيارة"]
    },
    RequiredCapacity: {
        type: Number,
        required: [function () {
            return [Operators.contractor, Operators.purchases].includes(this.operator);
        }, "حدد كمية الرد"]
    },
    replyPrice: {   
        type: Number,
        required: [function () {
             return [Operators.contractor, Operators.purchases].includes(this.operator);
        }, "حدد سعر الرد"]
    },
    well: {
        type: Schema.Types.ObjectId,
        ref: 'Well',
        required: [function () {
            return this.operator === Operators.altadhamun;
        }, "حدد تحلية الطلب!"]
    },
     driverTrip: {
        type: Number,
        // required: [function () {
        //     return this.operator === Operators.altadhamun;
        // }, "حدد تحلية الطلب!"]
    },
    status: { type: String, enum: [StatusOrder.NOT_IMPLEMENTED, StatusOrder.IMPLEMENTED], default: "لم ينفذ" },
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

            if(!this.driverTrip) {
                const driver = await User.findById(this.transporter);
                if (!driver) throw new Error("السائق غير موجود");
                this.driverTrip = driver.trip
            }            
        }
        next();
    } catch (err) {
        next(err);
    }
});

DailyOrderSchema.pre(/^(update|updateOne|updateMany|findOneAndUpdate|findByIdAndUpdate)/i, async function (next) {
    try {

        const update = this.getUpdate();
        const query = this.getQuery();

        const currentDoc = await this.model.findOne(query);
        if (!currentDoc) return next();

        const newVehicleId = update.vehicle || update.$set?.vehicle || currentDoc.vehicle;
        const newOperator = update.operator || update.$set?.operator || currentDoc.operator;
        const newWellId = update.well || update.$set?.well || currentDoc.well;

        if (newVehicleId) {
            const vehicle = await Vehicle.findById(newVehicleId);
            if (vehicle) {
                const newCapacity = vehicle.capacity;
                update.RequiredCapacity = newCapacity;
            }
        }

        if (newOperator === Operators.altadhamun) {
            const well = await Well.findById(newWellId);
            if (well) {
                const reqCap =
                    update.$set?.RequiredCapacity ||
                    update.RequiredCapacity ||
                    currentDoc.RequiredCapacity;

                const newReplyPrice = reqCap * well.pricePerUnit;

                update.replyPrice = newReplyPrice;
            }
        }

        this.setUpdate(update);
        next();
    } catch (err) {
        next(err);
    }
});

DailyOrderSchema.virtual("totalReplayPrice").get(function () {
    return this.RequiredCapacity * this.replyPrice;
})

export const DailyOrder = model("DailyOrder", DailyOrderSchema)
