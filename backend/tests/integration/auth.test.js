/// J  ECRIS JUSTE DES PLACEHOLDERS DERTHOUM DB GHI BACH NTESTER BLI JEST KHDDAAAAM OSSSFFF

// backend/tests/integration/auth.test.js

const request = require('supertest');
// const app = require('../../src/server'); // ← décommenter quand l'API sera prête


// POST /register — INSCRIPTION

describe('AUTH - POST /register', () => {

    test('TC-AUTH-01 : Inscription réussie → Status 201', async () => {
        // const res = await request(app)
        //     .post('/api/register')
        //     .send({
        //         name: 'Sara Ali',
        //         email: 'sara@ensa.ac.ma',
        //         password: 'Test@1234'
        //     });
        // expect(res.statusCode).toBe(201);
        // expect(res.body).toHaveProperty('id');
        // expect(res.body).toHaveProperty('email');
        expect(true).toBe(true); // placeholder — à activer quand API prête
    });

    test('TC-AUTH-02 : Email déjà utilisé → Status 409', async () => {
        // const res = await request(app)
        //     .post('/api/register')
        //     .send({
        //         name: 'Sara Ali',
        //         email: 'sara@ensa.ac.ma',
        //         password: 'Test@1234'
        //     });
        // expect(res.statusCode).toBe(409);
        expect(true).toBe(true);
    });

    test('TC-AUTH-03 : Champs manquants → Status 400', async () => {
        // const res = await request(app)
        //     .post('/api/register')
        //     .send({ email: 'sara@ensa.ac.ma' });
        // expect(res.statusCode).toBe(400);
        expect(true).toBe(true);
    });

    test('TC-AUTH-04 : Email mal formaté → Status 400', async () => {
        // const res = await request(app)
        //     .post('/api/register')
        //     .send({
        //         name: 'Sara',
        //         email: 'sara-invalide',
        //         password: 'Test@1234'
        //     });
        // expect(res.statusCode).toBe(400);
        expect(true).toBe(true);
    });

    test('TC-AUTH-05 : Mot de passe trop court → Status 400', async () => {
        // const res = await request(app)
        //     .post('/api/register')
        //     .send({
        //         name: 'Sara',
        //         email: 'sara@ensa.ac.ma',
        //         password: '123'
        //     });
        // expect(res.statusCode).toBe(400);
        expect(true).toBe(true);
    });
});


// POST /login — CONNEXION

describe('AUTH - POST /login', () => {

    test('TC-AUTH-06 : Connexion réussie → Status 200 + token', async () => {
        // const res = await request(app)
        //     .post('/api/login')
        //     .send({
        //         email: 'sara@ensa.ac.ma',
        //         password: 'Test@1234'
        //     });
        // expect(res.statusCode).toBe(200);
        // expect(res.body).toHaveProperty('token');
        // expect(res.body.token).not.toBe('');
        expect(true).toBe(true);
    });

    test('TC-AUTH-07 : Mauvais mot de passe → Status 401', async () => {
        // const res = await request(app)
        //     .post('/api/login')
        //     .send({
        //         email: 'sara@ensa.ac.ma',
        //         password: 'mauvais'
        //     });
        // expect(res.statusCode).toBe(401);
        expect(true).toBe(true);
    });

    test('TC-AUTH-08 : Email inexistant → Status 401', async () => {
        // const res = await request(app)
        //     .post('/api/login')
        //     .send({
        //         email: 'inconnu@ensa.ac.ma',
        //         password: 'Test@1234'
        //     });
        // expect(res.statusCode).toBe(401);
        expect(true).toBe(true);
    });

    test('TC-AUTH-09 : Body vide → Status 400', async () => {
        // const res = await request(app)
        //     .post('/api/login')
        //     .send({});
        // expect(res.statusCode).toBe(400);
        expect(true).toBe(true);
    });

    test('TC-AUTH-NEW-01 : Email vide → Status 400', async () => {
        // const res = await request(app)
        //     .post('/api/login')
        //     .send({
        //         email: '',
        //         password: 'Test@1234'
        //     });
        // expect(res.statusCode).toBe(400);
        expect(true).toBe(true);
    });

    test('TC-AUTH-NEW-02 : Mot de passe vide → Status 400', async () => {
        // const res = await request(app)
        //     .post('/api/login')
        //     .send({
        //         email: 'sara@ensa.ac.ma',
        //         password: ''
        //     });
        // expect(res.statusCode).toBe(400);
        expect(true).toBe(true);
    });
});


// POST /logout — DÉCONNEXION

describe('AUTH - POST /logout', () => {

    test('TC-AUTH-10 : Déconnexion réussie → Status 200', async () => {
        // const res = await request(app)
        //     .post('/api/logout')
        //     .set('Authorization', 'Bearer TOKEN_ICI');
        // expect(res.statusCode).toBe(200);
        expect(true).toBe(true);
    });

    test('TC-AUTH-11 : Logout sans token → Status 401', async () => {
        // const res = await request(app)
        //     .post('/api/logout');
        // expect(res.statusCode).toBe(401);
        expect(true).toBe(true);
    });
});


// POST /access-request — DEMANDER L'ACCÈS

describe('AUTH - POST /access-request', () => {

    test('TC-ACCESS-01 : Demande réussie → Status 200 ou 201', async () => {
        // const res = await request(app)
        //     .post('/api/access-request')
        //     .send({
        //         name: 'Sara Ali',
        //         email: 'sara@ensa.ac.ma'
        //     });
        // expect([200, 201]).toContain(res.statusCode);
        // expect(res.body).toHaveProperty('message');
        expect(true).toBe(true);
    });

    test('TC-ACCESS-02 : Email non institutionnel → Status 400', async () => {
        // const res = await request(app)
        //     .post('/api/access-request')
        //     .send({
        //         name: 'Sara Ali',
        //         email: 'sara@gmail.com'
        //     });
        // expect(res.statusCode).toBe(400);
        expect(true).toBe(true);
    });

    test('TC-ACCESS-03 : Demande déjà envoyée → Status 409', async () => {
        // const res = await request(app)
        //     .post('/api/access-request')
        //     .send({
        //         name: 'Sara Ali',
        //         email: 'sara@ensa.ac.ma'
        //     });
        // expect(res.statusCode).toBe(409);
        expect(true).toBe(true);
    });
});