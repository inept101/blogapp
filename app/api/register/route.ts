import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    await connectDB();
    const User = (await import('../../../models/user')).default;

    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const user = new (User as any)({
      username,
      email,
      verificationToken: token,
      verificationTokenExpiry: expiry,
    });
    await (User as any).register(user, password);

    await sendVerificationEmail(email, username, token);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Registration failed.' }, { status: 400 });
  }
}
