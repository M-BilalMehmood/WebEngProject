import mongoose from 'mongoose';

const spamReportSchema = new mongoose.Schema({
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Resolved', 'Dismissed'],
        default: 'Pending'
    },
    resolution: String
}, {
    timestamps: true
});

const SpamReport = mongoose.model('SpamReport', spamReportSchema);

export default SpamReport;

