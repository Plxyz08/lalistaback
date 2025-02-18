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
            const { nombre, correo, password, rol, image } = req.body;
            const user = new User({ nombre, correo, password, rol, image });
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
                    return res.status(500).json({
                        success: false,
                        error: 'Error al enviar el correo',
                    });
                }
                res.json({
                    success: true,
                    message: 'Correo enviado exitosamente'
                });
            });
        } catch (error) {
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
                return res.status(400).json({ error: 'No se ha solicitado un código de recuperación' });
            }
            const { codigo: codigoGuardado, fechaCreacion } = codigoEnviado;
            const tiempoExpiracion = 30;

            const tiempoActual = new Date();
            const tiempoTranscurrido = tiempoActual - new Date(fechaCreacion);
            const tiempoMinutos = Math.round(tiempoTranscurrido / (1000 * 60));

            if (tiempoMinutos > tiempoExpiracion) {
                return res.status(400).json({ error: 'El código ha expirado' });
            }

            if (codigo === codigoGuardado) {
                return res.json({ message: 'Código correcto' });
            }

            return res.status(400).json({ error: 'Código incorrecto' });
        } catch (error) {
            return res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Establecer nueva Contraseña
    nuevaPassword: async (req, res) => {
        try {
            const { password } = req.body;

            const usuario = req.UserUpdate;
            const salt = bcrypt.genSaltSync();
            const newPasswordHash = bcrypt.hashSync(password, salt);

            await User.findByIdAndUpdate(usuario.id, { password: newPasswordHash }, { new: true });
            return res.status(200).json({ message: 'Contraseña actualizada' });
        } catch (error) {
            return res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Cambio de contraseña
    putCambioPassword: async (req, res) => {
        try {
            const { id } = req.params;
            const { password, nuevaPassword } = req.body;
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
            const newPasswordHash = bcrypt.hashSync(nuevaPassword, salt);
            await User.findByIdAndUpdate(id, { password: newPasswordHash }, { new: true });
            return res.status(200).json({ message: "Contraseña actualizada" });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },

    //Editar Usuario
    putUserUpdate: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, correo, image } = req.body;
            const user = await User.findByIdAndUpdate(id, { nombre, correo, image }, { new: true });
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
    },

    // Enviar Noticias
    sendNoticias: async (req, res) => {
        try {
            const { asunto, contenido, imagen } = req.body;
    
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.userEmail,
                    pass: process.env.password,
                },
            });
    
            const users = await User.find({ rol: 'user' });
            const sendMailPromises = users.map(user => {
                const mailOptions = {
                    from: process.env.userEmail,
                    to: user.correo,
                    subject: asunto,
                    html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Correo de Noticias</title>
                        <style>
                            body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background-color: #f4f4f4;
                                margin: 0;
                                padding: 0;
                            }
                            .email-container {
                                max-width: 600px;
                                margin: 20px auto;
                                background-color: #ffffff;
                                border-radius: 8px;
                                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                                overflow: hidden;
                            }
                            .email-header {
                                background: hsl(43, 74%, 49%);
                                color: white;
                                padding: 30px 20px;
                                text-align: center;
                                font-size: 24px;
                                font-weight: bold;
                            }
                            .email-body {
                                padding: 30px 20px;
                                text-align: center;
                            }
                            .content-text {
                                font-size: 16px;
                                color: #333333;
                                margin-bottom: 20px;
                                line-height: 1.6;
                            }
                            .image-container {
                                margin: 20px 0;
                                text-align: center;
                            }
                            .content-image {
                                max-width: 100%;
                                height: auto;
                                border-radius: 8px;
                                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                            }
                            .button-container {
                                margin: 30px 0;
                                text-align: center;
                            }
                            .cta-button {
                                display: inline-block;
                                background-color: hsl(43, 74%, 49%);
                                color: white;
                                padding: 12px 24px;
                                border-radius: 6px;
                                text-decoration: none;
                                font-size: 16px;
                                font-weight: bold;
                            }
                            .cta-button:hover {
                                background-color: hsl(43, 74%, 39%);
                            }
                            .cta-button:link, .cta-button:visited {
                                color: white;
                            }
                            .footer {
                                background-color: #f8f9fa;
                                padding: 15px;
                                text-align: center;
                                font-size: 14px;
                                color: #666666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="email-container">
                            <div class="email-header">
                                ${asunto}
                            </div>
                            <div class="email-body">
                                <p class="content-text">${contenido}</p>

                                ${imagen ? `
                                    <div class="image-container">
                                        <img src="${imagen}" alt="Contenido relacionado" class="content-image">
                                    </div>
                                    ` : ''}
                                <div class="button-container">
                                    <a href="https://lalistawbc.com" target="_blank" class="cta-button" style="color: white">Visita nuestra página web</a>
                                </div>
                            </div>
                            <div class="footer">
                                © ${new Date().getFullYear()} La Lista WBC. Todos los derechos reservados.
                            </div>
                        </div>
                    </body>
                    </html>
                    `,
                };
    
                return transporter.sendMail(mailOptions);
            });
    
            await Promise.all(sendMailPromises);
    
            res.json({ message: 'Noticias enviadas exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor });
        }
    },
};

export default hhtpUser;