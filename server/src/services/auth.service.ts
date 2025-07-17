import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AuthService {
  async createUser(firstName: string, lastName: string | null, email: string, phone: string, role: string = 'USER', clerkId: string, appwriteId: string) {
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

  async findUserByEmail(email: string) {
    return prisma.users.findUnique({
      where: { email },
    });
  }
} 