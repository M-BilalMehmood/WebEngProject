import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Appointment',
        required: true
    },
    medications: [{
        name: String,
        dosage: String,
        frequency: String,
        duration: String
    }],
    instructions: String,
    imageUrl: String,
    issuedDate: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Prescription = mongoose.model('Prescription', prescriptionSchema);

export default Prescription;

