import mongoose from 'mongoose';

const listaSchema = new mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    descripcion: { type: String, required: true },
    razon: { type: String, required: true },
    categoria: { type: String, required: true },
    tipo: { type: String, required: true },
    createAT: { type: Date, default: Date.now },
    estado: { type: String, enum: ['pendiente', 'aceptado', 'rechazado'], default: 'pendiente' },
    imagen: { type: String },
    idCreate: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

export default mongoose.model('Lista', listaSchema);