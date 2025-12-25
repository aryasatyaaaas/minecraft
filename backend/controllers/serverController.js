const db = require('../config/database');
const pterodactylService = require('../services/pterodactylService');

exports.getUserServers = async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await db.query(
            `SELECT s.*, p.name as package_name
       FROM servers s
       JOIN packages p ON s.package_id = p.id
       WHERE s.user_id = $1
       ORDER BY s.created_at DESC`,
            [userId]
        );

        res.json({ servers: result.rows });
    } catch (error) {
        console.error('Get servers error:', error);
        res.status(500).json({ error: 'Failed to fetch servers' });
    }
};

exports.getServerById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            `SELECT s.*, p.name as package_name
       FROM servers s
       JOIN packages p ON s.package_id = p.id
       WHERE s.id = $1 AND s.user_id = $2`,
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Server not found' });
        }

        const server = result.rows[0];

        if (server.pterodactyl_server_id) {
            try {
                const pterodactylData = await pterodactylService.getServer(server.pterodactyl_server_id);
                server.pterodactyl_data = pterodactylData;

                const resourceUsage = await pterodactylService.getServerResourceUsage(server.server_identifier);
                if (resourceUsage) {
                    server.resource_usage = resourceUsage;
                }
            } catch (error) {
                console.error('Failed to fetch Pterodactyl data:', error.message);
            }
        }

        res.json({ server });
    } catch (error) {
        console.error('Get server error:', error);
        res.status(500).json({ error: 'Failed to fetch server' });
    }
};

exports.getServerStats = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'SELECT * FROM servers WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Server not found' });
        }

        const server = result.rows[0];

        if (!server.server_identifier) {
            return res.status(400).json({ error: 'Server not fully provisioned' });
        }

        const resourceUsage = await pterodactylService.getServerResourceUsage(server.server_identifier);

        res.json({ stats: resourceUsage });
    } catch (error) {
        console.error('Get server stats error:', error);
        res.status(500).json({ error: 'Failed to fetch server statistics' });
    }
};

exports.generateSSOToken = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const result = await db.query(
            'SELECT * FROM servers WHERE id = $1 AND user_id = $2',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Server not found' });
        }

        const server = result.rows[0];

        if (!server.server_identifier) {
            return res.status(400).json({ error: 'Server not fully provisioned' });
        }

        const panelUrl = `${process.env.PTERODACTYL_URL}/server/${server.server_identifier}`;

        res.json({
            panel_url: panelUrl,
            server_identifier: server.server_identifier,
        });
    } catch (error) {
        console.error('Generate SSO token error:', error);
        res.status(500).json({ error: 'Failed to generate SSO token' });
    }
};
