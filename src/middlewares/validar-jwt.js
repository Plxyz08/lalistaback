import jwt from "jsonwebtoken";
import User from "../models/user.js";
import helpersGeneral from "../helpers/generales.js";

const generarJWT = (uid) => {
    return new Promise((resolve, reject) => {
        const payload = { uid };
        jwt.sign(
            payload,
            process.env.secretKey,
            {
                expiresIn: "24h",
            },
            (err, token) => {
                if (err) {
                    console.log(err);
                    reject("No se pudo generar el token");
                } else {
                    resolve(token);
                }
            }
        );
    });
};

const validarJWT = async (req, res, next) => {
    const token = req.header('x-token');

    if (!token) {
        return res.status(401).json({
            error: 'No hay token en la petición',
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.secretKey);

        // Leer el usuario que corresponde al uid
        const usuario = await User.findById(uid);

        if (!usuario) {
            return res.status(401).json({
                error: 'Token no válido - usuario no existe en DB',
            });
        }

        // Verificar si el uid tiene estado true
        if (usuario.estado === 0) {
            return res.status(401).json({
                error: 'Token no válido - usuario con estado: false',
            });
        }

        req.user = usuario;

        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expirado' });
        }

        console.log(error);
        return res.status(500).json({ error: 'Error del servidor' });
    }
};


export { generarJWT, validarJWT };