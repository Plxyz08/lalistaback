import { Router } from 'express';
import { check } from 'express-validator';
import { validarJWT } from '../middlewares/validar-jwt.js';
import validarCampos from '../middlewares/validar-campos.js';
import httpLista from '../controllers/lista.js';
import helpersUsuario from '../helpers/user.js';

const router = Router();

router.get("/all", [
    validarJWT
], httpLista.getListas);

router.get("/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos
], httpLista.getListaById);


router.get("/user/:idUser", [
    validarJWT,
    check('idUser', 'Identificador requerido').not().isEmpty(),
    check('idUser', 'Identificador requerido').isMongoId(),
    validarCampos
], httpLista.getListaByIdUser);

router.get("/date/:startDate/:endDate", [
    validarJWT,
    check('startDate', 'Fecha de inicio requerida').not().isEmpty(),
    check('endDate', 'Fecha de fin requerida').not().isEmpty(),
    validarCampos
], httpLista.getListaByDateRange);

router.get("/list/black", [
], httpLista.getListaBlack);

router.get("/list/white", [
], httpLista.getListaWhite);

router.get("/categoria/:categoria", [
    validarJWT,
    check('categoria', 'Categoría requerida').not().isEmpty(),
    validarCampos
], httpLista.getListaByCategoria);

router.post("/add", [
    validarJWT,
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(), 
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('idUser').custom(helpersUsuario.existeId),
    check('descripcion', 'Descripción requerida').not().isEmpty(),
    check('razon', 'Razón requerida').not().isEmpty(),
    check('categoria', 'Categoría requerida').not().isEmpty(),
    check('tipo', 'Tipo requerido').not().isEmpty(),
    validarCampos,
], httpLista.postAddLista);

router.put("/editar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(),
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('idUser').custom(helpersUsuario.existeId),
    check('descripcion', 'Descripción requerida').not().isEmpty(),
    check('razon', 'Razón requerida').not().isEmpty(),
    check('categoria', 'Categoría requerida').not().isEmpty(),
    check('tipo', 'Tipo requerido').not().isEmpty(),
    validarCampos,
], httpLista.putUpdateLista);

router.put("/activar/:id/:idCreate", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    check('idCreate', 'Identificador requerido').not().isEmpty(),
    check('idCreate', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpLista.putActivarLista);

router.put("/inactivar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpLista.putInactivarLista);

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpLista.deleteLista);

router.post("/perfil", [
    validarJWT,
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(),
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('descripcion', 'Descripción requerida').not().isEmpty(),
    check('razon', 'Razón requerida').not().isEmpty(),
    check('categoria', 'Categoría requerida').not().isEmpty(),
    check('tipo', 'Tipo requerido').not().isEmpty(),
    validarCampos,
], httpLista.perfilListaPorUsuario);

router.get("/estado/:estado", [
    check('estado', 'Estado requerido').not().isEmpty(),
    validarCampos,
], httpLista.getPerfilesByEstado);

export default router;