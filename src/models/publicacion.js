import mongoose from 'mongoose';

const publicacionSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    contenido: { type: String, required: true },
    imagen: { type: String },
    tipo: { type: String },
    ciudad: { type: String, required: true },
    categoria: { type: String, required: true },
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createAT: { type: Date, default: Date.now },
    estado: { type: String, default: 'Pendiente' }
});

export default mongoose.model('Publicacion', publicacionSchema);