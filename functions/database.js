const firebaseAdmin = require("firebase-admin")
const db = firebaseAdmin.initializeApp().database()

const admin_authenticated = (username, password) => {
    return new Promise((resolve, rejects) => {
        db.ref("admins").orderByChild("username").equalTo(username).once("value", (snap) => {
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
        db.ref("preguntas").once("value", (snap) => {
            resolve(snap.val())
        })
    })
}

const getRespuestas = () => {
    return new Promise((resolve, rejects) => {
        db.ref("respuestas").once("value", (snap) => {
            resolve(snap.val())
        })
    })
}

function findKey(listaRespuestas, mail) { 
    for (let key in listaRespuestas)
       if (listaRespuestas[key].mail === mail) return key;
    
       return null
}

const addRespuesta = (mail, nombre, apellidos) => {
    return new Promise((resolve, rejects) => {
        db.ref("respuestas").once("value", (snap) => {
            const listaRespuestas = snap.val()
            const key = findKey(listaRespuestas, mail)
            const now = new Date()
            
            if (key) {
                res = listaRespuestas[key]

                // Comprobamos la fecha de la última participación
                const fecha = Date.parse(res.fechaUltimaRes);
                const diffTime = Math.abs(now - fecha);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

                if (diffDays <= 1 && res.numResUltimaFecha < 3){
                    // Participamos por n vez en una fecha
                    resolve(db.ref("respuestas").child(key).update({
                        "fechaUltimaRes": now.toISOString(),
                        "numResUltimaFecha": res.numResUltimaFecha +1,
                        "numRes": res.numRes +1
                    }))
                    
                }else if(diffDays > 1){
                    // Participamos por primera vez en una fecha
                    resolve(db.ref("respuestas").child(key).update({
                        "fechaUltimaRes": now.toISOString(),
                        "numResUltimaFecha": 1,
                        "numRes": res.numRes +1
                    }))
                    
                }else{
                    rejects("Limite de participaciones diarias alcanzado.")
                }

            }else{
                // Este usuario no ha participado anteriormente
                resolve(db.ref("respuestas").push({
                    "mail": mail,
                    "nombre": nombre,
                    "apellidos": apellidos,
                    "fechaUltimaRes": now.toISOString(),
                    "numRes": 1,
                    "numResUltimaFecha": 1
                }))
            }
            
        });
    })
}

module.exports.getPreguntas = getPreguntas
module.exports.getRespuestas = getRespuestas
module.exports.addRespuesta = addRespuesta
module.exports.admin_authenticated = admin_authenticated