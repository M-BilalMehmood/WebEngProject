import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';

const AppointmentList = ({ appointments }) => {
    if (!Array.isArray(appointments)) {
        return <div>No appointments found.</div>;
    }

    return (
        <div className="space-y-4">
            {appointments.map((appointment) => {
                const appointmentDate = new Date(appointment.dateTime);
                const formattedDate = appointmentDate.toLocaleDateString();
                const formattedTime = appointmentDate.toLocaleTimeString();

                return (
                    <motion.div
                        key={appointment._id} // Ensure the key is unique
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-6 rounded-lg shadow-md"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Appointment with Dr. {appointment.doctor.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                appointment.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                    appointment.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                            }`}>
                                {appointment.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center">
                                <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                                <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-gray-500" />
                                <span>{formattedTime}</span>
                            </div>
                            <div className="flex items-center">
                                <User className="w-5 h-5 mr-2 text-gray-500" />
                                <span>{appointment.doctor.specialty}</span>
                            </div>
                        </div>
                        {appointment.status === 'Confirmed' && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                            >
                                Join Video Call
                            </motion.button>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default AppointmentList;