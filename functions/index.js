const   functions = require("firebase-functions"),
        express = require("express"),
        handlebars = require('express-handlebars'),
        cors = require('cors'),
        path = require('path'),
        questionMiddleware = require('./questions');

// Iniciamos nuestra aplicación
const app = express()

// Habilitamos handlebars como nuestro motor de plantillas
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine({
    layoutsDir: path.join(__dirname, "views", "layouts")
}));

// Habilitamos CORS, el middleware de las preguntas y los archivos estáticos
app.use( cors() )
app.use( questionMiddleware )
app.use( express.static(path.join(__dirname, "public")) )

// Definimos las rutas
app.get("/", (req, res) => {
    res.render('main', {layout : 'index'});
})

app.get("/cuestionario", (req, res) => {
    res.render('cuestionario', {layout : 'index'});
})

// Exportamos nuestra aplicación
exports.app = functions.https.onRequest(app);