import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Clipboard } from 'lucide-react';
import { bookAppointment } from '../services/patientApi';

const AppointmentForm = ({ doctor }) => {
    const navigate = useNavigate();
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [issues, setIssues] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const dateTime = new Date(`${date}T${time}`);
        const appointmentData = {
            doctorId: doctor._id,
            dateTime: dateTime.toISOString(),
            issues: issues || 'No issues provided',
        };

        try {
            await bookAppointment(appointmentData);
            navigate('/patient/appointments');
        } catch (err) {
            setError(err.message || 'Failed to book appointment. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-lg shadow-md max-w-lg mx-auto"
        >
            <h2 className="text-2xl font-bold mb-4">Book Appointment with Dr. {doctor.name}</h2>
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                        Date
                    </label>
                    <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                            type="date"
                            id="date"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                        Time
                    </label>
                    <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-400 mr-2" />
                        <input
                            type="time"
                            id="time"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label htmlFor="issues" className="block text-sm font-medium text-gray-700 mb-1">
                        Issues You Are Facing
                    </label>
                    <div className="flex items-start">
                        <Clipboard className="w-5 h-5 text-gray-400 mr-2 mt-1" />
                        <textarea
                            id="issues"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            rows="4"
                            placeholder="Describe your issues..."
                            value={issues}
                            onChange={(e) => setIssues(e.target.value)}
                            required
                        ></textarea>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Booking...' : 'Book Appointment'}
                </motion.button>
            </form>
        </motion.div>
    );
};

export default AppointmentForm;