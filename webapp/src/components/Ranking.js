import React from 'react';
import { Star, StarBorder, StarHalf } from '@mui/icons-material';
import { Container} from '@mui/material';
import '../App.css';

const Ranking = () => {

  const { usernameGlobal } = useUser();
  const [ranking, setRanking] = useState('');
  const [error, setError] = useState('');

  const getRanking = useCallback(async () => {

  try {
    const response = await axios.get(`${apiEndpoint}/topUsers`);
    console.log(response);
    setRanking(response.data);
  } catch (error) {
    setError(error.response.data.error);
  }
  }, [usernameGlobal])

  useEffect(() => {
    getRanking();
  }, [getRanking]);

  return (
    <Container component="main" maxWidth="xl"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', 
        width: '100%', 
      }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', width: '300px' }}>
          <div className="podium-item" style={{ backgroundColor: 'gold' }}>
            <Star fontSize="large" style={{ fontSize: '24px', fontWeight: 'bold' }} />
          </div>
          <div className="podium-item" style={{ backgroundColor: 'silver' }}>
            <StarBorder fontSize="large" style={{ fontSize: '24px', fontWeight: 'bold' }} />
          </div>
          <div className="podium-item" style={{ backgroundColor: '#cd7f32' }}>
            <StarHalf fontSize="large" style={{ fontSize: '24px', fontWeight: 'bold' }} />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default Ranking;