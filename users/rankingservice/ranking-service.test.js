const UserRank = require('./ranking-model');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./ranking-service');
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

// Función para eliminar todos los documentos de la colección UserRank después de cada prueba
afterEach(async () => {
  await UserRank.deleteMany({});
});

describe('User Service', () => {
  // Prueba para el endpoint POST /createUserRank
  describe('POST /createUserRank', () => {
    it('should create new user ranks', async () => {
      const newUser = { username: 'testuser1' };
      const newUser2 = { username: 'testuser2' };
      const newUser3 = { username: 'testuser3' };
      const newUser4 = { username: 'testuser4' };
      const users = [newUser, newUser2, newUser3, newUser4];
  
      // Realizar una solicitud POST para crear nuevos rankings de usuarios
      const response = await request(app)
        .post('/createUserRank') // Cambio en el endpoint
        .send({ usernames: users.map(user => user.username) });
  
      // Verificar el código de estado de la respuesta
      expect(response.status).toBe(200);
  
      // Verificar si se crearon correctamente los nuevos rankings de usuario en la base de datos
      for (const user of users) {
        const createdUserRank = await UserRank.findOne({ username: user.username });
        expect(createdUserRank).toBeTruthy();
        expect(createdUserRank.username).toBe(user.username);
      }
    });
  });

  // Prueba para el endpoint POST /updateRanking
  describe('POST /updateRanking', () => {
    it('should update an existing user rank', async () => {
      // Crear un ranking de usuario existente en la base de datos
      const existingUserRank = new UserRank({
        username: 'existinguser',
        porcentajeAciertos: 50,
        preguntasCorrectas: 20,
        preguntasFalladas: 10,
        numPartidas: 5
      });
      await existingUserRank.save();

      // Datos para la supdateRanking updates a user rankinglicitud POST de actualización del ranking de usuario
      const updateData = {
        username: 'existinguser',
        preguntasCorrectas: 5,
        preguntasFalladas: 2,
        numPartidas: 1
      };

      // Realizar una solicitud POST para actualizar el ranking de usuario
      const response = await request(app)
        .post('/updateRanking')
        .send(updateData);

      // Verificar el código de estado de la respuesta
      expect(response.status).toBe(200);

      // Verificar si se actualizó correctamente el ranking de usuario en la base de datos
      const updatedUserRank = await UserRank.findOne({ username: updateData.username });
      expect(updatedUserRank).toBeTruthy();
      expect(updatedUserRank.preguntasCorrectas).toBe(existingUserRank.preguntasCorrectas + updateData.preguntasCorrectas);
      expect(updatedUserRank.preguntasFalladas).toBe(existingUserRank.preguntasFalladas + updateData.preguntasFalladas);
      expect(updatedUserRank.numPartidas).toBe(existingUserRank.numPartidas + updateData.numPartidas);
    });
  });

  // Prueba para el endpoint GET /obtainRank
  describe('GET /obtainRank', () => {
    it('should get all user ranks', async () => {
      // Crear varios rankings de usuarios en la base de datos
      await UserRank.create([
        { username: 'user1', porcentajeAciertos: 60, preguntasCorrectas: 30, preguntasFalladas: 20, numPartidas: 10 },
        { username: 'user2', porcentajeAciertos: 70, preguntasCorrectas: 40, preguntasFalladas: 15, numPartidas: 8 }
      ]);

      // Realizar una solicitud GET para obtener todos los rankings de usuarios
      const response = await request(app).get('/obtainRank');

      // Verificar el código de estado de la respuesta
      expect(response.status).toBe(200);

      // Verificar si se obtuvieron correctamente todos los rankings de usuarios
      expect(response.body.length).toBe(2); // Se espera que haya 2 rankings de usuarios
    });
  });

  describe('User Service (Negative Tests)', () => {
    // Prueba negativa para el endpoint POST /createUserRank
    describe('POST /createUserRank (Negative Test)', () => {
      it('should return 400 if username is missing', async () => {
        // Realizar una solicitud POST sin proporcionar el nombre de usuario
        const response = await request(app)
          .post('/createUserRank')
          .send({});
  
        // Verificar el código de estado de la respuesta
        expect(response.status).toBe(400);
        // Verificar si el cuerpo de la respuesta contiene un mensaje de error
        expect(response.body.error).toBeTruthy();
      });
    });
  
    // Prueba negativa para el endpoint POST /updateRanking
    describe('POST /updateRanking (Negative Test)', () => {
      it('should return 400 if username is missing', async () => {
        // Realizar una solicitud POST sin proporcionar el nombre de usuario
        const response = await request(app)
          .post('/updateRanking')
          .send({});
  
        // Verificar el código de estado de la respuesta
        expect(response.status).toBe(400);
        // Verificar si el cuerpo de la respuesta contiene un mensaje de error
        expect(response.body.error).toBeTruthy();
      });
  
      it('should return 400 if user does not exist', async () => {
        // Datos para la solicitud POST de actualización del ranking de usuario
        const updateData = {
          username: 'nonexistentuser',
          preguntasCorrectas: 5,
          preguntasFalladas: 2,
          numPartidas: 1
        };
  
        // Realizar una solicitud POST para actualizar el ranking de un usuario inexistente
        const response = await request(app)
          .post('/updateRanking')
          .send(updateData);
  
        // Verificar el código de estado de la respuesta
        expect(response.status).toBe(400);
        // Verificar si el cuerpo de la respuesta contiene un mensaje de error
        expect(response.body.error).toBeTruthy();
      });
    });
  
  });

test('POST /createUserRank creates or resets a user ranking', async () => {
  const username = 'testUser';

  const response = await request(app)
    .post('/createUserRank')
    .send({ usernames: [username] });

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Rankings de usuarios creados o actualizados correctamente.');

  const userRank = await UserRank.findOne({ username });
  expect(userRank.preguntasCorrectas).toBe(0);
  expect(userRank.preguntasFalladas).toBe(0);
  expect(userRank.numPartidas).toBe(0);
});

test('GET /obtainRank gets all user rankings', async () => {
  const response = await request(app).get('/obtainRank');

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body)).toBe(true);
});

it('should reset an existing user rank', async () => {
  // Arrange
  const username = 'testUser';
  const initialUserRank = new UserRank({
    username,
    porcentajeAciertos: 50,
    preguntasCorrectas: 10,
    preguntasFalladas: 10,
    numPartidas: 1
  });
  await initialUserRank.save();

  // Act
  await request(app)
    .post('/createUserRank')
    .send({ usernames: [username] })
    .expect(200);

  // Assert
  const updatedUserRank = await UserRank.findOne({ username });
  expect(updatedUserRank.porcentajeAciertos).toBe(0);
  expect(updatedUserRank.preguntasCorrectas).toBe(0);
  expect(updatedUserRank.preguntasFalladas).toBe(0);
  expect(updatedUserRank.numPartidas).toBe(0);
});

it('should return 400 if user does not exist', async () => {
  // Arrange
  const username = 'testUser';
  const initialUserRank = new UserRank({
    username,
    porcentajeAciertos: 50,
    preguntasCorrectas: 10,
    preguntasFalladas: 10,
    numPartidas: 1
  });
  await initialUserRank.save();

  // Act
  await request(app)
    .post('/updateAllRanking')
    .send({ usernames: ['anotherUser'] }) // username not included
    .expect(400); // Expect 400 status code

  // Assert
  const deletedUserRank = await UserRank.findOne({ username });
  expect(deletedUserRank).not.toBeNull(); // Expect the user rank to still exist
});

it('should update the ranking of each user in the provided list', async () => {
  // Arrange
  const rankingData = [
    {
      username: 'testUser1',
      preguntasCorrectas: 5,
      preguntasFalladas: 5,
      numPartidas: 1
    },
    {
      username: 'testUser2',
      preguntasCorrectas: 10,
      preguntasFalladas: 0,
      numPartidas: 1
    }
  ];

  // Act
  await request(app)
    .post('/updateRanking')
    .send(rankingData)
    .expect(200);

  // Assert
  for (const userData of rankingData) {
    const updatedUserRank = await UserRank.findOne({ username: userData.username });
    expect(updatedUserRank.preguntasCorrectas).toBe(userData.preguntasCorrectas);
    expect(updatedUserRank.preguntasFalladas).toBe(userData.preguntasFalladas);
    expect(updatedUserRank.numPartidas).toBe(userData.numPartidas);

    const totalPreguntas = updatedUserRank.preguntasCorrectas + updatedUserRank.preguntasFalladas;
    const porcentajeAciertos = (updatedUserRank.preguntasCorrectas / totalPreguntas) * 100;
    expect(updatedUserRank.porcentajeAciertos).toBe(porcentajeAciertos.toFixed(2));
  }
});
});
