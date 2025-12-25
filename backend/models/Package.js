const db = require('../config/database');

class Package {
    static async getAll() {
        const result = await db.query(
            'SELECT * FROM packages WHERE is_active = true ORDER BY price ASC'
        );
        return result.rows;
    }

    static async getById(id) {
        const result = await db.query(
            'SELECT * FROM packages WHERE id = $1',
            [id]
        );
        return result.rows[0];
    }

    static async create(packageData) {
        const { name, description, ram_mb, cpu_limit, disk_mb, backup_slots, database_limit, price, billing_cycle } = packageData;

        const result = await db.query(
            `INSERT INTO packages (name, description, ram_mb, cpu_limit, disk_mb, backup_slots, database_limit, price, billing_cycle)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [name, description, ram_mb, cpu_limit, disk_mb, backup_slots, database_limit, price, billing_cycle]
        );

        return result.rows[0];
    }

    static async update(id, packageData) {
        const { name, description, ram_mb, cpu_limit, disk_mb, backup_slots, database_limit, price, billing_cycle, is_active } = packageData;

        const result = await db.query(
            `UPDATE packages 
       SET name = $1, description = $2, ram_mb = $3, cpu_limit = $4, disk_mb = $5, 
           backup_slots = $6, database_limit = $7, price = $8, billing_cycle = $9, 
           is_active = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11
       RETURNING *`,
            [name, description, ram_mb, cpu_limit, disk_mb, backup_slots, database_limit, price, billing_cycle, is_active, id]
        );

        return result.rows[0];
    }

    static async delete(id) {
        await db.query('UPDATE packages SET is_active = false WHERE id = $1', [id]);
    }
}

module.exports = Package;
