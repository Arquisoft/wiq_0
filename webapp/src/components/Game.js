import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, Paper} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';

import './Game.css';

const colorPreguntas= 'rgba(51, 139, 173, 0.764)';
const colorOnMousePreguntas= 'rgba(28, 84, 106, 0.764)';

const Game = () => {
  const navigate = useNavigate();
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';

  const [questionObject, setQuestionObject] = useState('');
  const [correctOption, setCorrectOption] = useState('');
  const [answerOptions, setAnswerOptions] = useState([]);
  const [correctCounter, setCorrectCounter] = useState(0);

  const [questionCounter, setQuestionCounter] = useState(0);
  const [incorrectCounter, setIncorrectCounter] = useState(0);
  
  const [numberOfQuestions, setNumberOfQuestions] = useState(10);
  const [questionsToAnswer, setQuestionsToAnswer] = useState(10);
  const [isFinished, setFinished] = useState(false);
  const [percentage, setPercentage] = useState(0);

  // Temporizador
  const [seconds, setSeconds] = useState(120); // 2 minutes



  useEffect(() => {
    handleShowQuestion();
  }, []);

  useEffect(() => {
    console.log("eyou");
    const intervalId = setInterval(() => {
      setSeconds(prevSeconds => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  
  useEffect(() => {
    if (isGameFinished() && !isFinished){
      finishGame();
      setFinished(true)
;    }
  }, [correctCounter]);
  
  // This method will call the create question service
  const  handleShowQuestion = async () => {
    try{
      // It makes a petition to the api and store the response
      const response = await axios.post(`${apiEndpoint}/createquestion`, { });
      // Extract all the info of the response and store it
      setQuestionObject(response.data.responseQuestionObject);
      setCorrectOption(response.data.responseCorrectOption);
      setAnswerOptions(response.data.responseAnswerOptions);
      const buttons = document.querySelectorAll('button[title="btnsPreg"]');
      buttons.forEach(button => {
        button.name = "sinContestar";
        button.disabled = false;
        button.style.backgroundColor = colorPreguntas;
        button.onmouse = colorOnMousePreguntas;
      });

      // FIN DE LA PARTIDA
      if (isGameFinished() && !isFinished){
        finishGame();
        setFinished(true);
      }


      incrementQuestion();


    }catch (error){
      console.error('Error:', error);
    }    
  }

  // Method that checks if the answer clicked is the correct one
  const handleAnswerClick = (option, index) => {
    if(option === correctOption) {
      const buttonId = `button_${index}`;
      const correctButton = document.getElementById(buttonId);
      if (correctButton) {
        correctButton.style.backgroundColor = "rgba(79, 141, 18, 0.726)";
        incrementCorrect();
      }
    }else{
      const buttonId = `button_${index}`;
      const incorrectButton = document.getElementById(buttonId);
      incorrectButton.style.backgroundColor = "rgba(208, 22, 22, 0.952)";
      incrementIncorrect();
    }

    const buttons = document.querySelectorAll('button[title="btnsPreg"]');
    buttons.forEach(button => {
      button.disabled = true;
      button.onmouse = null;
    });
    

    decrementQuestionsToAnswer();


    if (!isFinished){
      // Cambiar a la siguiente pregunta después de 3 segundos
      setTimeout(() => {
        handleShowQuestion();
      }, 1500);
    }

  }

  const isGameFinished = () => {
    return questionCounter >= numberOfQuestions;
  }
  const handleMainPage = () => {
    let path= '/mainPage';
    navigate(path);
};

const getQuestions = () => {
  
  const questionsList = [
    { 
      question: '¿Cuál es la capital de Francia?',
      correctAnswer: 'París',
      userAnswer: 'París'
    },
    {
      question: '¿Cuál es el río más largo del mundo?',
      correctAnswer: 'El río Amazonas',
      userAnswer: 'Hola'
    },
   
  ];

  return questionsList;
};


  const finishGame = () => {
    const buttons = document.querySelectorAll('button[title="btnsPreg"]');
    buttons.forEach(button => {
      button.disabled = true;
      button.onmouse = null;
    });
    console.log("finishGame " + correctCounter);
    var correctas = (correctCounter / numberOfQuestions) * 100;
    console.log("corr1 " + correctas);
    if (!Number.isInteger(percentage)){
      correctas = correctas.toFixed(2);
      console.log("dentro " + correctas);
    }
    console.log("corr2 " + correctas);
    setPercentage(correctas);
    const username=localStorage.getItem('username');
    const newGame = {
      username: username, 
      duration: seconds, 
      questions: getQuestions() ,
      percentage: correctas,
     totalQuestions: numberOfQuestions,
      correctAnswers: correctCounter,
      incorrectAnswers: numberOfQuestions-correctCounter
    };
    console.log("Se va a guardar la siguiente partida:");
    console.log("Username:", newGame.username);
    console.log("Duración:", newGame.duration);
    console.log("Preguntas:", newGame.questions);
    console.log("Porcentaje de Aciertos:", newGame.percentage);
    console.log("Número Total de Preguntas:", newGame.totalQuestions);
    console.log("Número de Respuestas Correctas:", newGame.correctAnswers);
    console.log("Número de Respuestas Incorrectas:", newGame.incorrectAnswers);
    
  
  
    axios.post(`${apiEndpoint}/addgame`, newGame)
  .then(response => {
    console.log("Respuesta del servidor:", response.data);
  })
  .catch(error => {
    console.error("Error al enviar la solicitud:", error);
  });
  }
 
  const incrementCorrect = () => {
    setCorrectCounter(correct => correct + 1);
  };

  const incrementIncorrect = () => {
    setIncorrectCounter(incorrect => incorrect + 1);
  }

  const decrementQuestionsToAnswer = () => {
    setQuestionsToAnswer(toAnswer => toAnswer - 1);
  }

  const incrementQuestion = () => {
    setQuestionCounter(qc => qc + 1);
  }

  return (
    <Container maxWidth="md" style={{ marginTop: '2rem' }}>

      {!isFinished && (
      <Paper elevation={3} style={{ padding: '2rem', textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Saber y Ganar Juego
        </Typography>
        <Typography variant="body1" paragraph>
          Pregunta {questionCounter}: {questionObject}
        </Typography>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', marginTop: '2em' }}>
          {answerOptions.map((option, index) => (
            <Button  id={`button_${index}`} title="btnsPreg" key={index} variant="contained" color="primary" onClick={() => handleAnswerClick(option,index)} >
              {option}
            </Button>
          ))}
        </div>
      </Paper>
     )}

      {!isFinished && (
      <Button title="contador" onMouseEnter={null} variant="contained" color="primary" disabled={true}>
        Preguntas restantes: {questionsToAnswer}
      </Button>
      )}
      {!isFinished && (
      <Button title="contador" onMouseEnter={null} variant="contained" color="primary" disabled={true}>
        Correctas: {correctCounter}
      </Button>
      )}
      {!isFinished && (
      <Button title="contador" onMouseEnter={null} variant="contained" color="primary" disabled={true}>
        Incorrectas: {incorrectCounter}
      </Button>
      )}
       {!isFinished && (
      <div>
        <svg data-testid="TimerIcon"></svg>

        <div>
          <span>Time Remaining: {Math.floor(seconds / 60)}:{(seconds % 60).toLocaleString('en-US', { minimumIntegerDigits: 2 })}</span>
        </div>
      </div>
      )}

      

      {isFinished && (
        <div>
        <Paper elevation={3} style={{ padding: '2rem', textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Partida finalizada. ¡Gracias por jugar!
          </Typography>
          <div>
            <Button title='puntuacion' onMouseEnter={null} variant="contained" color="primary" disabled={true}>
              Puntuación: {percentage} % 
            </Button>
            <Button variant="contained" color="primary" onClick={handleMainPage}>
             Ir a la página principal
          </Button>
          </div>
        </Paper>
        </div>
      )}


      {/* <Button title="sigPreg" variant="contained" color="primary" onClick={handleShowQuestion}>
        Siguiente pregunta
      </Button> */}


    </Container>
  );
};

export default Game;