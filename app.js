//Importamos el framework express
const express = require('express');

//Asignamos la variable constructora para que tenga todos los métodos de express
const app = express();

//Importamos el framework jsonwebtoken
const jwt = require('jsonwebtoken');

//Importamos el archivo keys.js y configuramos la key dentro de keys
const keys = require('./settings/keys');
app.set('key', keys.key);

//URL CODIFICADA
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//Configuramos el puerto y lo abrimos con modo escucha (listen)
app.set('port', (3000));
app.listen(3000, function(req, res){
    console.log("--- CONEXIÓN EXITOSA --- http://localhost:3000/");
});

//Creamos una ruta para el directorio raíz o principal con el método GET
app.get("/", (req, res)=>{
    res.send("Bienvenido, esta es la ruta de inicio<br>http://localhost:3000/");
})

// //Creamos una ruta para la página de LOGIN usando el método POST
app.post('/login', (req, res)=>{
    if (req.body.usuario == 'admin' && req.body.pass == '12345'){
        const payload= {
            check:true
        };
//Usando el método sign para iniciar la autenticación del token
        const token = jwt.sign(payload, app.get('key'), {
            //Definimos la expiración del token en minutos, horas o días
            expiresIn: '1m'
        });
        res.json({
            message: '¡Autenticación Exitosa!',
            token: token
        });
    } else {
        res.json({
            message: 'Usuario y/o password son incorrectas'
        })
    }
});

// //Importamos express router para verificacion de tokens
const verificacion = express.Router();
verificacion.use((req, res, next)=>{
    let token = req.headers['x-access-token'] || req.headers['authorization'];
//     //Si no ingresan TOKENS o es diferente
    if(!token){
        res.status(401).send({
            error: 'Es necesario un token de autenticación'
        })
        return
    }
//     //Borrando los 7 primeros caracteres del token que contienen la palabra "Bearer "
    if (token.startsWith('Bearer ')){
        token = token.slice(7, token.length);
        console.log(token);
    }
    if (token){
//         //Usando el método verify para verificar el token
        jwt.verify(token, app.get('key'), (error, decoded)=>{
            if (error){
                return res.json({
                    message:'El token no es válido'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    }
});

// //Creamos una ruta a la cuál solo se puede acceder con autenticación de credenciales y la verificación del token
app.get('/info', verificacion, (req, res)=>{
    res.json('INFORMACIÓN VALIOSA PRIVADA ENTREGADA');
});