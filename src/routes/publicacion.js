import { Router } from 'express';
import { check } from 'express-validator';
import { validarJWT } from '../middlewares/validar-jwt.js';
import validarCampos from '../middlewares/validar-campos.js';
import hhtpPublicacion from '../controllers/publicacion.js';
import helpersUser from '../helpers/user.js';

const router = Router();

router.get("/all", [
    validarJWT
], hhtpPublicacion.getPublicaciones);

router.get("/activas", [
    validarJWT
], hhtpPublicacion.getPublicacionesActivas);

router.get("/pendientes", [
    validarJWT
], hhtpPublicacion.getPublicacionesPendientes);

router.get("/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos
], hhtpPublicacion.getPublicacionById);

router.get("/idUser/:idUser", [
    validarJWT,
    check('idUser', 'Identificador requerido').not().isEmpty(),
    check('idUser', 'Identificador requerido').isMongoId(),
    validarCampos
], hhtpPublicacion.getPublicacionesByIdUser);

router.get("/date/:startDate/:endDate", [
    validarJWT,
    check('startDate', 'Fecha de inicio requerida').not().isEmpty(),
    check('endDate', 'Fecha de fin requerida').not().isEmpty(),
    validarCampos
], hhtpPublicacion.getPublicacionesByDateRange);

router.get("/tipo/:tipo", [
    validarJWT,
    check('tipo', 'Tipo requerido').not().isEmpty(),
    validarCampos
], hhtpPublicacion.getPublicacionesByTipo);

router.post("/add", [
    validarJWT,
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    check('tipo', 'El tipo es obligatorio').not().isEmpty(),
    check('ciudad', 'La ciudad es obligatoria').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('idUser', 'Identificador del usuario es obligatorio').not().isEmpty(),
    check('idUser', 'Identificador del usuario es obligatorio').isMongoId(),
    check('idUser').custom(helpersUser.existeId),
    validarCampos,
], hhtpPublicacion.postAddPublicacion);

router.put("/editar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    check('titulo', 'El titulo es obligatorio').not().isEmpty(),
    check('contenido', 'El contenido es obligatorio').not().isEmpty(),
    check('tipo', 'El tipo es obligatorio').not().isEmpty(),
    check('ciudad', 'La ciudad es obligatoria').not().isEmpty(),
    check('categoria', 'La categoria es obligatoria').not().isEmpty(),
    check('idUser', 'Identificador del usuario es obligatorio').not().isEmpty(),
    check('idUser', 'Identificador del usuario es obligatorio').isMongoId(),
    check('idUser').custom(helpersUser.existeId),
    validarCampos,
], hhtpPublicacion.putUpdatePublicacion);

router.put("/activar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], hhtpPublicacion.putActivarPublicacion);

router.put("/inactivar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], hhtpPublicacion.putInactivarPublicacion);

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], hhtpPublicacion.deletePublicacion);

export default router;