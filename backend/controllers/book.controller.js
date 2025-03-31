// controllers/book.controller.js
const Book = require('../models/Book');
const path = require('path');
const fs = require('fs');
const optimizeImage = require('../utils/optimizeImage');

// Récupérer tous les livres
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Récupérer un livre par ID
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });
    res.status(200).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Créer un livre avec image optimisée
exports.createBook = async (req, res) => {
  try {

    const bookObject = JSON.parse(req.body.book);

    // Optimise l'image reçue avec Sharp
    const optimizedImagePath = await optimizeImage(req.file.path);

    // Génère l'URL de l'image
    const imageUrl = `${req.protocol}://${req.get('host')}/images/${path.basename(optimizedImagePath)}`;

    // Création du livre
    const average =
  bookObject.ratings && bookObject.ratings.length > 0
    ? bookObject.ratings.reduce((acc, r) => acc + r.grade, 0) /
      bookObject.ratings.length
    : 0;

const book = new Book({
  ...bookObject,
  imageUrl,
  averageRating: average,
});


    await book.save();
    res.status(201).json(book);
  } catch (error) {
    console.error('❌ Erreur lors de la création du livre :', error);
    res.status(400).json({ error: error.message });
  }
};

exports.modifyBook = async (req, res) => {
  try {
    const bookId = req.params.id;
    const existingBook = await Book.findById(bookId);
    if (!existingBook) return res.status(404).json({ message: 'Livre non trouvé' });

    // Vérifie que l'utilisateur connecté est le créateur du livre
    if (existingBook.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé à modifier ce livre' });
    }

    let updatedData = req.body;
    let imageUrl = existingBook.imageUrl;

    // Si une nouvelle image est fournie, optimise-la et supprime l’ancienne
    if (req.file) {
      const optimizedPath = await optimizeImage(req.file.path);
      imageUrl = `${req.protocol}://${req.get('host')}/images/${path.basename(optimizedPath)}`;

      // Supprime l'ancienne image (si elle existe)
      const oldFilename = existingBook.imageUrl.split('/images/')[1];
      fs.unlink(`images/${oldFilename}`, (err) => {
        if (err) console.warn('⚠️ Impossible de supprimer l’ancienne image :', err.message);
      });
    }

    const updatedBook = {
      ...JSON.parse(updatedData.book || JSON.stringify(updatedData)),
      imageUrl,
    };

    const result = await Book.findByIdAndUpdate(bookId, updatedBook, { new: true });
    res.status(200).json(result);
  } catch (error) {
    console.error('❌ Erreur modification livre :', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

    // Vérifie que l'utilisateur est bien le créateur du livre
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ message: 'Non autorisé à supprimer ce livre' });
    }

    // Supprime l'image associée
    const filename = book.imageUrl.split('/images/')[1];
    fs.unlink(`images/${filename}`, async (err) => {
      if (err) console.warn('⚠️ Image non supprimée :', err.message);

      await Book.findByIdAndDelete(req.params.id);
      res.status(200).json({ message: 'Livre supprimé avec succès' });
    });
  } catch (error) {
    console.error('❌ Erreur suppression livre :', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.rateBook = async (req, res) => {
  try {
    const { userId, rating } = req.body;
    const book = await Book.findById(req.params.id);

    if (!book) return res.status(404).json({ message: 'Livre non trouvé' });

    // Vérifie si l'utilisateur a déjà noté
    const alreadyRated = book.ratings.find((r) => r.userId === userId);
    if (alreadyRated) {
      return res.status(400).json({ message: 'Vous avez déjà noté ce livre.' });
    }

    // Ajoute la note
    book.ratings.push({ userId, grade: rating });

    // Recalcule la moyenne
    const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = Math.round(total / book.ratings.length);

    await book.save();
    res.status(200).json(book);
  } catch (error) {
    console.error('❌ Erreur notation livre :', error.message);
    res.status(400).json({ error: error.message });
  }
};

exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestBooks = await Book.find()
      .sort({ averageRating: -1 }) // Tri décroissant
      .limit(3); // Prend les 3 meilleurs

    res.status(200).json(bestBooks);
  } catch (error) {
    console.error('❌ Erreur getBestRatedBooks :', error.message);
    res.status(400).json({ error: error.message });
  }
};