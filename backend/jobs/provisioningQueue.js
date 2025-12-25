const Queue = require('bull');
const db = require('../config/database');
const pterodactylService = require('../services/pterodactylService');

const provisioningQueue = new Queue('server-provisioning', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    },
});

provisioningQueue.process(async (job) => {
    const { orderId, userId } = job.data;

    console.log(`[Provisioning] Starting provisioning for order ${orderId}`);

    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');

        const orderResult = await client.query(
            `SELECT o.*, p.ram_mb, p.cpu_limit, p.disk_mb, p.name as package_name, u.email, u.full_name
       FROM orders o
       JOIN packages p ON o.package_id = p.id
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
            [orderId]
        );

        if (orderResult.rows.length === 0) {
            throw new Error('Order not found');
        }

        const order = orderResult.rows[0];

        const existingServer = await client.query(
            'SELECT * FROM servers WHERE order_id = $1',
            [orderId]
        );

        if (existingServer.rows.length > 0) {
            console.log(`[Provisioning] Server already exists for order ${orderId}`);
            await client.query('COMMIT');
            return { success: true, message: 'Server already provisioned' };
        }

        const nameParts = order.full_name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || firstName;
        const username = order.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

        let pterodactylServerId = null;
        let serverIdentifier = null;

        // Check if Pterodactyl integration is enabled
        const enablePterodactyl = process.env.ENABLE_PTERODACTYL === 'true';

        if (enablePterodactyl) {
            // Production mode: Use actual Pterodactyl
            let pterodactylUser = await pterodactylService.getUserByEmail(order.email);

            if (!pterodactylUser) {
                pterodactylUser = await pterodactylService.createUser(
                    order.email,
                    username,
                    firstName,
                    lastName
                );
            }

            const serverData = {
                name: order.server_name,
                userId: pterodactylUser.id,
                ram: order.ram_mb,
                cpu: order.cpu_limit,
                disk: order.disk_mb,
            };

            const pterodactylServer = await pterodactylService.createServer(serverData);
            pterodactylServerId = pterodactylServer.id;
            serverIdentifier = pterodactylServer.identifier;
        } else {
            // Development mode: Create mock server
            console.log('[DEV MODE] Creating mock server without Pterodactyl');
            pterodactylServerId = Math.floor(Math.random() * 10000);
            serverIdentifier = `mock-${username}-${Date.now()}`;
        }

        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);

        await client.query(
            `INSERT INTO servers (user_id, order_id, package_id, pterodactyl_server_id, server_name, server_identifier, status, ip_address, port, ram_mb, cpu_limit, disk_mb, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'active', $7, $8, $9, $10, $11, $12)`,
            [
                userId,
                orderId,
                order.package_id,
                pterodactylServerId,
                order.server_name,
                serverIdentifier,
                enablePterodactyl ? null : '127.0.0.1', // Mock IP for dev mode
                enablePterodactyl ? null : 25565, // Mock port for dev mode
                order.ram_mb,
                order.cpu_limit,
                order.disk_mb,
                expiresAt,
            ]
        );

        await client.query(
            `UPDATE orders SET status = 'completed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [orderId]
        );

        await client.query('COMMIT');

        console.log(`✓ [Provisioning] Server created successfully for order ${orderId}`);
        console.log(`  - Pterodactyl Server ID: ${pterodactylServer.id}`);
        console.log(`  - Server Identifier: ${pterodactylServer.identifier}`);

        return {
            success: true,
            serverId: pterodactylServer.id,
            serverIdentifier: pterodactylServer.identifier,
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error(`✗ [Provisioning] Failed for order ${orderId}:`, error.message);

        await db.query(
            `UPDATE orders SET status = 'failed', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
            [orderId]
        );

        throw error;
    } finally {
        client.release();
    }
});

provisioningQueue.on('completed', (job, result) => {
    console.log(`[Queue] Job ${job.id} completed:`, result);
});

provisioningQueue.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job.id} failed:`, err.message);
});

module.exports = { provisioningQueue };
