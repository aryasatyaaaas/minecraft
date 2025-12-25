const Package = require('../models/Package');
const Joi = require('joi');

const packageSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().allow(''),
    ram_mb: Joi.number().integer().min(512).required(),
    cpu_limit: Joi.number().integer().min(50).max(400).required(),
    disk_mb: Joi.number().integer().min(1024).required(),
    backup_slots: Joi.number().integer().min(0).default(0),
    database_limit: Joi.number().integer().min(0).default(0),
    price: Joi.number().min(0).required(),
    billing_cycle: Joi.string().valid('monthly', 'quarterly', 'yearly').default('monthly'),
    is_active: Joi.boolean().default(true),
});

exports.getAllPackages = async (req, res) => {
    try {
        const packages = await Package.getAll();
        res.json({ packages });
    } catch (error) {
        console.error('Get packages error:', error);
        res.status(500).json({ error: 'Failed to fetch packages' });
    }
};

exports.getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const package = await Package.getById(id);

        if (!package) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json({ package });
    } catch (error) {
        console.error('Get package error:', error);
        res.status(500).json({ error: 'Failed to fetch package' });
    }
};

exports.createPackage = async (req, res) => {
    try {
        const { error, value } = packageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const package = await Package.create(value);
        res.status(201).json({ message: 'Package created successfully', package });
    } catch (error) {
        console.error('Create package error:', error);
        res.status(500).json({ error: 'Failed to create package' });
    }
};

exports.updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = packageSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const package = await Package.update(id, value);

        if (!package) {
            return res.status(404).json({ error: 'Package not found' });
        }

        res.json({ message: 'Package updated successfully', package });
    } catch (error) {
        console.error('Update package error:', error);
        res.status(500).json({ error: 'Failed to update package' });
    }
};

exports.deletePackage = async (req, res) => {
    try {
        const { id } = req.params;
        await Package.delete(id);
        res.json({ message: 'Package deleted successfully' });
    } catch (error) {
        console.error('Delete package error:', error);
        res.status(500).json({ error: 'Failed to delete package' });
    }
};
