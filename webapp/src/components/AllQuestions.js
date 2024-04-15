import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate} from 'react-router-dom';
import { Container, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper, Snackbar,Button } from '@mui/material';

const AllQuestions = () => {

    const navigate = useNavigate();
    const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || 'http://localhost:8000';


    const [questions, setQuestions] = useState([]);
    const [error, setError] = useState('');



    const showHome = async () => {
        navigate('/PantallaInicio'); 
    }

    const getAllQuestions = useCallback(async () => {
        try {
            const response = await axios.get(`${apiEndpoint}/getAllQuestions`,{});
            setQuestions(response.data);
        } catch (error) {
            setError(error.response.data.error);
        }
    })
    
    useEffect(() => {
        getAllQuestions();
    }, [getAllQuestions]);
    

    return (
        
        <Container component="main" maxWidth="xl"
        sx={{
            backgroundColor: '#F3D3FA',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh', 
            width: '100%', 
        }}>
        <Button variant="contained" color="inherit" style={{ background: 'white', border: 'none', padding: 0, marginRight: '10px', marginLeft: '10px'}} onClick={showHome}>
                <img src={require('./images/home.png')} style={{ width: '50px', height: '50px' }} alt="Imagen home"/>
        </Button>
        <Typography component="h1" variant="h5" align="center" sx={{ marginBottom: 2, fontWeight: 'bold' }}>
            TODAS LAS PREGUNTAS
        </Typography>
        <TableContainer component={Paper} sx={{ maxWidth: '80%', marginBottom: 4 }}>
            <Table>
            <TableHead>
                <TableRow>
                    <TableCell align="center"><strong>Pregunta</strong></TableCell>
                    <TableCell align="center"><strong>Respuesta</strong></TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {questions.map((q) => (
                    <TableRow key={q._id}>
                        <TableCell align="center">{q.enunciado}</TableCell>
                        <TableCell align="center">{q.respuesta_correcta}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
            </Table>
        </TableContainer>
        <div>
            {error && (
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} message={`Error: ${error}`} />
            )}
        </div>
    </Container>
    );
};

export default AllQuestions;