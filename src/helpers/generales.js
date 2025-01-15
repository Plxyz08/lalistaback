const helpersGeneral = {
    verificarEspacios: async (val) => {
        if (typeof val === "string") {
            if (val.trim() === "") throw new Error("Solo espacios no permitidos");
        }
    },

    eliminarEspacios: async (body) => {
        const nuevoObjeto = {};

        Object.entries(body).forEach(([clave, valor]) => {
            if (typeof valor === "string") {
                nuevoObjeto[clave] = valor.trim();
            } else {
                nuevoObjeto[clave] = valor;
            }
        });

        return nuevoObjeto;
    },

    quitarTildes: async (texto) => {
        const tildes = {
            á: "a",
            é: "e",
            í: "i",
            ó: "o",
            ú: "u",
            ü: "u",
            Á: "A",
            É: "E",
            Í: "I",
            Ó: "O",
            Ú: "U",
            Ü: "U",
            ñ: "n",
            Ñ: "N",
        };

        return texto.replace(
            /[áéíóúüÁÉÍÓÚÜñÑ]/g,
            (match) => tildes[match] || match
        );
    },

    primeraMayuscula: async (cadena) => {
        const mayus = cadena.toLowerCase();
        return mayus.charAt(0).toUpperCase() + mayus.slice(1);
    },

    mayusAllPalabras: async (frase) => {
        const palabras = frase.split(" ");

        const palabrasCapitalizadas = palabras.map((palabra) => {
            return palabra.charAt(0).toUpperCase() + palabra.slice(1);
        });

        const fraseCapitalizada = palabrasCapitalizadas.join(" ");
        return fraseCapitalizada;
    },

    errores: {
        servidor: "Error en el servidor, hable con el WebMaster",
        noEncontrado: "Sin resultados",
        noAutorizado: "Acción no autorizada",
    },    
};

export default helpersGeneral;