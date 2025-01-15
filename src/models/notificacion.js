import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema({
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    idPublicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion'},
    idComentario: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario'},
    idReaccion: { type: mongoose.Schema.Types.ObjectId, ref: 'Reaccion'},
    mensaje: { type: String },
    tipo: { type: String, required: true },
    leida: { type: Boolean, default: 0 },
    createAT: { type: Date, default: Date.now },
    estado: { type: Boolean, default: 1 }
});

export default mongoose.model('Notificacion', notificacionSchema);