const {validationResults} = require('express-validator');
const capsule = require('../models/capsule');

//Get all Capsules for Logged-in User
exports.getAllCapsules = async(req, res) => {
   try {
      const capsules = await capsule.find({userID: req.user._id});
      res.json(capsules);
   } catch (err) {
      res.status(500).json ({message: 'Error Retrieving Capsules'});
   }
};

//Get a Capsule by ID for Logged-in User
exports.getCapsuleByID = async (req, res) => {
   try{
      const capsule = await capsule.findById(req.params.id);
      if (!capsule) return res.status(404).json ({message: 'Capsule not Found'});

      const isOwner = capsule.userId.equals(req.user._id);
      const isRevealed = new Date() >= capsule.revealDate;

      if (!isOwner && !isRevealed) {
         return res.status(403).json({ message: 'Capsule is still locked' });
      }

      res.json(capsule);
   } catch (err) {
      res.status(500).json({ message: 'Error fetching capsule' });
   }
};