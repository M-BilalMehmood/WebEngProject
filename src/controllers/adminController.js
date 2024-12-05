import User from '../models/User.js';
import Feedback from '../models/Feedback.js';
import SpamReport from '../models/SpamReport.js';
import { paginateResults } from '../utils/helpers.js';

class AdminController {
    async getDashboard(req, res) {
        try {
            const userCount = await User.countDocuments();
            const doctorCount = await User.countDocuments({ role: 'doctor' });
            const patientCount = await User.countDocuments({ role: 'patient' });
            const feedbackCount = await Feedback.countDocuments();
            const spamReportCount = await SpamReport.countDocuments({ status: 'Pending' });

            res.status(200).json({
                userCount,
                doctorCount,
                patientCount,
                feedbackCount,
                spamReportCount
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getFeedback(req, res) {
        try {
            const { page, limit } = req.query;
            const { skip, limit: limitParsed } = paginateResults(page, limit);
            const feedback = await Feedback.find()
                .populate('patient', 'name')
                .populate('doctor', 'name')
                .skip(skip)
                .limit(limitParsed)
                .sort({ createdAt: -1 });
            const total = await Feedback.countDocuments();
            res.status(200).json({
                feedback,
                currentPage: page,
                totalPages: Math.ceil(total / limitParsed),
                total
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async moderateFeedback(req, res) {
        try {
            const { id } = req.params;
            const { isModerated } = req.body;
            const feedback = await Feedback.findByIdAndUpdate(id, { isModerated }, { new: true });
            if (!feedback) {
                return res.status(404).json({ message: 'Feedback not found' });
            }
            res.status(200).json(feedback);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getSpamReports(req, res) {
        try {
            const { page, limit } = req.query;
            const { skip, limit: limitParsed } = paginateResults(page, limit);
            const spamReports = await SpamReport.find()
                .populate('reportedBy', 'name')
                .populate('reportedUser', 'name')
                .skip(skip)
                .limit(limitParsed)
                .sort({ createdAt: -1 });
            const total = await SpamReport.countDocuments();
            res.status(200).json({
                spamReports,
                currentPage: page,
                totalPages: Math.ceil(total / limitParsed),
                total
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async resolveSpamReport(req, res) {
        try {
            const { id } = req.params;
            const { status, resolution } = req.body;
            const spamReport = await SpamReport.findByIdAndUpdate(id, { status, resolution }, { new: true });
            if (!spamReport) {
                return res.status(404).json({ message: 'Spam report not found' });
            }
            res.status(200).json(spamReport);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

export default new AdminController();

