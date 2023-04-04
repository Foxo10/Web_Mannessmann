const   functions = require("firebase-functions"),
        express = require("express"),
        session = require("express-session"),
        handlebars = require('express-handlebars'),
        cors = require('cors'),
        path = require('path'),
        questionMiddleware = require('./questions'),
        { admin_authenticated } = require('./database')

// Iniciamos nuestra aplicación
const app = express()

// Habilitamos handlebars como nuestro motor de plantillas
app.set('view engine', 'handlebars');
app.engine('handlebars', handlebars.engine({
    layoutsDir: path.join(__dirname, "views", "layouts")
}));

// Habilitamos CORS, el middleware de las preguntas y los archivos estáticos
app.use( cors() )
app.use("/cuestionario", questionMiddleware )
app.use( express.static(path.join(__dirname, "public")) )
app.use(session({ secret: 'tacoma web', cookie: {} }))

// Definimos las rutas
app.get("/", (req, res) => {
    res.render('main', {layout : 'index'})
})

app.get("/cuestionario", (req, res) => {
    res.render('cuestionario', {layout : 'index'})
})

app.get("/login", (req, res) => {
    res.render('login', {layout : 'index'})
})

app.post("/login", (req, res) => {
    admin_authenticated("admin", "admin123").then(() => {
        // Usuario autenticado
        req.session.auth = true;
        res.redirect("/dashboard")
    }).catch((err) => {
        res.render('login', {layout : 'index', error: err})
    })
})

app.get("/dashboard", (req, res) => {
    if (!req.session.auth) res.redirect("/login")
    else res.render('dashboard', {layout : 'index'})
})

// Exportamos nuestra aplicación
exports.app = functions.https.onRequest(app);