const { getPreguntas } = require("./database")

// Formato preguntas
// preguntas:[
//    {
//        id: 0,
//        enunciado: "Enunciado pregunta 1",
//        opciones : ["opcion 0", "opcion 1", "opcion 2"],
//        respuesta: 0
//    }, ...
// ]

const questionMiddleware = async (req, res, next) => {
    if (!res.locals.partials) res.locals.partials = {}
    res.locals.partials.questionContext = await getPreguntas()
    next()
}

module.exports = questionMiddleware