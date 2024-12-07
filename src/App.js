import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import PatientDashboard from './modules/patient/components/PatientDashboard';
import StaffDashboard from './modules/staff/components/StaffDashboard';
// import DoctorDashboard from './modules/doctor/components/DoctorDashboard';
// import AdminDashboard from './modules/admin/components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import PatientRoutes from './modules/patient/routes';
import StaffRoutes from './modules/staff/routes';

function App() {
    return (
        <Router>
            <Layout>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                        path="/patient/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['patient']}>
                                <PatientDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path='/staff/dashboard'
                        element={
                            <ProtectedRoute allowedRoles={['staff']}>
                                <StaffDashboard />
                            </ProtectedRoute>
                        }
                    />
                    {/* <Route
                        path="/doctor/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['doctor']}>
                                <DoctorDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    /> */}
                    {PatientRoutes}
                    {StaffRoutes}
                </Routes>
            </Layout>
        </Router>
    );
}

export default App;