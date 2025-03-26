// app.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch((err) => console.error('Connexion à MongoDB échouée !', err));

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour servir les images statiques
app.use('/images', express.static(path.join(__dirname, 'images')));

// Middleware CORS (autoriser le front à accéder à l’API)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  next();
});

// Routes ici (on les ajoutera plus tard)
// app.use('/api/books', booksRoutes);
// app.use('/api/auth', userRoutes);

const bookRoutes = require('./routes/book.routes');
app.use('/api/books', bookRoutes);


module.exports = app;


const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
