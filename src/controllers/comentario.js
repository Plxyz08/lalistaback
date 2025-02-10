import Comentario from '../models/comentario.js';
import User from '../models/user.js';
import Notificacion from '../models/notificacion.js';
import helpersGeneral from '../helpers/generales.js';

const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
};

const httpComentario = {
    //Obtener todos los comentarios
    getComentarios: async (req, res) => {
        try {
            const comentarios = await Comentario.find().populate('idUser', 'nombre');
            if (!comentarios || comentarios.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
    
            const comentariosConFechaFormateada = comentarios.map((comentario) => {
                return {
                    ...comentario.toObject(),
                    fechaFormateada: formatearFecha(comentario.createAT)
                };
            });
    
            res.json(comentariosConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener comentarios por su id
    getComentarioById: async (req, res) => {
        try {
            const { id } = req.params;
            const comentario = await Comentario.findById(id).populate('idUser', 'nombre');
            if (!comentario) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
    
            const comentarioConFechaFormateada = {
                ...comentario.toObject(),
                fechaFormateada: formatearFecha(comentario.createAT)
            };
    
            res.json(comentarioConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    // Obtener Comentarios por el id de la Publicacion
    getComentarioByIdPublicacion: async (req, res) => {
        try {
            const { idPublicacion } = req.params;   
            const comentario = await Comentario.find({ idPublicacion: idPublicacion }).populate('idUser', 'nombre');;
            if (!comentario || comentario.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const comentariosConFechaFormateada = comentario.map((comentario) => {
                return {
                    ...comentario.toObject(),
                    fechaFormateada: formatearFecha(comentario.createAT)
                };
            });
    
            res.json(comentariosConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    // Obtener Comentarios por el id del Usuario
    getComentariosByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;
            const comentarios = await Comentario.find({ idUser: idUser }).populate('idUser', 'nombre');;
            if (!comentarios || comentarios.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const comentariosConFechaFormateada = comentarios.map((comentario) => {
                return {
                    ...comentario.toObject(),
                    fechaFormateada: formatearFecha(comentario.createAT)
                };
            });
    
            res.json(comentariosConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener comentarios por rango de fechas
    getComentarioByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const comentarios = await Comentario.find({
                createAT: { 
                    $gte: start, 
                    $lte: end 
                }
            }).populate('idUser', 'nombre');
            if (comentarios.length === 0) {
                return res.status(404).json({ 
                    error: 'No se encontraron comentarios en el rango de fechas.'
                });
            }
            const comentariosConFechaFormateada = comentarios.map((comentario) => {
                return {
                    ...comentario.toObject(),
                    fechaFormateada: formatearFecha(comentario.createAT)
                };
            });
    
            res.json(comentariosConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Agregar un nuevo comentario
    postAddComentario: async (req, res) => {
        try {
            const { idPublicacion, idUser, contenido } = req.body;
            const nuevoComentario = new Comentario({
                idPublicacion,
                idUser,
                contenido
            });
            const nuevaNotificacion = new Notificacion({
                idUser,
                idComentario: nuevoComentario._id,
                tipo: 'comentario',
                mensaje: 'Nuevo comentario en una publicacion'
            });
            const notificacionGuardada = await nuevaNotificacion.save();
            const comentarioGuardado = await nuevoComentario.save();
            res.status(201).json({comentarioGuardado, notificacionGuardada});
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Editar un comentario
    putUpdateComentario: async (req, res) => {
        try {
            const { id } = req.params;
            const { contenido, idUser } = req.body;
            const user = await User.findById(idUser);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            const userId = user._id.toString();
            const userRole = user.rol;
            const comentario = await Comentario.findById(id);
            if (!comentario) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }
            if (comentario.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar este comentario' });
            }
            const comentarioActualizado = await Comentario.findByIdAndUpdate(
                id,
                { contenido },
                { new: true }
            );
            res.json(comentarioActualizado);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Activar Comentario
    putActivarComentario: async (req, res) => {
        try {
            const { id } = req.params;
            const comentario = await Comentario.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            const comentarioConFechaFormateada = {
                ...comentario.toObject(),
                fechaFormateada: formatearFecha(comentario.createAT)
            };
    
            res.json(comentarioConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar Comentario
    putInactivarComentario: async (req, res) => {
        try {
            const { id } = req.params;
            const comentario = await Comentario.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            const comentarioConFechaFormateada = {
                ...comentario.toObject(),
                fechaFormateada: formatearFecha(comentario.createAT)
            };
    
            res.json(comentarioConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar Comentario
    deleteComentario: async (req, res) => {
        try {
            const { id } = req.params;
            await Comentario.findByIdAndDelete(id);
            res.json({ message: 'Comentario eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default httpComentario;