import mongoose from 'mongoose';

const reaccionSchema = new mongoose.Schema({
    idPublicacion: { type: mongoose.Schema.Types.ObjectId, ref: 'Publicacion'},
    idComentario: { type: mongoose.Schema.Types.ObjectId, ref: 'Comentario'},
    idUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipo: { type: String, required: true },
    createAT: { type: Date, default: Date.now },
    estado: { type: Number, default: 1 }
});

export default mongoose.model('Reaccion', reaccionSchema);