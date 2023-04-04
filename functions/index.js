const   functions = require("firebase-functions"),
        express = require("express"),
        session = require("express-session"),
        handlebars = require('express-handlebars'),
        cors = require('cors'),
        path = require('path');

const   { admin_authenticated, addRespuesta } = require('./database'),
        { questionMiddleware, responseMiddleware, respuestasCorrectas } = require('./questions');

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
app.use("/dashboard", responseMiddleware )
app.use( express.static(path.join(__dirname, "public")) )
app.use(session({ secret: 'tacoma web', cookie: {} }))

// Definimos las rutas
app.get("/", (req, res) => {
    addRespuesta("noexiste@mail.com").then().catch((err) => {
        console.log(err)    
    })
    res.render('main', {layout : 'index'})
})

app.get("/cuestionario", (req, res) => {
    res.render('cuestionario', {layout : 'index'})
})

app.post("/cuestionario", (req, res) => {
    if(respuestasCorrectas(req.body.respuestas)){
        res.redirect("/formulario")
    }else{
        res.render('cuestionario', {layout : 'index', error: "Hay alguna respuesta incorrecta"})
    }
})

app.get("/formulario", (req, res) => {
    res.render('form', {layout : 'index'})
})

app.get("/login", (req, res) => {
    res.render('login', {layout : 'index'})
})

app.post("/login", (req, res) => {
    username = req.body.username
    password = req.body.password

    admin_authenticated(username, password).then(() => {
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