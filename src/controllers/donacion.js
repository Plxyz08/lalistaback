import Donacion from '../models/donacion.js';
import User from '../models/user.js';
import nodemailer from 'nodemailer';
import helpersGeneral from '../helpers/generales.js';

const formatCurrency = (amount) => {
    return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const httpDonacion = {
    //Obtener todos los donaciones
    getDonaciones: async (req, res) => {
        try {
            const donaciones = await Donacion.find().populate('idUser', 'nombre correo');
            if (!donaciones) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(donaciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Obtener donaciones por su id
    getDonacionById: async (req, res) => {
        try {
            const { id } = req.params;
            const donacionId = await Donacion.findById(id).populate('idUser', 'nombre correo');
            if (!donacionId) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            };
            res.json(donacionId);
        } catch (error) {
            req.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener donaciones por el id del Usuario
    getDonacionByIdUser: async (req, res) => {
        try {
            const { idUser } = req.params;
            const donaciones = await Donacion.find({ idUser: idUser }).populate('idUser', 'nombre correo');
            if (!donaciones || donaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(donaciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Obtener donaciones por rango de fechas
    getDonacionesByDateRange: async (req, res) => {
        try {
            const { startDate, endDate } = req.params;
            const start = new Date(startDate);
            const end = new Date(endDate);
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const donaciones = await Donacion.find({
                createAT: {
                    $gte: start,
                    $lte: end
                }
            }).populate('idUser', 'nombre correo');
            if (!donaciones || donaciones.length === 0) {
                return res.status(400).json({ error: helpersGeneral.errores.noEncontrado });
            }
            res.json(donaciones);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Agregar un nuevo donacion
    postAddDonacion: async (req, res) => {
        try {
            const { idUser, monto, mensaje, comprobante } = req.body;
            
            const user = await User.find({ _id: idUser });
    
            const nuevaDonacion = new Donacion({
                idUser,
                monto,
                mensaje,
                comprobante,
            });
            
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.userEmail,
                    pass: process.env.password,
                },
            });

            const formattedMonto = formatCurrency(monto);
    
            const htmlTemplate = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        .email-container {
                            max-width: 600px;
                            margin: 0 auto;
                            font-family: Arial, sans-serif;
                            background-color: #f9f9f9;
                            padding: 20px;
                        }
                        .header {
                            background-color: #4CAF50;
                            color: white;
                            padding: 20px;
                            text-align: center;
                            border-radius: 5px 5px 0 0;
                        }
                        .content {
                            background-color: white;
                            padding: 20px;
                            border-radius: 0 0 5px 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        }
                        .donation-details {
                            margin: 20px 0;
                            padding: 15px;
                            background-color: #f5f5f5;
                            border-left: 4px solid #4CAF50;
                        }
                        .amount {
                            font-size: 24px;
                            color: #4CAF50;
                            font-weight: bold;
                        }
                        .message {
                            margin-top: 15px;
                            padding: 10px;
                            background-color: #fff;
                            border: 1px solid #eee;
                            border-radius: 4px;
                        }
                        .footer {
                            margin-top: 20px;
                            text-align: center;
                            color: #666;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <div class="header">
                            <h1>¡Nueva Donación Recibida!</h1>
                        </div>
                        <div class="content">
                            <h2>Detalles de la Donación</h2>
                            <div class="donation-details">
                                <p><strong>Usuario:</strong> ${user[0].nombre}</p>
                                <p><strong>Correo:</strong> ${user[0].correo}</p>
                                <p><strong>Monto:</strong> <span class="amount">${formattedMonto}</span></p>
                                <div class="message">
                                    <p><strong>Mensaje:</strong></p>
                                    <p>${mensaje}</p>
                                </div>
                                ${comprobante ? `<p><strong>Comprobante:</strong> <a href="${comprobante}">Ver comprobante</a></p>` : ''}
                            </div>
                            <div class="footer">
                                <p>Este es un correo automático, por favor no responder.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `;
    
            const mailOptions = {
                from: '"La ListaWBC" <' + process.env.userEmail + '>',  
                to: process.env.userEmail,
                subject: 'Nueva Donación',
                html: htmlTemplate
            };
    
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    res.status(500).json({
                        success: false,
                        error: 'Error al enviar el correo',
                    });
                } else {
                    console.log('Correo enviado: ' + info.response);
                    res.json({ 
                        success: true,
                        message: 'Correo enviado exitosamente' 
                    });
                }
            });
    
            const donacionGuardada = await nuevaDonacion.save();
            res.status(201).json(donacionGuardada);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // // Editar un Donacion
    // putUpdateDonacion: async (req, res) => {
    //     try {
    //         const { id } = req.params;
    //         const { monto, mensaje, comprobante } = req.body;
    //         const userId = req.user._id;
    //         const userRole = req.user.rol;

    //         const donacion = await Donacion.findById(id);

    //         if (!donacion) {
    //             return res.status(404).json({ error: helpersGeneral.errores.noEncontrado });
    //         }

    //         if (donacion.idUser.toString() !== userId && userRole !== 'admin') {
    //             return res.status(403).json({ error: 'No tienes permiso para editar esta donación' });
    //         }

    //         const donacionActualizada = await Donacion.findByIdAndUpdate(
    //             id,
    //             { monto, mensaje, comprobante },
    //             { new: true }
    //         );

    //         res.json(donacionActualizada);
    //     } catch (error) {
    //         res.status(500).json({ error: helpersGeneral.errores.servidor, error });
    //     }
    // },

    //Activar Donacion
    
    putActivarDonacion: async (req, res) => {
        try {
            const { id } = req.params;
            const donacion = await Donacion.findByIdAndUpdate(id, { estado: 'Aceptada' }, { new: true });
            res.json(donacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    //Inactivar Donacion
    putInactivarDonacion: async (req, res) => {
        try {
            const { id } = req.params;
            const donacion = await Donacion.findByIdAndUpdate(id, { estado: 'Denegada' }, { new: true });
            res.json(donacion);
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    },

    // Eliminar Donacion
    deleteDonacion: async (req, res) => {
        try {
            const { id } = req.params;
            await Donacion.findByIdAndDelete(id);
            res.json({ message: 'Donacion eliminado exitosamente' });
        } catch (error) {
            res.status(500).json({ error: helpersGeneral.errores.servidor, error });
        }
    }
};

export default httpDonacion;