import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Prescription from '../models/Prescription.js';
import Feedback from '../models/Feedback.js';
import emailService from '../services/emailService.js';
import imageUploadService from '../services/imageUploadService.js';
import { paginateResults, sanitizeUser } from '../utils/helpers.js';

class DoctorController {
    async getProfile(req, res) {
        try {
            const doctor = await Doctor.findById(req.user.id).select('-password');
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            res.status(200).json(sanitizeUser(doctor));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateProfile(req, res) {
        try {
            const { name, specialty, qualifications, experience, consultationFee } = req.body;
            const updatedDoctor = await Doctor.findByIdAndUpdate(
                req.user.id,
                { name, specialty, qualifications, experience, consultationFee },
                { new: true }
            ).select('-password');
            if (!updatedDoctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }
            res.status(200).json(sanitizeUser(updatedDoctor));
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async uploadProfilePicture(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            const imageUrl = await imageUploadService.uploadProfilePicture(req.file, req.user.id);
            const updatedDoctor = await Doctor.findByIdAndUpdate(
                req.user.id,
                { profilePicture: imageUrl },
                { new: true }
            ).select('-password');
            res.status(200).json({ profilePicture: updatedDoctor.profilePicture });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getAppointments(req, res) {
        try {
            const { page, limit, status } = req.query;
            const { skip, limit: limitParsed } = paginateResults(page, limit);
            const query = { doctor: req.user.id };
            if (status) query.status = status;

            const appointments = await Appointment.find(query)
                .populate('patient', 'name email')
                .skip(skip)
                .limit(limitParsed)
                .sort({ dateTime: 1 });
            const total = await Appointment.countDocuments(query);
            res.status(200).json({
                appointments,
                currentPage: page,
                totalPages: Math.ceil(total / limitParsed),
                total
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateAppointment(req, res) {
        try {
            const { status } = req.body;
            const appointment = await Appointment.findOneAndUpdate(
                { _id: req.params.id, doctor: req.user.id },
                { status },
                { new: true }
            ).populate('patient', 'name email');
            if (!appointment) {
                return res.status(404).json({ message: 'Appointment not found' });
            }
            // Send email notification to patient
            await emailService.sendEmail(
                appointment.patient.email,
                'Appointment Update',
                `<h1>Your appointment status has been updated to ${status}</h1>`
            );
            res.status(200).json(appointment);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async createPrescription(req, res) {
        try {
            const newPrescription = new Prescription({
                ...req.body,
                doctor: req.user.id,
            });
            const savedPrescription = await newPrescription.save();
            res.status(201).json(savedPrescription);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async updatePrescription(req, res) {
        try {
            const prescription = await Prescription.findOneAndUpdate(
                { _id: req.params.id, doctor: req.user.id },
                req.body,
                { new: true }
            );
            if (!prescription) {
                return res.status(404).json({ message: 'Prescription not found' });
            }
            res.status(200).json(prescription);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async deletePrescription(req, res) {
        try {
            const prescription = await Prescription.findOneAndDelete({ _id: req.params.id, doctor: req.user.id });
            if (!prescription) {
                return res.status(404).json({ message: 'Prescription not found' });
            }
            res.status(200).json({ message: 'Prescription deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getFeedback(req, res) {
        try {
            const { page, limit } = req.query;
            const { skip, limit: limitParsed } = paginateResults(page, limit);
            const feedback = await Feedback.find({ doctor: req.user.id })
                .populate('patient', 'name')
                .skip(skip)
                .limit(limitParsed)
                .sort({ createdAt: -1 });
            const total = await Feedback.countDocuments({ doctor: req.user.id });
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
}

export default new DoctorController();