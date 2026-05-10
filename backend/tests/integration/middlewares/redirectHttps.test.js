'use strict';

const request = require('supertest');
const express = require('express');
const redirectHttps = require('../../../src/middlewares/redirectHttps');

describe('INTEGRATION TEST: redirectHttps Middleware', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(redirectHttps);
    app.get('/test', (req, res) => res.status(200).send('OK'));
  });

  // --- TEST 1 : Mode Développement/Test ---
  test('TC-SEC-01 : Ne doit pas rediriger en mode développement', async () => {
    process.env.NODE_ENV = 'development'; // Simulation du mode dev

    const res = await request(app).get('/test');

    // Vérifie que la requête passe sans redirection (Status 200)
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');
  });

  // --- TEST 2 : Production + HTTP (Le cas critique) ---
  test('TC-SEC-02 : Doit rediriger vers HTTPS en mode production si HTTP est utilisé', async () => {
    process.env.NODE_ENV = 'production'; // Simulation du mode production

    const res = await request(app)
      .get('/test')
      .set('host', 'monportfolio.com');

    // Vérifie la redirection permanente (301)
    expect(res.statusCode).toBe(301);
    // Vérifie que l'URL de destination commence par https://
    expect(res.headers.location).toBe('https://monportfolio.com/test');

    // Réinitialisation pour les autres tests
    process.env.NODE_ENV = 'test';
  });

  // --- TEST 3 : Production + Header X-Forwarded-Proto ---
  test('TC-SEC-03 : Doit autoriser la requête si le proxy indique déjà du HTTPS', async () => {
    process.env.NODE_ENV = 'production';

    const res = await request(app)
      .get('/test')
      .set('x-forwarded-proto', 'https'); // Simule un Load Balancer (Render/Heroku)

    // Vérifie que la requête est acceptée directement
    expect(res.statusCode).toBe(200);
    
    process.env.NODE_ENV = 'test';
  });

  // --- TEST 4 : Production + req.secure ---
  test('TC-SEC-04 : Ne doit pas rediriger si la connexion est déjà sécurisée', async () => {
    process.env.NODE_ENV = 'production';

    // On simule une requête sécurisée en modifiant l'objet req via un middleware temporaire
    const secureApp = express();
    secureApp.use((req, res, next) => {
      Object.defineProperty(req, 'secure', { value: true }); // Simulation d'une connexion SSL établie
      next();
    });
    secureApp.use(redirectHttps);
    secureApp.get('/test', (req, res) => res.status(200).send('OK'));

    const res = await request(secureApp).get('/test');

    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('OK');

    process.env.NODE_ENV = 'test';
  });
});