import { body } from 'express-validator';

export const registerValidationRules = () => {
    return [
        body('name').notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Must be a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
        body('role').isIn(['patient', 'doctor', 'staff']).withMessage('Invalid role'),
        body('department').if(body('role').equals('staff')).notEmpty().withMessage('Department is required for staff'),
        body('position').if(body('role').equals('staff')).notEmpty().withMessage('Position is required for staff'),
        body('employeeId').if(body('role').equals('staff')).notEmpty().withMessage('Employee ID is required for staff')
    ];
};

export const loginValidationRules = () => {
    return [
        body('email').isEmail().withMessage('Must be a valid email'),
        body('password').notEmpty().withMessage('Password is required')
    ];
};

export const appointmentValidationRules = () => {
    return [
        body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
        body('patientId').isMongoId().withMessage('Invalid patient ID'),
        body('dateTime').isISO8601().toDate().withMessage('Invalid date and time'),
        body('status').isIn(['Scheduled', 'Completed', 'Cancelled', 'Rescheduled']).withMessage('Invalid status')
    ];
};

export const prescriptionValidationRules = () => {
    return [
        body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
        body('patientId').isMongoId().withMessage('Invalid patient ID'),
        body('appointmentId').isMongoId().withMessage('Invalid appointment ID'),
        body('medications').isArray().withMessage('Medications must be an array'),
        body('medications.*.name').notEmpty().withMessage('Medication name is required'),
        body('medications.*.dosage').notEmpty().withMessage('Medication dosage is required'),
        body('medications.*.frequency').notEmpty().withMessage('Medication frequency is required'),
        body('instructions').optional().isLength({ max: 1000 }).withMessage('Instructions must not exceed 1000 characters')
    ];
};

export const feedbackValidationRules = () => {
    return [
        body('doctorId').isMongoId().withMessage('Invalid doctor ID'),
        body('appointmentId').isMongoId().withMessage('Invalid appointment ID'),
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').optional().isLength({ max: 500 }).withMessage('Comment must not exceed 500 characters')
    ];
};

export const updatePasswordValidationRules = () => {
    return [
        body('currentPassword').notEmpty().withMessage('Current password is required'),
        body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
    ];
};

export const updateProfileValidationRules = () => {
    return [
        body('name').notEmpty().withMessage('Name is required'),
        body('department').if(body('role').equals('staff')).notEmpty().withMessage('Department is required for staff'),
        body('position').if(body('role').equals('staff')).notEmpty().withMessage('Position is required for staff')
    ];
};

export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    return res.status(400).json({ errors: errors.array() });
};

export const paginateResults = (page = 1, limit = 10) => {
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;
    return { skip, limit: parsedLimit };
};

export const sanitizeUser = (user) => {
    const { password, ...sanitizedUser } = user.toObject();
    return sanitizedUser;
};