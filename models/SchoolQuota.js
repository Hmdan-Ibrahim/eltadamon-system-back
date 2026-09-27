import { model, Schema } from "mongoose";

const SchoolQuotaSchema = new Schema(
    {
        school: {
            type: Schema.Types.ObjectId,
            ref: "School",
            required: true,
            index: true,
        },
        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },
        monthlyQuantity: {
            type: Number,
            required: true,
            min: 0,
        },
        notes: String,
    },
    { timestamps: true }
);

SchoolQuotaSchema.index({
    school: 1,
    startDate: 1,
    endDate: 1
});

export const SchoolQuota = model('SchoolQuota', SchoolQuotaSchema);