import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    password: { type: String, required: true },
    rol: { type: String, required: true },
    createAT: { type: Date, default: Date.now },
    estado: { type: Boolean, default: 1 }
});

export default mongoose.model('User', userSchema);