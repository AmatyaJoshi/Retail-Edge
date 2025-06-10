import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class AuthService {
  async createUser(name: string, email: string, password: string, role: string = 'USER') {
    const hashedPassword = await bcrypt.hash(password, 12);
    
    return prisma.persona.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
    });
  }

  async findUserByEmail(email: string) {
    return prisma.persona.findUnique({
      where: { email },
    });
  }

  async validateUser(email: string, password: string) {
    const user = await this.findUserByEmail(email);
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;

    return user;
  }
} 