import { Router } from 'express';
import { check } from 'express-validator';
import { validarJWT } from '../middlewares/validar-jwt.js';
import validarCampos from '../middlewares/validar-campos.js';
import httpComentario from '../controllers/comentario.js';
import helpersUsuario from '../helpers/user.js';

const router = Router();

router.get("/all", [
    validarJWT
], httpComentario.getComentarios);

router.get("/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos
], httpComentario.getComentarioById);

router.get("/pub/:idPublicacion", [
    validarJWT,
    check('idPublicacion', 'Identificador requerido').not().isEmpty(),
    check('idPublicacion', 'Identificador requerido').isMongoId(),
    validarCampos
], httpComentario.getComentarioByIdPublicacion);

router.get("/user/:idUser", [
    validarJWT,
    check('idUser', 'Identificador requerido').not().isEmpty(),
    check('idUser', 'Identificador requerido').isMongoId(),
    validarCampos
], httpComentario.getComentariosByIdUser);

router.get("/date/:startDate/:endDate", [
    validarJWT,
    check('startDate', 'Fecha de inicio requerida').not().isEmpty(),
    check('endDate', 'Fecha de fin requerida').not().isEmpty(),
    validarCampos
], httpComentario.getComentarioByDateRange);

router.post("/add", [
    validarJWT,
    check('idPublicacion', 'Identificador de la publicacion requerido').not().isEmpty(),
    check('idPublicacion', 'Identificador de la publicacion requerido').isMongoId(),
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(),
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('idUser').custom(helpersUsuario.existeId),
    check('contenido', 'Contenido requerido').not().isEmpty(),
    validarCampos,
], httpComentario.postAddComentario);

router.put("/editar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(),
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('contenido', 'Contenido requerido').not().isEmpty(),
    validarCampos,
], httpComentario.putUpdateComentario);

router.put("/activar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpComentario.putActivarComentario);

router.put("/inactivar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpComentario.putInactivarComentario);

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpComentario.deleteComentario);

export default router;