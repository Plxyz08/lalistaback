import mongoose from 'mongoose';

const donacionSchema = new mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    monto: { type: Number, required: true },
    mensaje: { type: String, required: true },
    comprobante: { type: String, required: true },
    createAT: { type: Date, default: Date.now },
    estado: { type: String, default: 'Pendiente' }
});

export default mongoose.model('Donacion', donacionSchema);