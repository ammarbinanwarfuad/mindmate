import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/mongodb';
import User from '@/lib/db/models/User';
import { registerSchema } from '@/lib/utils/validation';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);

    await connectDB();

    // Check if user exists
    const existingUser = await User.findOne({ 
      email: validatedData.email.toLowerCase() 
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Hash password with salt
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    // Create user
    const user = await User.create({
      email: validatedData.email.toLowerCase(),
      passwordHash,
      profile: {
        name: validatedData.name,
        university: validatedData.university || '',
        year: validatedData.year || 1,
        anonymous: false
      },
      preferences: {
        notifications: true,
        publicProfile: false,
        shareData: true
      },
      privacy: {
        dataCollection: {
          allowAnalytics: false,
          allowResearch: false,
          allowPersonalization: true
        },
        visibility: {
          profilePublic: false,
          showInMatching: true,
          allowMessages: 'matches'
        }
      },
      consent: {
        termsAccepted: validatedData.termsAccepted,
        termsVersion: '1.0',
        privacyAccepted: validatedData.privacyAccepted,
        ageConfirmed: validatedData.ageConfirmed,
        consentDate: new Date()
      }
    });

    // Return success without sensitive data
    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.profile.name
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}