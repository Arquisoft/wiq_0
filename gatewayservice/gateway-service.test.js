const request = require('supertest');
const axios = require('axios');
const app = require('./gateway-service'); 

afterAll(async () => {
    app.close();
  });

jest.mock('axios');
describe('Gateway Service', () => {
  // Mock responses from external services
  axios.post.mockImplementation((url, data) => {
    if (url.endsWith('/login')) {
      return Promise.resolve({ data: { token: 'mockedToken' } });
    } else if (url.endsWith('/adduser')) {
      return Promise.resolve({ data: { userId: 'mockedUserId' } });
    } else if (url.endsWith('/addRecord')) {
      return Promise.resolve({ data: { recordId: 'mockedRecordId' } });
    } else if (url.endsWith('/addQuestion')) {
      return Promise.resolve({ data: { questionId: 'mockedQuestionId' } });
    } else if (url.endsWith('/createUserRank')) {
      return Promise.resolve({ data: { rankId: 'mockedRankId' } });
    } else if (url.endsWith('/updateRanking')) {
      return Promise.resolve({ data: { updatedRanking: true } });
    } else if (url.endsWith('/addGeneratedQuestion')) {
      return Promise.resolve({ data: { generatedQuestionId: 'mockedGeneratedQuestionId' } });
    }
  });

  axios.get.mockImplementation((url) => {
    if (url.endsWith('/getAllGeneratedQuestions')) {
      return Promise.resolve({ data: { questions: ['question1', 'question2'] } });
    } else if (url.endsWith('/getAllUsers')) {
      return Promise.resolve({ data: { users: ['user1', 'user2'] } });
    } else if (url.endsWith('/getRecords/:userId')) {
      return Promise.resolve({ data: { records: ['record1', 'record2'] } });
    } else if (url.endsWith('/getFullQuestion')) {
      return Promise.resolve({ data: { question: 'mockedQuestion' } });
    } else if (url.endsWith('/actRanking')) {
      return Promise.resolve({ data: { ranking: 'mockedRanking' } });
    } else if (url.endsWith('/obtainRank')) {
      return Promise.resolve({ data: { rank: 'mockedRank' } });
    } else if (url.endsWith('/getRandomQuestionSports')){
      console.error("Si q entro");
      return Promise.resolve({ data: { question: 'mockedQuestion'} });
    } else if (url.endsWith('/getRandomQuestionImportantDates')){
      return Promise.resolve({ data: { question: 'mockedQuestion'} });
    } else if (url.endsWith('/getRandomQuestionMusic')){
      return Promise.resolve({ data: { question: 'mockedQuestion'} });
    } else if (url.endsWith('/getRandomQuestionLiterature')){
      return Promise.resolve({ data: { question: 'mockedQuestion'} });
    } else if (url.endsWith('/getRandomQuestionCountries')){
      return Promise.resolve({ data: { question: 'mockedQuestion'} });
    } else if (url.endsWith('/getAllQuestionGenerator')) {
      return Promise.resolve({ data: { questions: ['question1', 'question2'] } });
    } else if (url.endsWith('/countQuestionGenerator')) {
      return Promise.resolve({ data: { count: 2 } });
    }
  });

  axios.delete.mockImplementation((url) => {
    if (url.endsWith('/deleteFirstQuestionGenerator')) {
      return Promise.resolve({ data: { success: true } });
    }
  });

  // Test /login endpoint
  it('should forward login request to auth service', async () => {
    const mockUsername = 'testuser';
    const mockPassword = 'testpassword';

    const response = await request(app)
      .post('/login')
      .send({ username: mockUsername, password: mockPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBe('mockedToken');
  });

  // Test /adduser endpoint
  it('should forward add user request to user service', async () => {
    const mockUsername = 'newuser';
    const mockPassword = 'newpassword';

    const response = await request(app)
      .post('/adduser')
      .send({ username: mockUsername, password: mockPassword });

    expect(response.statusCode).toBe(200);
    expect(response.body.userId).toBe('mockedUserId');
  });

  // Test /addRecord endpoint
  it('should add a record successfully', async () => {
    const mockRecord = {
      userId: 'testuserid',
      date: new Date(),
      time: 60,
      money: 5000,
      correctQuestions: 8,
      failedQuestions: 2
    };

    const response = await request(app)
      .post('/addRecord')
      .send(mockRecord);

    expect(response.statusCode).toBe(200);
    expect(response.body.recordId).toBe('mockedRecordId');
  });

 // Test /addQuestion endpoint
 it('should add a question successfully', async () => {
  const mockQuestion = {
    questionBody: '¿Cual es la capital de Francia?',
    typeQuestion: 'pais_capital'
  };

  const response = await request(app)
    .post('/addQuestion')
    .send(mockQuestion);

  expect(response.statusCode).toBe(200);
  expect(response.body.questionId).toBe('mockedQuestionId');
});

// Test /createUserRank endpoint
it('should create a user rank in ranking service', async () => {
  const mockUsername = 'testuser';

  const response = await request(app)
    .post('/createUserRank')
    .send({ username: mockUsername });

  expect(response.statusCode).toBe(200);
  expect(response.body.rankId).toBe('mockedRankId');
});

// Test /updateRanking endpoint
it('should update ranking for a user in ranking service', async () => {
  const mockRanking = { username: 'testuser' };

  const response = await request(app)
    .post('/updateRanking')
    .send(mockRanking);

  expect(response.statusCode).toBe(200);
  expect(response.body.updatedRanking).toBe(true);
});

// Test /addGeneratedQuestion endpoint
it('should add a generated question successfully', async () => {
  const mockGeneratedQuestion = {
    generatedQuestionBody: '¿Cual es la capital de Francia?',
    correctAnswer: 'Paris'
  };

  const response = await request(app)
    .post('/addGeneratedQuestion')
    .send(mockGeneratedQuestion);

  expect(response.statusCode).toBe(200);
  expect(response.body.generatedQuestionId).toBe('mockedGeneratedQuestionId');
});

// Test /getAllGeneratedQuestions endpoint
it('should get all generated questions from generated question service', async () => {
  const response = await request(app)
    .get('/getAllGeneratedQuestions');

  expect(response.statusCode).toBe(200);
  expect(response.body.questions).toEqual(['question1', 'question2']);
});

// Test /getRecords/:userId endpoint
it('should get all records for a user from record service', async () => {
  const mockUserId = 'testuserid';
  const mockRecords = [
    { recordId: 'record1', userId: mockUserId, score: 100 },
    { recordId: 'record2', userId: mockUserId, score: 200 },
  ];

  // Mock the axios.get implementation for this test
  axios.get.mockImplementationOnce((url) => {
    if (url.endsWith(`/getRecords/${mockUserId}`)) {
      return Promise.resolve({ data: mockRecords });
    }
  });

  const response = await request(app).get(`/getRecords/${mockUserId}`);

  expect(response.statusCode).toBe(200);
  expect(response.body).toEqual(mockRecords);
});

// Test /getAllUsers endpoint
it('should get all users from user service', async () => {
  const response = await request(app)
    .get('/getAllUsers');

  expect(response.statusCode).toBe(200);
  expect(response.body.users).toEqual(['user1', 'user2']);
});

// Test /getFullQuestion endpoint
it('should get a full question from question service', async () => {
  const response = await request(app)
    .get('/getFullQuestion');

  expect(response.statusCode).toBe(200);
  expect(response.body.question).toBe('mockedQuestion');
});

// Test /actRanking endpoint
it('should get a ranking from ranking service', async () => {
  const response = await request(app)
    .get('/actRanking');

  expect(response.statusCode).toBe(200);
  expect(response.body.ranking).toBe('mockedRanking');
});

// Test /obtainRank endpoint
it('should get a rank from rank service', async () => {
  const response = await request(app)
    .get('/obtainRank');

  expect(response.statusCode).toBe(200);
  expect(response.body.rank).toBe('mockedRank');
});

// Test /getRandomQuestionXXXXXX endpoints (themes)
it('should get a random question from question generator service with theme "sports"', async () => {
  const response = await request(app).get('/getRandomQuestionSports');

  expect(response.statusCode).toBe(200);
  expect(response.body.question).toBe('mockedQuestion');
});
it('should get a random question from question generator service with theme "music"', async () => {
  const response = await request(app)
    .get('/getRandomQuestionMusic');

  expect(response.statusCode).toBe(200);
  expect(response.body.question).toBe('mockedQuestion');
});
it('should get a random question from question generator service with theme "important dates"', async () => {
  const response = await request(app)
    .get('/getRandomQuestionImportantDates');

  expect(response.statusCode).toBe(200);
  expect(response.body.question).toBe('mockedQuestion');
});
it('should get a random question from question generator service with theme "literature"', async () => {
  const response = await request(app)
    .get('/getRandomQuestionLiterature');

  expect(response.statusCode).toBe(200);
  expect(response.body.question).toBe('mockedQuestion');
});
it('should get a random question from question generator service with theme "countries"', async () => {
  const response = await request(app)
    .get('/getRandomQuestionCountries');

  expect(response.statusCode).toBe(200);
  expect(response.body.question).toBe('mockedQuestion');
});

// Test /getAllQuestionGenerator endpoint
it('should get all questions from question generator service', async () => {
  const response = await request(app)
    .get('/getAllQuestionGenerator');

  expect(response.statusCode).toBe(200);
  expect(response.body.questions).toEqual(['question1', 'question2']);
});

// Test /countQuestionGenerator endpoint
it('should count all questions from question generator service', async () => {
  const response = await request(app)
    .get('/countQuestionGenerator');

  expect(response.statusCode).toBe(200);
  expect(response.body.count).toBe(2);
});

// Test /deleteFirstQuestionGenerator endpoint
it('should delete the first question from question generator service', async () => {
  const response = await request(app)
    .delete('/deleteFirstQuestionGenerator');

  expect(response.statusCode).toBe(200);
  expect(response.body.success).toBe(true);
});

});

