const firebaseAdmin = require("firebase-admin")
const db = firebaseAdmin.initializeApp().database()

const admin_authenticated = (username, password) => {
    return new Promise((resolve, rejects) => {
        db.ref("admins").orderByChild("username").equalTo(username).on("value", (snap) => {
            if (snap.exists()) {
                 // El usuario está registrado como administrador -> Comprobamos la contraseña
                pass = snap.val()[0].password
                if (pass === password){
                    resolve() // Contraseña correcta

                }else rejects("Incorrect password")
    
            }else rejects("User not registered as admin")
        });
    })
}

const getPreguntas = () => {
    return new Promise((resolve, rejects) => {
        db.ref("preguntas").on("value", (snap) => {
            resolve(snap.val())
        })
    })
}

module.exports.getPreguntas = getPreguntas
module.exports.admin_authenticated = admin_authenticated