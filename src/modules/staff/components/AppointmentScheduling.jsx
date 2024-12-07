import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import { getPendingAppointments, scheduleAppointment } from '../services/StaffApi';

const AppointmentScheduling = () => {
    const [pendingAppointments, setPendingAppointments] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);

    useEffect(() => {
        fetchPendingAppointments();
    }, []);

    const fetchPendingAppointments = async () => {
        try {
            const data = await getPendingAppointments();
            setPendingAppointments(data);
        } catch (error) {
            console.error('Error fetching pending appointments:', error);
        }
    };

    const handleSchedule = async (appointmentId, slot) => {
        try {
            await scheduleAppointment(appointmentId, slot);
            fetchPendingAppointments(); // Refresh the list
            alert('Appointment scheduled successfully');
        } catch (error) {
            console.error('Error scheduling appointment:', error);
            alert('Failed to schedule appointment');
        }
    };

    // Mock function to get available slots - replace with actual API call
    const getAvailableSlots = async (doctorId, date) => {
        // This should be an API call to get available slots for the doctor on the given date
        setAvailableSlots([
            '09:00 AM',
            '10:00 AM',
            '11:00 AM',
            '02:00 PM',
            '03:00 PM',
            '04:00 PM',
        ]);
    };

    return (
        <div className="space-y-4">
            {pendingAppointments.map((appointment) => (
                <motion.div
                    key={appointment._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white p-6 rounded-lg shadow-md"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Appointment with {appointment.patientName}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                        }`}>
                            {appointment.status}
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                            <span>{appointment.date}</span>
                        </div>
                        <div className="flex items-center">
                            <User className="w-5 h-5 mr-2 text-gray-500" />
                            <span>Dr. {appointment.doctorName}</span>
                        </div>
                    </div>
                    <div className="mt-4">
                        <label htmlFor={`slot-${appointment._id}`} className="block text-sm font-medium text-gray-700 mb-2">
                            Select Available Slot
                        </label>
                        <select
                            id={`slot-${appointment._id}`}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            onChange={(e) => handleSchedule(appointment._id, e.target.value)}
                            defaultValue=""
                        >
                            <option value="" disabled>Choose a time slot</option>
                            {availableSlots.map((slot, index) => (
                                <option key={index} value={slot}>{slot}</option>
                            ))}
                        </select>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => getAvailableSlots(appointment.doctorId, appointment.date)}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    >
                        Get Available Slots
                    </motion.button>
                </motion.div>
            ))}
        </div>
    );
};

export default AppointmentScheduling;

