import { model, Schema } from "mongoose";

const NeighbordhoodSchema = new Schema({
    name: {
        type: String,
        required: [true, "لابد أن تذكر اسم الحي!"],
        minlength: [3, "لابد أن يكون اسم الحي أكثر من 3 أحرف!"]
    },
    supervisor: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: [true, "لابد من كل منطقة أن يكون لها مدير."]
    },
    project: {
        type: Schema.Types.ObjectId,
        ref: 'Project',
        required: [true, "يجب تحديد المشروع التابع لها هذا الحي!"]
    },
}, { timestamps: true });

export const Neighbordhood = model('Neighbordhood', NeighbordhoodSchema);