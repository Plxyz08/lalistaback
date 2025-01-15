import Notificacion from '../models/notificacion.js';
import helpersGeneral from '../helpers/generales.js';

const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
};

const httpNotificacion = {
    //Obtener todos las Notificaciones
    getNotificaciones: async (req, res) => {
        try {
            const notificaciones = await Notificacion.find();
            if (!notificaciones) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const notificacionesConFechaFormateada = notificaciones.map((notificacion) => {
                return {
                    ...notificacion.toObject(),
                    fechaFormateada: formatearFecha(notificacion.createAT)
                };
            });
    
            res.json(notificacionesConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener notificaciones por su id
    getNotificacionById: async (req, res) => {
        try {
            const { id } = req.params;
            const notificacion = await Notificacion.findById(id);
            if (!notificacion) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const notificacionConFechaFormateada = {
                ...notificacion.toObject(),
                fechaFormateada: formatearFecha(notificacion.createAT)
            };
    
            res.json(notificacionConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener Notificaciones por el id de la Publicacion
    getNotificacionByIdPublicacion: async (req, res) => {
        try {
            const { idPublicacion } = req.params;
            const notificacion = await Notificacion.find({ idPublicacion: idPublicacion });
            if (!notificacion || notificacion.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const notificacionesConFechaFormateada = notificacion.map((notificacion) => {
                return {
                    ...notificacion.toObject(),
                    fechaFormateada: formatearFecha(notificacion.createAT)
                };
            });
    
            res.json(notificacionesConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener Notificaciones por el id del Usuario
    getNotificacionesByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;
            const notificaciones = await Notificacion.find({ idUser: idUser });
            if (!notificaciones || notificaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const notificacionesConFechaFormateada = notificaciones.map((notificacion) => {
                return {
                    ...notificacion.toObject(),
                    fechaFormateada: formatearFecha(notificacion.createAT)
                };
            });
    
            res.json(notificacionesConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener Notificaciones por rango de fechas
    getNotificacionesByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const notificaciones = await Notificacion.find({
                createAT: {
                    $gte: start,
                    $lte: end
                }
            });
            if (notificaciones.length === 0) {
                return res.status(404).json({
                    error: 'No se encontraron notificaciones en el rango de fechas.'
                });
            }
            const notificacionesConFechaFormateada = notificaciones.map((notificacion) => {
                return {
                    ...notificacion.toObject(),
                    fechaFormateada: formatearFecha(notificacion.createAT)
                };
            });
    
            res.json(notificacionesConFechaFormateada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener Notificaciones por tipo 
    getNotificacionesByTipo: async (req, res) => {
        try {
            const { tipo } = req.params;
            const notificaciones = await Notificacion.find({ tipo: tipo });
            if (!notificaciones || notificaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(notificaciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Agregar una nueva notificacion
    postAddNotificacion: async (req, res) => {
        try {
            const { idUser, tipo, mensaje, idComentario, idPublicacion, idReaccion } = req.body;
            const nuevaNotificacion = new Notificacion({
                idUser,
                tipo,
                mensaje,
                idComentario,
                idPublicacion,
                idReaccion
            });
            const notificacionGuardada = await nuevaNotificacion.save();
            res.status(201).json(notificacionGuardada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Leer Notificacion
    leerNotificacion: async (req, res) => {
        try {
            const { id } = req.params;
            const notificacion = await Notificacion.findByIdAndUpdate(id, { leida: 1 }, { new: true });
            res.json(notificacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //No leer Notificacion
    noLeerNotificacion: async (req, res) => {
        try {
            const { id } = req.params;
            const notificacion = await Notificacion.findByIdAndUpdate(id, { leida: 0 }, { new: true });
            res.json(notificacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Activar Notificacion
    putActivarNotificacion: async (req, res) => {
        try {
            const { id } = req.params;
            const notificacion = await Notificacion.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            res.json(notificacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar Notificacion
    putInactivarNotificacion: async (req, res) => {
        try {
            const { id } = req.params;
            const notificacion = await Notificacion.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            res.json(notificacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar Notificacion
    deleteNotificacion: async (req, res) => {
        try {
            const { id } = req.params;
            await Notificacion.findByIdAndDelete(id);
            res.json({ message: 'Notificacion eliminada exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default httpNotificacion;