import { Router } from 'express';
import { check } from 'express-validator';
import { validarJWT } from '../middlewares/validar-jwt.js';
import validarCampos from '../middlewares/validar-campos.js';
import httpReaccion from '../controllers/reaccion.js';
import helpersUsuario from '../helpers/user.js';

const router = Router();

router.get("/all", [
    validarJWT
], httpReaccion.getReacciones);

router.get("/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos
], httpReaccion.getReaccionById);

router.get("/pub/:idPublicacion", [
    validarJWT,
    check('idPublicacion', 'Identificador requerido').not().isEmpty(),
    check('idPublicacion', 'Identificador requerido').isMongoId(),
    validarCampos
], httpReaccion.getReaccionByIdPublicacion);

router.get("/user/:idUser", [
    validarJWT,
    check('idUser', 'Identificador requerido').not().isEmpty(),
    check('idUser', 'Identificador requerido').isMongoId(),
    validarCampos
], httpReaccion.getReaccionesByIdUser);

router.get("/date/:startDate/:endDate", [
    validarJWT,
    check('startDate', 'Fecha de inicio requerida').not().isEmpty(),
    check('endDate', 'Fecha de fin requerida').not().isEmpty(),
    validarCampos
], httpReaccion.getReaccionesByDateRange);

router.post("/add", [
    validarJWT,
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(),
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('idUser').custom(helpersUsuario.existeId),
    check('tipo', 'Indique el tipo de reaccion').not().isEmpty(),
    validarCampos,
], httpReaccion.postAddReaccion);

router.put("/editar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(),
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('tipo', 'Indique el tipo de reaccion').not().isEmpty(),
    validarCampos,
], httpReaccion.putUpdateReaccion);

router.put("/activar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpReaccion.putActivarReaccion);

router.put("/inactivar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpReaccion.putInactivarReaccion);

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpReaccion.deleteReaccion);

export default router;