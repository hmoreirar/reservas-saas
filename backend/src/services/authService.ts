import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/env.js';
import { userRepository } from '../repositories/userRepository.js';
import { ConflictError, UnauthorizedError } from '../errors/AppError.js';
import { User, JwtPayload } from '../types/index.js';

export const authService = {
  async register(
    name: string,
    email: string,
    password: string
  ): Promise<Omit<User, 'password'>> {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('Email ya registrado');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    return await userRepository.create(name, email, hashedPassword);
  },

  async login(
    email: string,
    password: string
  ): Promise<{ token: string; user: Omit<User, 'password'> }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciales invalidas');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Credenciales invalidas');
    }

    const token = jwt.sign(
      { id: user.id, email: user.email } satisfies JwtPayload,
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword };
  },

  async me(userId: number): Promise<Omit<User, 'password'> | undefined> {
    return userRepository.findById(userId);
  },
};
