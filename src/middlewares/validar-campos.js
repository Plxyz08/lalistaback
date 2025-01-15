import { validationResult } from "express-validator";

const validarCampos = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if(req.codeError){
            return res
            .status(req.codeError)
            .json({error: "Error en los datos enviados"});
        }
        return res.status(400).json({ error: errors });
    }
    next();
}

export default validarCampos;