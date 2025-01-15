import { Router } from 'express';
import { check } from 'express-validator';
import { validarJWT } from '../middlewares/validar-jwt.js';
import validarCampos from '../middlewares/validar-campos.js';
import httpNotificacion from '../controllers/notificacion.js';
import helpersUsuario from '../helpers/user.js';

const router = Router();

router.get("/all", [
    validarJWT
], httpNotificacion.getNotificaciones);

router.get("/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos
], httpNotificacion.getNotificacionById);

router.get("/pub/:idPublicacion", [
    validarJWT,
    check('idPublicacion', 'Identificador requerido').not().isEmpty(),
    check('idPublicacion', 'Identificador requerido').isMongoId(),
    validarCampos
], httpNotificacion.getNotificacionByIdPublicacion);

router.get("/user/:idUser", [
    validarJWT,
    check('idUser', 'Identificador requerido').not().isEmpty(),
    check('idUser', 'Identificador requerido').isMongoId(),
    validarCampos
], httpNotificacion.getNotificacionesByIdUser);

router.get("/date/:startDate/:endDate", [
    validarJWT,
    check('startDate', 'Fecha de inicio requerida').not().isEmpty(),
    check('endDate', 'Fecha de fin requerida').not().isEmpty(),
    validarCampos
], httpNotificacion.getNotificacionesByDateRange);

router.get("/tipo/:tipo", [
    validarJWT,
    check('tipo', 'Tipo de notificacion requerido').not().isEmpty(),
    validarCampos
], httpNotificacion.getNotificacionesByTipo);

router.post("/add", [
    validarJWT,
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(),
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('idUser').custom(helpersUsuario.existeId), 
    check('tipo', 'Indique el tipo de reaccion').not().isEmpty(),
    validarCampos,
], httpNotificacion.postAddNotificacion);

router.put("/leida/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpNotificacion.leerNotificacion);

router.put("/noleer/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpNotificacion.noLeerNotificacion);

router.put("/activar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpNotificacion.putActivarNotificacion);

router.put("/inactivar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpNotificacion.putInactivarNotificacion);

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpNotificacion.deleteNotificacion);

export default router;