const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const Question = require('./create-model');

const app = express();
const port = 8005;

// Middleware para analizar JSON en el cuerpo de la solicitud
app.use(bodyParser.json());

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://aswuser:aswuser@wiq06b.hsfgpcm.mongodb.net/questiondb?retryWrites=true&w=majority&appName=wiq06b';
mongoose.connect(mongoUri);

// Tipos de preguntas y consultas a Wikidata
const questionTypes = {
  pais: {
    query: `
      SELECT ?country ?countryLabel ?capital ?capitalLabel
      WHERE {
        ?country wdt:P31 wd:Q6256.
        ?country wdt:P36 ?capital.
        SERVICE wikibase:label {
          bd:serviceParam wikibase:language "[AUTO_LANGUAGE],es".
        }
      }
      ORDER BY RAND()
      LIMIT 35
    `,
    questionLabel: 'countryLabel',
    answerLabel: 'capitalLabel'
  },
  // Agregar otros tipos de preguntas aquí
  poblacion: {
    query: `
    SELECT DISTINCT ?city ?cityLabel ?population ?country ?countryLabel ?loc WHERE {
      {
        SELECT (MAX(?population_) AS ?population) ?country WHERE {
          ?city wdt:P31/wdt:P279* wd:Q515 .
          ?city wdt:P1082 ?population_ .
          ?city wdt:P17 ?country .
        }
        GROUP BY ?country
        ORDER BY DESC(?population)
      }
      ?city wdt:P31/wdt:P279* wd:Q515 .
      ?city wdt:P1082 ?population .
      ?city wdt:P17 ?country .
      ?city wdt:P625 ?loc .
      SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en" .
      }
    }
     ORDER BY RAND()
     LIMIT 30`
    ,
    questionLabel: 'cityLabel',
    answerLabel: 'population'
  },
};

// Ruta para agregar una nueva pregunta
app.post('/addQuestion', async (req, res) => {
  try {
    const newQuestion = new Question({
      questionBody: req.body.questionBody,
      typeQuestion: req.body.typeQuestion,
      typeAnswer: req.body.typeAnswer,
    });
    await newQuestion.save();
    res.json(newQuestion);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Nuevo endpoint para obtener una pregunta completa
app.get('/getFullQuestion', async (req, res) => {
  try {
    const rQuestion = await Question.aggregate([{ $sample: { size: 1 } }]);
    const questionType = rQuestion[0].typeQuestion;
    const { query, questionLabel, answerLabel } = questionTypes[questionType];

    const apiUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`;
    const headers = { "Accept": "application/json" };
    const respuestaWikidata = await fetch(apiUrl, { headers });

    if (respuestaWikidata.ok) {
      const data = await respuestaWikidata.json();
      const numEles = data.results.bindings.length;

      const indexCorrecta = Math.floor(Math.random() * numEles);
      const resultCorrecta = data.results.bindings[indexCorrecta];
      const informacionWikidata = resultCorrecta[questionLabel].value + '?';
      const respuestaCorrecta = resultCorrecta[answerLabel].value;

      const respuestasFalsas = [];
      for (let i = 0; i < 3; i++) {
        const indexFalsa = Math.floor(Math.random() * numEles);
        const resultFalsa = data.results.bindings[indexFalsa];
        respuestasFalsas.push(resultFalsa[answerLabel].value);
      }

      const body=rQuestion[0].questionBody+informacionWikidata;

      const fullQuestion = {
        questionBody: body,
        correctAnswer: respuestaCorrecta,
        incorrectAnswers: respuestasFalsas
      };

      res.json(fullQuestion);
    } else {
      res.status(500).json({ error: "Error al realizar la consulta en Wikidata. Estado de respuesta:" + respuestaWikidata.status });
    }
  } catch (error) {
    res.status(500).json({ error: "Error al realizar la consulta en Wikidata" });
  }
});

// Iniciar el servidor
const server = app.listen(port, () => {
  console.log(`Servicio de autenticación escuchando en http://localhost:${port}`);
});

// Manejar el cierre del servidor
server.on('close', () => {
  // Cerrar la conexión de Mongoose
  mongoose.connection.close();
});

module.exports = server;
