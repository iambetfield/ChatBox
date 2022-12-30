import express from "express";
import * as dotenv from "dotenv";
import cors from 'cors';
import { Configuration, OpenAIApi } from "openai";


dotenv.config(); // llama a .env

const configuration = new Configuration({ //nueva configuracion
  apiKey: process.env.OPENAI_API_KEY, //llave api
});

const openai = new OpenAIApi(configuration); //instanciamos open ai

//iniciamos express app

const app = express(); //lo llamamos como funcion
app.use(cors()); //permite cross origin requests
app.use(express.json()); //permite pasar json del front al back
//creamos la ruta asincrona GET
app.get('/', async (req, resp) =>{
    resp.status(200).send({
        message: 'Por ahora estamos bien', // devuelve un json
    })
});

// creamos el POST -diferencia con el GET? con el get no podemos recibir un monton de datos con el front
//con el POST nos permite tener un cuerpo, un body, un "payload"
app.post('/', async(req,resp) =>{
    try {
        const prompt = req.body.prompt; 

        const response = await openai.createCompletion({ //es una funcion que acepta un objeto
            model: "text-davinci-003",
            prompt: `${prompt}`,
            temperature: 0, //riesgos que quiere tomar
            max_tokens: 3000, // largo de respuestas
            top_p: 1,
            frequency_penalty: 0.5, //no va a repetir sentencias seguido
            presence_penalty: 0,
        });

        resp.status(200).send({
            bot: response.data.choices[0].text
        })
    } catch (error) {
        console.log(error);
        resp.status(500).send(error);
    }
})
const url = "https://chatbox-jdw3.onrender.com"
//asegurar que el servidor este siempre escuchando los requests
app.listen(5000, ()=> console.log('Server is running on port https://chatbox-jdw3.onrender.com'));

//npm run server en la terminal

