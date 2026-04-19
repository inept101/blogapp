import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    await connectDB();
    const User = (await import('../../../models/user')).default;

    const user = new (User as any)({ username, email });
    await (User as any).register(user, password);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Registration failed.' }, { status: 400 });
  }
}
