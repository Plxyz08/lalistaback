import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { generarJWT } from '../middlewares/validar-jwt.js';
import helpersGeneral from '../helpers/generales.js';

let codigoEnviado = {};

function generarCodigo() {
    let numAleatorio = Math.floor(1000 + Math.random() * 1000000);
    let num = numAleatorio.toString().padStart(6, '0');
    let fechaCreacion = new Date();

    codigoEnviado = { codigo: num, fechaCreacion };

    return num;
}

const hhtpUser = {

    //Obtener todos los usuarios
    getUsers: async (req, res) => {
        try {
            const users = await User.find();
            if (!users) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const usersFormat = users.map((element) => {
                delete element._doc.password;
                return element
            });
            res.json(usersFormat);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log(id);
            const user = await User.findById(id);
            if (!user) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            const { password, ...userWithoutPassword } = user._doc;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Obtener un usuario por su correo
    getUserByCorreo: async (req, res) => {
        try {
            const { correo } = req.params;
            const userCorreo = await User.findOne({ correo });
            if (!userCorreo) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const { password, ...userWithoutPassword } = userCorreo._doc;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    // Obtener usuarios por su nombre
    getUserByNombre: async (req, res) => {
        try {
            const { nombre } = req.params;
            const userNombre = await User.find({ nombre: { $regex: nombre, $options: 'i' } });
            if (!userNombre) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            const usersFormat = userNombre.map((element) => {
                delete element._doc.password;
                return element
            });
            res.status(200).json(usersFormat);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Registro de usuario
    postUserRegistro: async (req, res) => {
        try {
            const { nombre, correo, password, rol } = req.body;
            const user = new User({ nombre, correo, password, rol });
            if (user.password) {
                const salt = bcrypt.genSaltSync();
                user.password = bcrypt.hashSync(password, salt);
            }
            await user.save();
            delete user._doc.password;
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Login de usuario
    postLogin: async (req, res) => {
        try {
            const { correo, password } = req.body;
            const user = await User.findOne({ correo });
            if (!user) {
                return res.status(400).json({ error: "Correo/Password incorrectos" });
            };
            const roles = ['admin', 'user'];
            if (!roles.includes(user.rol)) {
                return res.status(400).json({ error: helpersGeneral.errores.noAutorizado });
            };
            if (user.estado === 0) {
                return res.status(400).json({ error: "Usuario Inactivo" });
            };
            const validPassword = bcrypt.compareSync(password, user.password);
            if (!validPassword) {
                return res.status(400).json({ error: "Correo/Password incorrectos" });
            };
            const token = await generarJWT(user._id);
            delete user._doc.password;
            res.json({ user, token });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    // Código Recuperación de Contraseña
    codigoRecuperacion: async (req, res) => {
        try {
            const { correo } = req.params;
            const codigo = generarCodigo();

            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.userEmail,
                    pass: process.env.password,
                },
            });

            const mailOptions = {
                from: process.env.userEmail,
                to: correo,
                subject: 'Recuperación de contraseña',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .email-container {
                            font-family: Arial, sans-serif;
                            line-height: 1.5;
                            color: #333333;
                            max-width: 600px;
                            margin: 20px auto;
                            border: 1px solid #dddddd;
                            border-radius: 8px;
                            overflow: hidden;
                        }
                        .email-header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 20px;
                            text-align: center;
                        }
                        .email-body {
                            padding: 20px;
                        }
                        .email-code {
                            font-size: 24px;
                            color: #4CAF50;
                            text-align: center;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="email-header">
                            <h1>Recuperación de Contraseña</h1>
                        </div>
                        <div class="email-body">
                            <p>Hola,</p>
                            <p>Has solicitado recuperar tu contraseña. Usa el siguiente código para completar el proceso:</p>
                            <div class="email-code">${codigo}</div>
                            <p>Si no solicitaste esta acción, ignora este mensaje.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        error: 'Error al enviar el correo',
                    });
                }
                console.log('Correo enviado: ' + info.response);
                res.json({
                    success: true,
                    message: 'Correo enviado exitosamente'
                });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Error interno del servidor',
            });
        }
    },

    //Verificar Codigo Recuperacion de contraseña
    confirmarCodigo: async (req, res) => {
        try {
            const { codigo } = req.params;
            if (!codigoEnviado) {
                res.status(400).json({ error: 'No se ha solicitado un código de recuperación' });
            }

            const { codigo: codigoGuardado, fechaCreacion } = codigoEnviado;
            const tiempoExpiracion = 30;

            const tiempoActual = new Date();
            const tiempoTranscurrido = tiempoActual - new Date(fechaCreacion);
            const tiempoMinutos = Math.round(tiempoTranscurrido / (1000 * 60));

            if (tiempoMinutos > tiempoExpiracion) {
                res.status(400).json({ error: 'El código ha expirado' });
            }

            if (codigo === codigoGuardado) {
                res.json({ message: 'Código correcto' });
            }

            res.status(400).json({ error: 'Código incorrecto' });
        } catch (error) {
            return res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Establecer nueva Contraseña
    nuevaPassword: async (req, res) => {
        try {
            const { codigo, password } = req.body;

            const { codigo: codigoGuardado, fechaCreacion } = codigoEnviado;
            const tiempoExpiracion = 30;

            const tiempoActual = new Date();
            const tiempoTranscurrido = tiempoActual - new Date(fechaCreacion);
            const tiempoMinutos = Math.round(tiempoTranscurrido / (1000 * 60));

            if (tiempoMinutos > tiempoExpiracion) {
                res.status(400).json({ error: 'El código ha expirado' });
            }

            if (codigo === codigoGuardado) {
                codigoEnviado = {};
                const usuario = req.UserUpdate;

                const salt = bcrypt.genSaltSync();
                const newPasswordHash = bcrypt.hashSync(password, salt);

                await User.findByIdAndUpdate(usuario.id, { password: newPasswordHash }, { new: true });

                return res.status(200).json({ message: 'Contraseña actualizada' });
            }

            res.status(400).json({ error: 'Código incorrecto' });
        } catch (error) {
            return res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Cambio de contraseña
    putCambioPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { password, newPassword } = req.body;
            const usuario = await User.findById(id);

            if (!usuario) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };

            const passwordAnterior = usuario.password;

            const validPassword = bcrypt.compareSync(
                String(password),
                String(passwordAnterior)
            );

            if (!validPassword) {
                return res.status(400).json({ error: "Contraseña actual incorrecta" });
            };

            const salt = bcrypt.genSaltSync();
            const newPasswordHash = bcrypt.hashSync(newPassword, salt);

            await User.findByIdAndUpdate(id, { password: newPasswordHash }, new { new: true });

            return res.status(200).json({ message: "Contraseña actualizada" });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Editar Usuario
    putUserUpdate: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, correo, rol } = req.body;
            const user = await User.findByIdAndUpdate(id, { nombre, correo, rol }, { new: true });
            res.json(user);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Activar Usuario
    putActivarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(id, { estado: 1 }, { new: true });
            const { password, ...userWithoutPassword } = user._doc;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Inactivar Usuario
    putInactivarUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByIdAndUpdate(id, { estado: 0 }, { new: true });
            const { password, ...userWithoutPassword } = user._doc;
            res.status(200).json(userWithoutPassword);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    // Eliminar Usuario
    deleteUsuario: async (req, res) => {
        try {
            const { id } = req.params;
            await User.findByIdAndDelete(id);
            res.json({ message: 'Usuario eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    }
};

export default hhtpUser;