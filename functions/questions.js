const getPreguntas = () => Promise.resolve([
    {
        pregunta:{
            id: 0,
            enunciado: "Enunciado pregunta 1",
            opciones : ["opcion 0", "opcion 1", "opcion 2"],
            respuesta: 0
        }
    },
    {
        pregunta:{
            id: 1,
            enunciado: "Enunciado pregunta 1",
            opciones : ["opcion 0", "opcion 1", "opcion 2"],
            respuesta: 0
        }
    },
    {
        pregunta:{
            id: 2,
            enunciado: "Enunciado pregunta 3",
            opciones : ["opcion 0", "opcion 1", "opcion 2"],
            respuesta: 0
        }
    }
])

const questionMiddleware = async (req, res, next) => {
    if (!res.locals.partials) res.locals.partials = {}
    res.locals.partials.questionContext = await getPreguntas()
    next()
}

module.exports = questionMiddleware