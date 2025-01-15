import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.js";
import helpersGeneral from "../helpers/generales.js";

const validarRolAdmin = async (req, res, next) => {
    try {
        const token = req.header("x-token");
        if (!token) {
            return res.status(401).json({
                error: "No hay token en la peticion",
            });
        }
        const { uid } = jwt.verify(token, process.env.secretKey);
        const usuario = await Usuario.findById(uid);
        if (usuario.rol != "admin") {
            return res.status(401).json({ error: helpersGeneral.errores.noAutorizado });
        }
        req.usuario = usuario
        next();
    } catch (error) {
        res.status(500).json({ error });
    }
};

export { validarRolAdmin };