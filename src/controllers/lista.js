import Lista from '../models/lista.js';
import User from '../models/user.js';
import Notificacion from '../models/notificacion.js';
import helpersGeneral from '../helpers/generales.js';

const httpLista = {
    //Obtener todas los listas
    getListas: async (req, res) => {
        try {
            const listas = await Lista.find().populate('idUser', 'nombre correo image');
            if (!listas) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(listas);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener listas por su id
    getListaById: async (req, res) => {
        try {
            const { id } = req.params;
            const ListaId = await Lista.findById(id).populate('idUser', 'nombre correo image');
            if (!ListaId) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(ListaId);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener lista por el id de usuario
    getListaByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;   
            const lista = await Lista.find({ idUser: idUser }).populate('idUser', 'nombre correo image');
            if (!lista || lista.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener lista negra
    getListaBlack: async (req, res) => {
        try {
            const lista = await Lista.find({ tipo: { $regex: 'negra', $options: 'i' } }).populate('idUser', 'nombre correo image');
            if (!lista || lista.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener lista blanca
    getListaWhite: async (req, res) => {
        try {
            const lista = await Lista.find({ tipo: { $regex: 'blanca', $options: 'i' } }).populate('idUser', 'nombre correo image');
            if (!lista || lista.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener lista por categoria
    getListaByCategoria: async (req, res) => {
        try {
            const { categoria } = req.params;
            const lista = await Lista.find({ categoria: { $regex: categoria, $options: 'i' }}).populate('idUser', 'nombre correo image');
            if (!lista || lista.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener lista por rango de fechas
    getListaByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const listas = await Lista.find({
                createAT: { 
                    $gte: start, 
                    $lte: end 
                }
            }).populate('idUser', 'nombre correo image');
            if (listas.length === 0) {
                return res.status(404).json({ 
                    error: 'No se encontraron listas en el rango de fechas.'
                });
            }
            res.json(listas);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Agregar un nuevo lista
    postAddLista: async (req, res) => {
        try {
            const { idUser, descripcion, razon, categoria, tipo, imagen } = req.body;
            const listaExistente = await Lista.findOne({ idUser, tipo });
            if (listaExistente) {
                return res.status(400).json({ error: 'El usuario ya está en esta lista' });
            }
            const nuevaLista = new Lista({
                idUser,
                descripcion,
                razon,
                categoria,
                tipo,
                imagen,
                estado: 'pendiente'
            });
            const listaGuardado = await nuevaLista.save();
            res.status(201).json(listaGuardado);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Editar una lista
    putUpdateLista: async (req, res) => {
        try {
            const { id } = req.params;
            const { idUser, descripcion, razon, categoria, tipo, imagen } = req.body;
            const user = await User.findById(idUser);
            if (!user) {
                return res.status(404).json({ error: 'Usuario no encontrado' });
            }
            const userId = user._id.toString();
            const userRole = user.rol;
            const lista = await Lista.findById(id);
            if (!lista) {
                return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
            }
            if (lista.idUser.toString() !== userId && userRole !== 'admin') {
                return res.status(403).json({ error: 'No tienes permiso para editar esta lista' });
            }
            const listaExistente = await Lista.findOne({ idUser, tipo, _id: { $ne: id } });
            if (listaExistente) {
                return res.status(400).json({ error: 'El usuario ya está en esta lista' });
            }
            const listaActualizado = await Lista.findByIdAndUpdate(
                id,
                { idUser, descripcion, razon, categoria, tipo, imagen },
                { new: true }
            );
            res.json(listaActualizado);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Activar lista
    putActivarLista: async (req, res) => {
        try {
            const { id } = req.params;
            const lista = await Lista.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar lista
    putInactivarLista: async (req, res) => {
        try {
            const { id } = req.params;
            const lista = await Lista.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar lista
    deleteLista: async (req, res) => {
        try {
            const { id } = req.params;
            await Lista.findByIdAndDelete(id);
            res.json({ message: 'lista eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    perfilListaPorUsuario: async (req, res) => {
        try {
            const { idUser, descripcion, razon, categoria, tipo, imagen } = req.body;
    
            const nuevaLista = new Lista({
                idUser,
                descripcion,
                razon,
                categoria,
                tipo,
                imagen,
                estado: 'pendiente'
            });
            const listaGuardado = await nuevaLista.save();
    
            // Crear notificaciones para los administradores
            const user = await User.findById(idUser);
            const userAdmin = await User.find({ rol: 'admin' });
            const notificaciones = [];
            for (const admin of userAdmin) {
                const nuevaNotificacion = new Notificacion({
                    idUser: admin._id,
                    tipo: 'Perfil',
                    mensaje: `Se creo el perfil del usuario ${user.nombre} para la lista ${tipo}.`
                });
                await nuevaNotificacion.save();
                notificaciones.push(nuevaNotificacion);
            }
    
            res.status(201).json({ listaGuardado, notificaciones });
        } catch (error) {
            console.error('Error al crear el perfil de la lista:', error);
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Aceptar perfil de lista
    aceptarPerfilLista: async (req, res) => {
        try {
            const { id } = req.params;
            const lista = await Lista.findByIdAndUpdate(id, { estado: 'aceptado' }, { new: true });
            
            // Crear notificación para el usuario
            const user = await User.findById(lista.idUser);
            const nuevaNotificacion = new Notificacion({
                idUser: user._id,
                tipo: 'Perfil',
                mensaje: `Tu perfil para la lista ${lista.tipo} ha sido aceptado.`
            });
            await nuevaNotificacion.save();

            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Rechazar perfil de lista
    rechazarPerfilLista: async (req, res) => {
        try {
            const { id } = req.params;
            const lista = await Lista.findByIdAndUpdate(id, { estado: 'rechazado' }, { new: true });
            
            // Crear notificación para el usuario
            const user = await User.findById(lista.idUser);
            const nuevaNotificacion = new Notificacion({
                idUser: user._id,
                tipo: 'Perfil',
                mensaje: `Tu perfil para la lista ${lista.tipo} ha sido rechazado.`
            });
            await nuevaNotificacion.save();

            res.json(lista);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener perfiles de lista por estado
    getPerfilesByEstado: async (req, res) => {
        try {
            const { estado } = req.params;
            const listas = await Lista.find({ estado }).populate('idUser', 'nombre correo image');
            if (!listas || listas.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(listas);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },
};

export default httpLista;