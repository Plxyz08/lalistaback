import mongoose from 'mongoose';

const comentarioSchema = new mongoose.Schema({
    idPublicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion', required: true },
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contenido: { type: String, required: true },
    estado: { type: Boolean, default: 1 },
    createAT: { type: Date, default: Date.now },
});

export default mongoose.model('Comentario', comentarioSchema);