/**
 * Optimisation des images à l’upload (Sharp)
 * ------------------------------------------
 * Conformément à la demande du client (Green Code),
 * ce module compresse les images envoyées par les utilisateurs
 * afin de réduire leur poids et améliorer la performance.
 * Étapes :
 * - Resize (max width 800px)
 * - Compression JPEG (qualité 80%)
 * - Suppression de l’image originale non optimisée
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const optimizeImage = async (filePath) => {
  const optimizedPath = filePath.replace(/(\.\w+)$/, '_optimized$1');

  await sharp(filePath)
    .resize({ width: 800 }) // ou autre taille si tu veux
    .jpeg({ quality: 80 })
    .toFile(optimizedPath);

  // ESSAYE de supprimer le fichier, mais ignore l’erreur si ça plante
  try {
    fs.unlinkSync(filePath);
  } catch (err) {
    console.warn('⚠️ Impossible de supprimer le fichier original :', err.message);
  }

  return optimizedPath;
};

module.exports = optimizeImage;
