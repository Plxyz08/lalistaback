import Reaccion from '../models/reaccion.js';
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

const httpReaccion = {
    //Obtener todos las Reacciones
    getReacciones: async (req, res) => {
        try {
            const reacciones = await Reaccion.find().populate('idUser', 'nombre');;
            if (!reacciones) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };

            const reaccionConFechaFormateada = reacciones.map((reaccion) => {
                return {
                    ...reaccion.toObject(),
                    fechaFormateada: formatearFecha(reaccion.createAT)
                };
            });
    
            res.json(reaccionConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    //Obtener reacciones por su id
    getReaccionById: async (req, res) => {
        try {
            const { id } = req.params;
            const reaccion = await Reaccion.findById(id).populate('idUser', 'nombre');;
            if (!reaccion) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const reaccionConFechaFormateada = {
                ...reaccion.toObject(),
                fechaFormateada: formatearFecha(reaccion.createAT)
            };
    
            res.json(reaccionConFechaFormateada);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    // Obtener Reacciones por el id de la Publicacion
    getReaccionByIdPublicacion: async (req, res) => {
        try {
            const { idPublicacion } = req.params;
            const reaccion = await Reaccion.find({ idPublicacion: idPublicacion }).populate('idUser', 'nombre');;
            if (!reaccion || reaccion.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const reaccionConFechaFormateada = reaccion.map((reaccion) => {
                return {
                    ...reaccion.toObject(),
                    fechaFormateada: formatearFecha(reaccion.createAT)
                };
            });
    
            res.json(reaccionConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    // Obtener Reacciones por el id del Usuario
    getReaccionesByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;
            const reacciones = await Reaccion.find({ idUser: idUser }).populate('idUser', 'nombre');;
            if (!reacciones || reacciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const reaccionConFechaFormateada = reacciones.map((reaccion) => {
                return {
                    ...reaccion.toObject(),
                    fechaFormateada: formatearFecha(reaccion.createAT)
                };
            });
    
            res.json(reaccionConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    // Obtener reacciones por rango de fechas
    getReaccionesByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const reacciones = await Reaccion.find({
                createAT: {
                    $gte: start,
                    $lte: end
                }
            }).populate('idUser', 'nombre');;
            if (reacciones.length === 0) {
                return res.status(404).json({
                    error: 'No se encontraron reacciones en el rango de fechas.'
                });
            }
            const reaccionConFechaFormateada = reacciones.map((reaccion) => {
                return {
                    ...reaccion.toObject(),
                    fechaFormateada: formatearFecha(reaccion.createAT)
                };
            });
    
            res.json(reaccionConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    // Agregar una nueva reaccion
    postAddReaccion: async (req, res) => {
        try {
            const { idPublicacion, idComentario, idUser, tipo } = req.body;
            const nuevaReaccion = new Reaccion({
                idPublicacion,
                idComentario,
                idUser,
                tipo
            });
            const nuevaNotificacion = new Notificacion({
                idUser,
                idComentario: nuevaReaccion._id,
                tipo: 'reaccion',
                mensaje: 'Nuevo reaccion en una publicacion'
            });

            const reaccionGuardada = await nuevaReaccion.save();
            res.status(201).json({reaccionGuardada, nuevaNotificacion});
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    // Editar una reaccion
    putUpdateReaccion: async (req, res) => {
        try {
            const { id } = req.params;
            const { idUser, tipo } = req.body;
            const user = await User.findById(idUser);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            const userId = user._id.toString();
            const userRole = user.rol;
            const reaccion = await Reaccion.findById(id);
            if (!reaccion) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }
            if (reaccion.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar esta reacción' });
            }
            const reaccionActualizada = await Reaccion.findByIdAndUpdate(
                id,
                { tipo },
                { new: true }
            );
            res.json(reaccionActualizada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    //Activar Reaccion
    putActivarReaccion: async (req, res) => {
        try {
            const { id } = req.params;
            const reaccion = await Reaccion.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            res.json(reaccion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    //Inactivar Reaccion
    putInactivarReaccion: async (req, res) => {
        try {
            const { id } = req.params;
            const reaccion = await Reaccion.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            res.json(reaccion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    },

    // Eliminar Reaccion
    deleteReaccion: async (req, res) => {
        try {
            const { id } = req.params;
            await Reaccion.findByIdAndDelete(id);
            res.json({ message: 'Reaccion eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor});
        }
    }
};

export default httpReaccion;