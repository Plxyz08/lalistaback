import mongoose from 'mongoose';

const listaSchema = new mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    descripcion: { type: String, required: true },
    razon: { type: String, required: true },
    imagen: { type: String },
    categoria: { type: String, required: true },
    tipo: { type: String, required: true },
    createAT: { type: Date, default: Date.now },
    estado: { type: Boolean, default: 1 }
});

export default mongoose.model('Lista', listaSchema);