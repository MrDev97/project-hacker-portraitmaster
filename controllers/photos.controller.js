const Photo = require('../models/photo.model');
const escapeHTML = require('../utils/escapeHTML');
const validateEmail = require('../utils/validateEmail');

/****** SUBMIT PHOTO ********/

exports.add = async (req, res) => {
  try {
    const { title, author, email } = req.fields;
    const file = req.files.file;

    if (!validateEmail(email)) {
      throw new Error('Wrong input!');
    }

    if (title && author && email && file) {
      // if fields are not empty...

      // Array of allowed files
      const allowedFileTypes = ['png', 'gif', 'jpg'];

      const fileName = file.path.split('/').slice(-1)[0]; // cut only filename from full path, e.g. C:/test/abc.jpg -> abc.jpg
      const fileExt = fileName.split('.').slice(-1)[0]; // Get the extension of the uploaded file

      // Check if the uploaded file is allowed
      if (!allowedFileTypes.includes(fileExt)) {
        throw new Error('Invalid file Type!');
      }

      const newPhoto = new Photo({
        title: escapeHTML(title),
        author: escapeHTML(author),
        email: escapeHTML(email),
        src: fileName,
        votes: 0,
      });
      await newPhoto.save(); // ...save new photo in DB
      res.json(newPhoto);
    } else {
      throw new Error('Wrong input!');
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** LOAD ALL PHOTOS ********/

exports.loadAll = async (req, res) => {
  try {
    res.json(await Photo.find());
  } catch (err) {
    res.status(500).json(err);
  }
};

/****** VOTE FOR PHOTO ********/

exports.vote = async (req, res) => {
  try {
    const photoToUpdate = await Photo.findOne({ _id: req.params.id });
    if (!photoToUpdate) res.status(404).json({ message: 'Not found' });
    else {
      photoToUpdate.votes++;
      photoToUpdate.save();
      res.send({ message: 'OK' });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
