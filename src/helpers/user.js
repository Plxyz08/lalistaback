import user from "../models/user.js";
import User from "../models/user.js";
import helpersGeneral from "./generales.js";

const helpersUsuario = {
    existeId: async (id, req) => {
        const existe = await User.findById(id);

        if (!existe) {
            throw new Error('El usuario no esta registrado');
        }
        if (!existe.estado) {
            throw new Error(`El usuario ${existe.nombre} esta inactivo`);
        }

        req.req.UserUpdate = existe;
    },

    existeNombre: async (nombre, req) => {
        try {
            if (!nombre) {
                // Si el nombre no está presente, no realizar validaciones
                return true;
            }
    
            const { method, usuario, body } = req.req;
            const existingUser = await User.findOne({ nombre });
    
            if (method === "GET" && !existingUser) {
                throw new Error('El nombre no se encuentra registrado');
            }
    
            if (existingUser) {
                switch (method) {
                    case "PUT":
                        const existingUserId = existingUser._id.toString();
                        const currentUserId = usuario._id.toString();
    
                        if (existingUserId !== currentUserId) {
                            throw new Error('Ya existe un usuario con ese nombre');
                        }
                        break;
    
                    case "POST":
                        throw new Error('Ya existe un usuario con ese nombre');
                        break;
                }
            }
    
            req.req.UserUpdate = existingUser;
    
            return true;
        } catch (error) {
            throw error;
        }
    },
    
    desactivarAdmin: async (id, req) => {
        const rol = req.req.UserUpdate.rol;

        if (rol == "admin") {
            const usuarios = await User.find({ rol: "admin" });
            if (usuarios.length <= 1)
                throw new Error('No se pueden desactivar todos los admin');
        }
    },

    desactivarLogeado: async (id, req) => {
        const idLogeado = req.req.UserUpdate._id;

        if (idLogeado == id) {
            throw new Error('No puedes desactivarte a ti mismo');
        }
    },

    existeCorreo: async (correo, req) => {
        const existe = await User.findOne({
            correo: await helpersGeneral.quitarTildes(correo.toLowerCase()),
        });

        if (!existe && req.req.method === "GET") {
            throw new Error('El correo no se encuentra registrado');
        }

        if (existe) {
            if (req.req.method === "PUT" && req.req.body._id != existe._id) {
                throw new Error('Ya existe ese correo en la base de datos');
            } else if (req.req.method === "POST") {
                throw new Error('Ya existe ese correo en la base de datos');
            }
        }

        req.req.UserUpdate = existe;
    },

    existeCorreoNewPass: async (correo, req) => {
        const existe = await User.findOne({ correo });

        if (!existe) {
            throw new Error('El correo no se encuentra registrado');
        }

        req.req.UserUpdate = existe;
    },

    validarClave: async (clave, req) => {
        // Expresión regular que valida:
        // (?=.*[A-Z]) - Al menos una mayúscula
        // (?=.*[a-z]) - Al menos una minúscula
        // (?=.*\d) - Al menos un número
        // (?=.*[!@#$%^&(),.?":{}|<>]) - Al menos un caracter especial
        // .{8,} - Mínimo 8 caracteres

        
        // const vali = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        // if (!vali.test(clave)) {
        //     throw new Error("La contraseña debe tener al menos 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial y mínimo 8 caracteres");
        // }

        // Nueva validación: al menos 6 caracteres y 1 número
        const vali = /^(?=.*\d).{6,}$/;
        if (!vali.test(clave)) {
            throw new Error("La contraseña debe tener al menos 6 caracteres y 1 número");
        }
        return true;
    }

};
export default helpersUsuario;