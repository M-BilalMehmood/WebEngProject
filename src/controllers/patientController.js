import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Feedback from '../models/Feedback.js';
import Prescription from '../models/Prescription.js';
import emailService from '../services/emailService.js';
import paymentService from '../services/paymentService.js';
import { paginateResults, sanitizeUser } from '../utils/helpers.js';

class PatientController {
    async getProfile(req, res) {
        try {
            const doctor = await Doctor.findById(req.user.id).select('-password');
            if (!doctor) {
                return res.status(404).json({ message: 'User profile not found' });
            }
            res.status(200).json(sanitizeUser(patient));
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    
    async updateProfile(req, res) {
        try {
            const { name, dateOfBirth, gender } = req.body;
            const updatedPatient = await Patient.findByIdAndUpdate(
                req.user.id,
                { name, dateOfBirth, gender },
                { new: true }
            );
            if (!updatedPatient) {
                return res.status(404).json({ message: 'Patient not found' });
            }
            res.status(200).json(sanitizeUser(updatedPatient));
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAllDoctors(req, res) {
        try {
            const doctors = await Doctor.find().select('-password');
            res.status(200).json(doctors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Search doctors based on specialty and name
     * @param {*} req 
     * @param {*} res 
     */
    async searchDoctors(req, res) {
        try {
            const { specialty, name, page = 1, limit = 10 } = req.query;
            const { skip, limit: limitParsed } = paginateResults(page, limit);
            const query = {};

            if (specialty) {
                query.specialty = { $regex: specialty, $options: 'i' };
            }

            if (name) {
                query.name = { $regex: name, $options: 'i' };
            }

            const doctors = await Doctor.find(query)
                .skip(skip)
                .limit(limitParsed)
                .select('-password'); // Exclude password field

            const total = await Doctor.countDocuments(query);

            res.status(200).json({
                doctors,
                currentPage: parseInt(page, 10),
                totalPages: Math.ceil(total / limitParsed),
                total
            });
        } catch (error) {
            console.error('Error searching doctors:', error);
            res.status(500).json({ message: error.message });
        }
    }

    async bookAppointment(req, res) {
        try {
            const { doctorId, dateTime } = req.body;
            const doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Doctor not found' });
            }

            const newAppointment = new Appointment({
                doctor: doctorId,
                patient: req.user.id,
                dateTime
            });
            const savedAppointment = await newAppointment.save();

            // Create payment intent
            const paymentIntent = await paymentService.createPaymentIntent(doctor.consultationFee * 100); // amount in cents

            // Send email notification
            await emailService.sendAppointmentConfirmation(req.user.email, {
                doctorName: doctor.name,
                date: savedAppointment.dateTime
            });

            res.status(201).json({ appointment: savedAppointment, paymentIntent });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getAppointments(req, res) {
        try {
            const { page, limit } = req.query;
            const { skip, limit: limitParsed } = paginateResults(page, limit);
            const appointments = await Appointment.find({ patient: req.user.id })
                .populate('doctor', 'name specialty')
                .skip(skip)
                .limit(limitParsed)
                .sort({ dateTime: 1 });
            const total = await Appointment.countDocuments({ patient: req.user.id });
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

    async submitFeedback(req, res) {
        try {
            const { doctorId, appointmentId, rating, comment } = req.body;
            const newFeedback = new Feedback({
                doctor: doctorId,
                patient: req.user.id,
                appointment: appointmentId,
                rating,
                comment
            });
            const savedFeedback = await newFeedback.save();
            res.status(201).json(savedFeedback);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getFeedback(req, res) {
        try {
            const { page, limit } = req.query;
            const { skip, limit: limitParsed } = paginateResults(page, limit);
            const feedback = await Feedback.find({ patient: req.user.id })
                .populate('doctor', 'name')
                .skip(skip)
                .limit(limitParsed)
                .sort({ createdAt: -1 });
            const total = await Feedback.countDocuments({ patient: req.user.id });
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

    async getPrescriptions(req, res) {
        try {
            const { page, limit } = req.query;
            const { skip, limit: limitParsed } = paginateResults(page, limit);
            const prescriptions = await Prescription.find({ patient: req.user.id })
                .populate('doctor', 'name')
                .skip(skip)
                .limit(limitParsed)
                .sort({ issuedDate: -1 });
            const total = await Prescription.countDocuments({ patient: req.user.id });
            res.status(200).json({
                prescriptions,
                currentPage: page,
                totalPages: Math.ceil(total / limitParsed),
                total
            });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getPrescription(req, res) {
        try {
            const { id } = req.params;
            const prescription = await Prescription.findOne({ _id: id, patient: req.user.id })
                .populate('doctor', 'name');
            if (!prescription) {
                return res.status(404).json({ message: 'Prescription not found' });
            }
            res.status(200).json(prescription);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    /**
     * Get patient statistics
     * @param {*} req 
     * @param {*} res 
     */
    async getStats(req, res) {
        try {
            const patientId = req.user.id;

            // Total Appointments
            const totalAppointments = await Appointment.countDocuments({ patient: patientId });

            // Upcoming Visits (appointments in the future)
            const upcomingVisits = await Appointment.countDocuments({
                patient: patientId,
                dateTime: { $gte: new Date() }
            });

            // Active Prescriptions
            const activePrescriptions = await Prescription.countDocuments({
                patient: patientId,
                isActive: true
            });

            // Calculate trends (optional)
            // For simplicity, we'll set trends to 0. You can implement logic to calculate actual trends based on historical data.
            const trends = {
                appointments: 0,
                upcomingVisits: 0,
                prescriptions: 0
            };

            res.status(200).json({
                appointments: { value: totalAppointments, trend: trends.appointments },
                upcomingVisits: { value: upcomingVisits, trend: trends.upcomingVisits },
                prescriptions: { value: activePrescriptions, trend: trends.prescriptions }
            });
        } catch (error) {
            console.error('Error fetching patient stats:', error);
            res.status(500).json({ message: error.message });
        }
    }
}

export default new PatientController();

