import { Request, Response } from 'express';
import { PrismaClient, MCQDifficulty } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

export async function getMockQuestions(req: Request, res: Response) {
  try {
    const { category, difficulty, limit } = req.query;

    const whereClause: any = {};
    if (category) {
      whereClause.category = String(category);
    }
    if (difficulty) {
      whereClause.difficulty = String(difficulty).toUpperCase() as MCQDifficulty;
    }

    const questions = await prisma.mCQQuestion.findMany({
      where: whereClause
    });

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions found for the given criteria' });
    }

    // Shuffle questions in memory
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const count = Number(limit) || 10;
    const selected = shuffled.slice(0, count);

    return res.json({ questions: selected });
  } catch (error: any) {
    console.error('Get mock questions error:', error);
    return res.status(500).json({ error: 'Failed to retrieve mock quiz questions' });
  }
}

export async function submitMockAttempt(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { category, difficulty, score, totalQuestions, timeTakenSeconds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!category || !difficulty || score === undefined || !totalQuestions || timeTakenSeconds === undefined) {
      return res.status(400).json({ error: 'All fields (category, difficulty, score, totalQuestions, timeTakenSeconds) are required' });
    }

    const mockAttempt = await prisma.mockAttempt.create({
      data: {
        userId,
        category,
        difficulty: String(difficulty).toUpperCase() as MCQDifficulty,
        score: Number(score),
        totalQuestions: Number(totalQuestions),
        timeTakenSeconds: Number(timeTakenSeconds)
      }
    });

    return res.status(201).json({
      message: 'Mock attempt score recorded successfully',
      mockAttempt
    });
  } catch (error: any) {
    console.error('Submit mock attempt error:', error);
    return res.status(500).json({ error: 'Failed to record mock quiz attempt' });
  }
}

export async function getMockHistory(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const history = await prisma.mockAttempt.findMany({
      where: { userId },
      orderBy: { attemptedAt: 'desc' }
    });

    return res.json({ history });
  } catch (error: any) {
    console.error('Get mock history error:', error);
    return res.status(500).json({ error: 'Failed to retrieve mock quiz history' });
  }
}
