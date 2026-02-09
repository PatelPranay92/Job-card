const express = require('express');
const router = express.Router();
const VehicleModel = require('../models/VehicleModel');

// GET all models
router.get('/', async (req, res) => {
    try {
        const models = await VehicleModel.find().sort({ name: 1 });
        res.json(models);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new model
router.post('/', async (req, res) => {
    const model = new VehicleModel({
        name: req.body.name,
        type: req.body.type
    });

    try {
        const newModel = await model.save();
        res.status(201).json(newModel);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE model
router.delete('/:id', async (req, res) => {
    try {
        await VehicleModel.findByIdAndDelete(req.params.id);
        res.json({ message: 'Model deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
