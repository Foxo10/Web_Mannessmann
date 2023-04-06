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
app.use(session({ name: "__session", secret: 'tacoma web', cookie: {} }))

// Definimos las rutas
app.get("/", (req, res) => {
    err = req.query.error
    info = req.query.info
    res.render('main', {layout : 'index', error: err, info: info})
})

app.get("/cuestionario", (req, res) => {
    res.render('cuestionario', {layout : 'index'})
})

app.post("/cuestionario", async (req, res) => {
    if(await respuestasCorrectas(req.body)){
        req.session.cuestionario = true;
        res.redirect("/formulario")
    }else{
        let error = encodeURIComponent("Hay alguna respuesta incorrecta.");
        res.redirect("/?error=" + error)
    }
})

app.get("/formulario", (req, res) => {
    if(req.session.cuestionario){
        res.render('form', {layout : 'index'})
    }else{
        let error = encodeURIComponent("No puedes acceder al formulario antes de responder las preguntas.");
        res.redirect("/?error=" + error)
    }
})

app.post("/formulario", (req, res) => {
    if(req.session.cuestionario){
        let email = req.body.email
        let nombre = req.body.nombre
        let apellidos = req.body.apellidos

        if(email == null || nombre == null || apellidos == null){
            res.redirect("/?error=3a")
        }
    
        addRespuesta(email, nombre, apellidos).then(() => {
            let info = encodeURIComponent("Tu participación se ha registrado correctamente.");
            res.redirect("/?info=" + info)
        }).catch((err) => {
            let error = encodeURIComponent(err);
            res.redirect("/?error=" + error)
        })

    }else{
        let error = encodeURIComponent("No puedes acceder al formulario antes de responder las preguntas.");
        res.redirect("/?error=" + error)
    }
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