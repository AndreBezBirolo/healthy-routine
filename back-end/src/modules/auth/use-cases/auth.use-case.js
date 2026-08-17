import bcrypt from 'bcryptjs';
import { prisma } from '../../../shared/prisma/prisma.js';
import { AppError } from '../../../shared/errors/app-error.js';
export class AuthUseCase {
    async register(data) {
        const existing = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (existing) {
            throw new AppError('USER_ALREADY_EXISTS', 409);
        }
        const passwordHash = await bcrypt.hash(data.password, 10);
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                passwordHash,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        return user;
    }
    async login(data) {
        const user = await prisma.user.findUnique({
            where: { email: data.email },
        });
        if (!user) {
            throw new AppError('INVALID_CREDENTIALS', 401);
        }
        const validPassword = await bcrypt.compare(data.password, user.passwordHash);
        if (!validPassword) {
            throw new AppError('INVALID_CREDENTIALS', 401);
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
        };
    }
    async changePassword(userId, currentPass, newPass) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            throw new AppError('USER_NOT_FOUND', 404);
        }
        const isValid = await bcrypt.compare(currentPass, user.passwordHash);
        if (!isValid) {
            throw new AppError('INVALID_CURRENT_PASSWORD', 400);
        }
        const passwordHash = await bcrypt.hash(newPass, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
    }
    async updateProfile(userId, name) {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { name },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        return user;
    }
}
