import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'prepflow_super_access_secret_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'prepflow_super_refresh_secret_key_2026';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export async function register(req: Request, res: Response) {
  try {
    const { username, name, email, password } = req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({ error: 'All fields (username, name, email, password) are required' });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username or Email is already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user and settings in a transaction
    const user = await prisma.user.create({
      data: {
        username: cleanUsername,
        name,
        email: cleanEmail,
        passwordHash,
        settings: {
          create: {
            darkMode: true,
            preferredLanguage: 'Java'
          }
        }
      }
    });

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    const refreshTokenString = jwt.sign(
      { id: user.id, role: 'user' },
      JWT_REFRESH_SECRET,
      { expiresIn: `${REFRESH_TOKEN_EXPIRY_DAYS}d` }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    // Save refresh token to db
    await prisma.refreshToken.create({
      data: {
        token: refreshTokenString,
        userId: user.id,
        expiresAt
      }
    });

    // Set refresh token cookie
    res.cookie('refreshToken', refreshTokenString, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt
    });

    return res.json({
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        solvedEasy: user.solvedEasy,
        solvedMedium: user.solvedMedium,
        solvedHard: user.solvedHard
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const refreshTokenString = req.cookies?.refreshToken;

    if (!refreshTokenString) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Find token in db
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: refreshTokenString },
      include: { user: true }
    });

    if (!dbToken || dbToken.expiresAt < new Date()) {
      // Clean up token if expired
      if (dbToken) {
        await prisma.refreshToken.delete({ where: { id: dbToken.id } });
      }
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    // Verify token structure
    try {
      jwt.verify(refreshTokenString, JWT_REFRESH_SECRET);
    } catch (err) {
      await prisma.refreshToken.delete({ where: { id: dbToken.id } });
      return res.status(403).json({ error: 'Invalid refresh token structure' });
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: dbToken.user.id, username: dbToken.user.username, email: dbToken.user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );

    return res.json({ accessToken });
  } catch (error: any) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'Internal server error during token refresh' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const refreshTokenString = req.cookies?.refreshToken;

    if (refreshTokenString) {
      // Delete from db
      await prisma.refreshToken.deleteMany({
        where: { token: refreshTokenString }
      });
    }

    // Clear cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    return res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error during logout' });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        createdAt: true,
        currentStreak: true,
        longestStreak: true,
        lastActivity: true,
        solvedEasy: true,
        solvedMedium: true,
        solvedHard: true,
        progress: {
          where: { solved: true },
          select: { solvedAt: true }
        },
        settings: {
          select: {
            darkMode: true,
            preferredLanguage: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error: any) {
    console.error('Get profile error:', error);
    return res.status(500).json({ error: 'Internal server error retrieving user profile' });
  }
}
