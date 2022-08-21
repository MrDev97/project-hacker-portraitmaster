const Photo = require('../models/photo.model');
const Voter = require('../models/voter.model');
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
    const voterCheck = await Voter.findOne({ user: req.ip });

    if (!voterCheck) {
      const newVoter = new Voter({
        user: req.ip,
        votes: [photoToUpdate._id],
      });
      await newVoter.save();

      res.send({ message: 'User & Vote Added' });
    } else {
      const voteCheck = await Voter.findOne({
        $and: [{ user: req.ip }, { votes: photoToUpdate._id }],
      });

      if (voteCheck) res.status(409).json({ message: 'Voted already!' });
      else {
        const updatedVoter = await Voter.findOneAndUpdate(
          { _id: voterCheck._id },
          {
            $push: {
              votes: photoToUpdate._id,
            },
          }
        );

        photoToUpdate.votes++;
        await photoToUpdate.save();

        res.send({ message: 'Vote Added to User' });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
