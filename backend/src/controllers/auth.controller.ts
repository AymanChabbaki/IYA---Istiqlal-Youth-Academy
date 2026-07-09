import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { sendEmail, emailTemplates } from '../services/email.service';
import prisma from '../lib/prisma';

export const register = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password, displayName, studyLevel, studyProgram, region, iqlim, city, committeeId } = req.body;

  // Validate input
  if (!email || !password || !displayName) {
    return res.status(400).json({
      success: false,
      error: 'All fields are required'
    });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User already exists'
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      role: 'USER',
      studyLevel: studyLevel || null,
      studyProgram: studyProgram || null,
      region: region || null,
      iqlim: iqlim || null,
      city: city || null,
      committeeId: committeeId || null
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      studyLevel: true,
      studyProgram: true,
      region: true,
      iqlim: true,
      city: true,
      committeeId: true,
      createdAt: true
    }
  });

  // Create tokens
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
      refreshToken
    }
  });
});

export const login = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required'
    });
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Create tokens
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET as string,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET as string,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
  );

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt
    }
  });

  const { passwordHash, resetToken, resetTokenExpiry, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      accessToken,
      refreshToken
    }
  });
});

export const refresh = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };

    // Check if token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired refresh token'
      });
    }

    // Create new access token
    const accessToken = jwt.sign(
      { id: storedToken.user.id, email: storedToken.user.email, role: storedToken.user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' } as jwt.SignOptions
    );

    // Rotate the refresh token: issue a new one and invalidate the old, so a leaked
    // token has a single-use window instead of remaining valid for its full 7-day life.
    const newRefreshToken = jwt.sign(
      { id: storedToken.user.id },
      process.env.JWT_REFRESH_SECRET as string,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 7);

    await prisma.$transaction([
      prisma.refreshToken.delete({ where: { token: refreshToken } }),
      prisma.refreshToken.create({
        data: { token: newRefreshToken, userId: storedToken.user.id, expiresAt: newExpiresAt },
      }),
    ]);

    res.json({
      success: true,
      data: { accessToken, refreshToken: newRefreshToken }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid refresh token'
    });
  }
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export const forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    // Save token BEFORE sending response (critical for serverless/Vercel)
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry }
    });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: '🔐 Reset Your Password – Istiqlal Youth Academy',
        html: emailTemplates.passwordReset(user.displayName, resetUrl),
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't leak the error to client for security, but log it
    }
  }

  // Always return success to prevent user enumeration
  res.json({
    success: true,
    message: 'If an account with that email exists, a reset link has been sent'
  });
});

export const resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      error: 'Token and new password are required'
    });
  }

  // Find user by reset token
  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token'
    });
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password and clear reset token
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null
    }
  });

  // Invalidate every existing session: a stolen refresh token should not survive a password reset
  await prisma.refreshToken.deleteMany({ where: { userId: user.id } });

  res.json({
    success: true,
    message: 'Password reset successfully'
  });
});

export const validateResetToken = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token } = req.query as { token?: string };

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token is required' });
  }

  const user = await prisma.user.findFirst({
    where: {
      resetToken: token,
      resetTokenExpiry: { gt: new Date() }
    },
    select: { id: true, email: true }
  });

  if (!user) {
    return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
  }

  res.json({ success: true, message: 'Token is valid' });
});
