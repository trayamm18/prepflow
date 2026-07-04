import { Request, Response } from 'express';
import { PrismaClient, ProblemDifficulty, SubmissionStatus } from '@prisma/client';
import { AuthenticatedRequest } from '../types';

const prisma = new PrismaClient();

// Helper to check if dates are the same calendar day (in local time)
function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

// Helper to check if d2 is exactly one day after d1
function isNextDay(d1: Date, d2: Date): boolean {
  const t1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate()).getTime();
  const t2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate()).getTime();
  const diffTime = t2 - t1;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
}

export async function getProblems(req: Request, res: Response) {
  try {
    const { q, difficulty, category, isStriver, topic, company } = req.query;

    const whereClause: any = {};

    if (q) {
      whereClause.OR = [
        { title: { contains: String(q), mode: 'insensitive' } },
        { problemStatement: { contains: String(q), mode: 'insensitive' } }
      ];
    }

    if (difficulty) {
      whereClause.difficulty = String(difficulty).toUpperCase() as ProblemDifficulty;
    }

    if (category) {
      whereClause.category = String(category);
    }

    if (isStriver !== undefined) {
      whereClause.isStriverSheet = String(isStriver) === 'true';
    }

    if (topic) {
      whereClause.topics = {
        some: {
          name: { equals: String(topic), mode: 'insensitive' }
        }
      };
    }

    if (company) {
      whereClause.companies = {
        some: {
          name: { equals: String(company), mode: 'insensitive' }
        }
      };
    }

    const problems = await prisma.problem.findMany({
      where: whereClause,
      include: {
        topics: true,
        companies: true
      },
      orderBy: { title: 'asc' }
    });

    // If user is logged in, attach solved progress
    const authHeader = req.headers['authorization'];
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = require('jsonwebtoken').verify(
          token,
          process.env.JWT_SECRET || 'prepflow_super_access_secret_key_2026'
        );
        userId = decoded.id;
      } catch (e) {
        // Token invalid or user guest
      }
    }

    if (userId) {
      const userProgress = await prisma.problemProgress.findMany({
        where: { userId }
      });

      const solvedMap = new Map(userProgress.map(p => [p.problemId, p.solved]));
      const decoratedProblems = problems.map(prob => ({
        ...prob,
        solved: solvedMap.get(prob.id) || false
      }));

      return res.json({ problems: decoratedProblems });
    }

    return res.json({
      problems: problems.map(prob => ({ ...prob, solved: false }))
    });
  } catch (error: any) {
    console.error('Get problems error:', error);
    return res.status(500).json({ error: 'Failed to retrieve problems' });
  }
}

export async function getProblemBySlug(req: Request, res: Response) {
  try {
    const slug = String(req.params.slug);

    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        topics: true,
        companies: true
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Check progress if authorized
    const authHeader = req.headers['authorization'];
    let userId: string | null = null;
    let solved = false;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = require('jsonwebtoken').verify(
          token,
          process.env.JWT_SECRET || 'prepflow_super_access_secret_key_2026'
        );
        userId = decoded.id;
      } catch (e) {
        // Auth failed, treat as guest
      }
    }

    if (userId) {
      const progress = await prisma.problemProgress.findUnique({
        where: {
          userId_problemId: {
            userId,
            problemId: problem.id
          }
        }
      });
      solved = progress?.solved || false;
    }

    return res.json({ problem, solved });
  } catch (error: any) {
    console.error('Get problem details error:', error);
    return res.status(500).json({ error: 'Failed to retrieve problem details' });
  }
}

export async function submitProblemSolution(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const slug = String(req.params.slug);
    const { code, language, timeTakenSeconds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const problem = await prisma.problem.findUnique({
      where: { slug }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // In V1, code execution is simulated.
    // We assume the student wrote a working solution and mark it as SOLVED.
    const status: SubmissionStatus = SubmissionStatus.SOLVED;

    // Create Submission record
    const submission = await prisma.submission.create({
      data: {
        userId,
        problemId: problem.id,
        code,
        language,
        status,
        timeTakenSeconds: Number(timeTakenSeconds) || 0
      }
    });

    // Check if problem was already solved previously to prevent double-counting solved count
    const existingProgress = await prisma.problemProgress.findUnique({
      where: {
        userId_problemId: {
          userId,
          problemId: problem.id
        }
      }
    });

    const isNewlySolved = !existingProgress || !existingProgress.solved;

    // Update problem progress
    const progress = await prisma.problemProgress.upsert({
      where: {
        userId_problemId: {
          userId,
          problemId: problem.id
        }
      },
      update: {
        solved: true,
        solvedAt: new Date()
      },
      create: {
        userId,
        problemId: problem.id,
        solved: true,
        solvedAt: new Date()
      }
    });

    // Fetch user to update streaks & counts
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (user) {
      const now = new Date();
      let newCurrentStreak = user.currentStreak;
      let newLongestStreak = user.longestStreak;
      const lastActivity = user.lastActivity;

      if (!lastActivity) {
        newCurrentStreak = 1;
      } else {
        const lastDate = new Date(lastActivity);
        if (isSameDay(lastDate, now)) {
          // Already practiced today, streak stays the same
        } else if (isNextDay(lastDate, now)) {
          // Practiced yesterday, increment streak
          newCurrentStreak += 1;
        } else {
          // Gap in practice, reset streak to 1
          newCurrentStreak = 1;
        }
      }

      if (newCurrentStreak > newLongestStreak) {
        newLongestStreak = newCurrentStreak;
      }

      // Increment difficulty statistics if newly solved
      let addEasy = 0;
      let addMedium = 0;
      let addHard = 0;

      if (isNewlySolved) {
        if (problem.difficulty === 'EASY') addEasy = 1;
        if (problem.difficulty === 'MEDIUM') addMedium = 1;
        if (problem.difficulty === 'HARD') addHard = 1;
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          currentStreak: newCurrentStreak,
          longestStreak: newLongestStreak,
          lastActivity: now,
          solvedEasy: { increment: addEasy },
          solvedMedium: { increment: addMedium },
          solvedHard: { increment: addHard }
        }
      });
    }

    return res.status(201).json({
      message: 'Submission recorded successfully',
      submission,
      solved: true,
      newlySolved: isNewlySolved
    });
  } catch (error: any) {
    console.error('Submit solution error:', error);
    return res.status(500).json({ error: 'Failed to record submission' });
  }
}

export async function getStriverProgress(req: Request, res: Response) {
  try {
    const authHeader = req.headers['authorization'];
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = require('jsonwebtoken').verify(
          token,
          process.env.JWT_SECRET || 'prepflow_super_access_secret_key_2026'
        );
        userId = decoded.id;
      } catch (e) {
        // Invalid token
      }
    }

    // Get all striver sheet problems
    const striverProblems = await prisma.problem.findMany({
      where: { isStriverSheet: true },
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        striverStep: true,
        striverTopic: true
      }
    });

    let solvedProblemIds = new Set<string>();
    if (userId) {
      const progressList = await prisma.problemProgress.findMany({
        where: { userId, solved: true },
        select: { problemId: true }
      });
      solvedProblemIds = new Set(progressList.map(p => p.problemId));
    }

    // Group problems by Step -> Topic
    const progressMap: any = {};

    striverProblems.forEach(prob => {
      const step = prob.striverStep || 'Other';
      const topic = prob.striverTopic || 'General';

      if (!progressMap[step]) {
        progressMap[step] = {
          stepName: step,
          topics: {}
        };
      }

      if (!progressMap[step].topics[topic]) {
        progressMap[step].topics[topic] = {
          topicName: topic,
          problems: []
        };
      }

      progressMap[step].topics[topic].problems.push({
        id: prob.id,
        title: prob.title,
        slug: prob.slug,
        difficulty: prob.difficulty,
        solved: solvedProblemIds.has(prob.id)
      });
    });

    // Format progress map into nested array structure
    const result = Object.values(progressMap).map((stepVal: any) => {
      return {
        stepName: stepVal.stepName,
        topics: Object.values(stepVal.topics).map((topicVal: any) => {
          return {
            topicName: topicVal.topicName,
            problems: topicVal.problems
          };
        })
      };
    });

    return res.json({ striverSheet: result });
  } catch (error: any) {
    console.error('Striver progress error:', error);
    return res.status(500).json({ error: 'Failed to retrieve Striver roadmap data' });
  }
}
