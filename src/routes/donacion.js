import { Router } from 'express';
import { check } from 'express-validator';
import { validarJWT } from '../middlewares/validar-jwt.js';
import validarCampos from '../middlewares/validar-campos.js';
import httpDonacion from '../controllers/donacion.js';
import helpersUsuario from '../helpers/user.js';


const router = Router();

router.get("/all", [
    validarJWT
], httpDonacion.getDonaciones);

router.get("/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos
], httpDonacion.getDonacionById);


router.get("/user/:idUser", [
    validarJWT,
    check('idUser', 'Identificador requerido').not().isEmpty(),
    check('idUser', 'Identificador requerido').isMongoId(),
    validarCampos
], httpDonacion.getDonacionByIdUser);

router.get("/date/:startDate/:endDate", [
    validarJWT,
    check('startDate', 'Fecha de inicio requerida').not().isEmpty(),
    check('endDate', 'Fecha de fin requerida').not().isEmpty(),
    validarCampos
], httpDonacion.getDonacionesByDateRange);

router.post("/add", [
    validarJWT,
    check('idUser', 'Identificador del usuario requerido').not().isEmpty(), 
    check('idUser', 'Identificador del usuario requerido').isMongoId(),
    check('idUser').custom(helpersUsuario.existeId),
    check('monto', 'Monto requerido').not().isEmpty(),
    check('mensaje', 'Mensaje requerido').not().isEmpty(),
    check('comprobante', 'Comprobante requerido').not().isEmpty(),
    validarCampos,
], httpDonacion.postAddDonacion);

// router.put("/editar/:id", [
//     validarJWT,
//     check('id', 'Identificador requerido').not().isEmpty(),
//     check('id', 'Identificador requerido').isMongoId(),
//     check('idUser', 'Identificador del usuario requerido').not().isEmpty(),
//     check('idUser', 'Identificador del usuario requerido').isMongoId(),
//     check('monto', 'Monto requerido').not().isEmpty(),
//     check('mensaje', 'Mensaje requerido').not().isEmpty(),
//     check('comprobante', 'Comprobante requerido').not().isEmpty(),
//     validarCampos,
// ], httpDonacion.putUpdateDonacion);

router.put("/activar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpDonacion.putActivarDonacion);

router.put("/inactivar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpDonacion.putInactivarDonacion);

router.delete("/eliminar/:id", [
    validarJWT,
    check('id', 'Identificador requerido').not().isEmpty(),
    check('id', 'Identificador requerido').isMongoId(),
    validarCampos,
], httpDonacion.deleteDonacion);

export default router;