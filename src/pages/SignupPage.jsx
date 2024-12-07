import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Form from '../components/Form';
import { signup } from '../services/api';

const SignupPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [role, setRole] = useState('patient');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        data.role = role; // Add role to the form data
        try {
            const response = await signup(data);
            console.log('Signup successful', response);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'An error occurred during signup');
        } finally {
            setIsLoading(false);
        }
    };

    const commonFields = [
        { name: 'name', type: 'text', label: 'Name', required: true },
        { name: 'email', type: 'email', label: 'Email address', required: true },
        { name: 'password', type: 'password', label: 'Password', required: true },
    ];

    const roleSpecificFields = {
        patient: [
            { name: 'dateOfBirth', type: 'date', label: 'Date of Birth', required: true },
            { name: 'gender', type: 'select', label: 'Gender', required: true, options: ['Male', 'Female', 'Other'] },
        ],
        doctor: [
            { name: 'specialty', type: 'text', label: 'Specialty', required: true },
            { name: 'qualifications', type: 'text', label: 'Qualifications', required: true },
            { name: 'experience', type: 'number', label: 'Experience (years)', required: true },
            { name: 'PMDCRegistrationNumber', type: 'text', label: 'PMDC Reg no.', required: true },
            { name: 'consultationFee', type: 'number', label: 'Consultation Fee', required: true },
        ],
        staff: [
            { name: 'department', type: 'text', label: 'Department', required: true },
            { name: 'position', type: 'text', label: 'Position', required: true },
            { name: 'employeeId', type: 'text', label: 'Employee ID', required: true },
        ],
    };

    const fields = [
        ...commonFields,
        ...roleSpecificFields[role],
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg p-1 bg-gray-100">
                {['patient', 'doctor', 'staff'].map((r) => (
                  <motion.button
                    key={r}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setRole(r)}
                    className={`px-6 py-2 rounded-lg text-sm font-medium ${
                      role === r
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </motion.button>
                ))}
              </div>
            </div>
            <Form
          title="Create your account"
          fields={fields}
          onSubmit={handleSubmit}
          submitText="Sign up"
          isLoading={isLoading}
          error={error}
        />
      </div>
    </div>
    );
};

export default SignupPage;