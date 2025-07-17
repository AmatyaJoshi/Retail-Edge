"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuthService {
    async createUser(firstName, lastName, email, phone, role = 'USER', clerkId, appwriteId) {
        return prisma.users.create({
            data: {
                firstName,
                lastName,
                email,
                phone,
                role,
                clerkId,
                appwriteId,
                emailVerified: false,
            },
        });
    }
    async findUserByEmail(email) {
        return prisma.users.findUnique({
            where: { email },
        });
    }
}
exports.AuthService = AuthService;
