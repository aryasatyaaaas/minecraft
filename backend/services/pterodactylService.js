const axios = require('axios');

class PterodactylService {
    constructor() {
        this.baseURL = process.env.PTERODACTYL_URL;
        this.apiKey = process.env.PTERODACTYL_API_KEY;
        this.nodeId = parseInt(process.env.PTERODACTYL_NODE_ID);
        this.nestId = parseInt(process.env.PTERODACTYL_NEST_ID);
        this.eggId = parseInt(process.env.PTERODACTYL_EGG_ID);

        this.client = axios.create({
            baseURL: `${this.baseURL}/api/application`,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    }

    async createServer(serverData) {
        try {
            const { name, userId, ram, cpu, disk } = serverData;

            const payload = {
                name: name,
                user: userId,
                egg: this.eggId,
                docker_image: 'ghcr.io/pterodactyl/yolks:java_17',
                startup: 'java -Xms128M -Xmx{{SERVER_MEMORY}}M -jar {{SERVER_JARFILE}}',
                environment: {
                    SERVER_JARFILE: 'server.jar',
                    VANILLA_VERSION: 'latest',
                },
                limits: {
                    memory: ram,
                    swap: 0,
                    disk: disk,
                    io: 500,
                    cpu: cpu,
                },
                feature_limits: {
                    databases: 1,
                    backups: 2,
                    allocations: 1,
                },
                allocation: {
                    default: null,
                },
            };

            const response = await this.client.post('/servers', payload);
            return response.data.attributes;
        } catch (error) {
            console.error('Pterodactyl create server error:', error.response?.data || error.message);
            throw new Error('Failed to create server in Pterodactyl');
        }
    }

    async getServer(serverId) {
        try {
            const response = await this.client.get(`/servers/${serverId}`);
            return response.data.attributes;
        } catch (error) {
            console.error('Pterodactyl get server error:', error.response?.data || error.message);
            throw new Error('Failed to get server from Pterodactyl');
        }
    }

    async updateServerResources(serverId, resources) {
        try {
            const { ram, cpu, disk } = resources;

            const payload = {
                limits: {
                    memory: ram,
                    swap: 0,
                    disk: disk,
                    io: 500,
                    cpu: cpu,
                },
            };

            const response = await this.client.patch(`/servers/${serverId}/build`, payload);
            return response.data.attributes;
        } catch (error) {
            console.error('Pterodactyl update server error:', error.response?.data || error.message);
            throw new Error('Failed to update server resources');
        }
    }

    async suspendServer(serverId) {
        try {
            await this.client.post(`/servers/${serverId}/suspend`);
            return true;
        } catch (error) {
            console.error('Pterodactyl suspend server error:', error.response?.data || error.message);
            throw new Error('Failed to suspend server');
        }
    }

    async unsuspendServer(serverId) {
        try {
            await this.client.post(`/servers/${serverId}/unsuspend`);
            return true;
        } catch (error) {
            console.error('Pterodactyl unsuspend server error:', error.response?.data || error.message);
            throw new Error('Failed to unsuspend server');
        }
    }

    async deleteServer(serverId) {
        try {
            await this.client.delete(`/servers/${serverId}`);
            return true;
        } catch (error) {
            console.error('Pterodactyl delete server error:', error.response?.data || error.message);
            throw new Error('Failed to delete server');
        }
    }

    async getServerResourceUsage(serverId) {
        try {
            const clientAPI = axios.create({
                baseURL: `${this.baseURL}/api/client`,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            const response = await clientAPI.get(`/servers/${serverId}/resources`);
            return response.data.attributes;
        } catch (error) {
            console.error('Pterodactyl get resources error:', error.response?.data || error.message);
            return null;
        }
    }

    async createUser(email, username, firstName, lastName) {
        try {
            const payload = {
                email,
                username,
                first_name: firstName,
                last_name: lastName,
            };

            const response = await this.client.post('/users', payload);
            return response.data.attributes;
        } catch (error) {
            if (error.response?.status === 422) {
                const existingUser = await this.getUserByEmail(email);
                if (existingUser) {
                    return existingUser;
                }
            }
            console.error('Pterodactyl create user error:', error.response?.data || error.message);
            throw new Error('Failed to create user in Pterodactyl');
        }
    }

    async getUserByEmail(email) {
        try {
            const response = await this.client.get(`/users?filter[email]=${email}`);
            if (response.data.data.length > 0) {
                return response.data.data[0].attributes;
            }
            return null;
        } catch (error) {
            console.error('Pterodactyl get user error:', error.response?.data || error.message);
            return null;
        }
    }
}

module.exports = new PterodactylService();
