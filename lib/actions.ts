'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { connectDB } from './db';
import { sendVerificationEmail, sendWelcomeEmail } from './email';
import crypto from 'crypto';

async function getModels() {
  await connectDB();
  const Blog = (await import('../models/blog')).default;
  const Comment = (await import('../models/comment')).default;
  const User = (await import('../models/user')).default;
  return { Blog, Comment, User };
}

// ── Blog CRUD ────────────────────────────────────────────────

export async function createBlog(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog } = await getModels();
  const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean);

  await Blog.create({
    author: formData.get('author'),
    title: formData.get('title'),
    image: formData.get('image'),
    text: formData.get('content'),
    tags,
    published: formData.get('published') !== 'false',
    createdBy: session.user.username,
  });

  revalidatePath('/blogs');
  redirect('/blogs');
}

export async function updateBlog(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog } = await getModels();
  const tags = (formData.get('tags') as string || '').split(',').map(t => t.trim()).filter(Boolean);

  await Blog.findByIdAndUpdate(id, {
    author: formData.get('author'),
    title: formData.get('title'),
    image: formData.get('image'),
    text: formData.get('content'),
    tags,
    published: formData.get('published') !== 'false',
  });

  revalidatePath(`/blogs/${id}`);
  redirect(`/blogs/${id}`);
}

export async function deleteBlog(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog } = await getModels();
  await Blog.findByIdAndDelete(id);

  revalidatePath('/blogs');
  redirect('/blogs');
}

// ── Likes ────────────────────────────────────────────────────

export async function toggleLike(blogId: string) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog } = await getModels();
  const blog = await Blog.findById(blogId);
  const username = session.user.username;
  const hasLiked = (blog.likes ?? []).includes(username);

  await Blog.findByIdAndUpdate(blogId, hasLiked
    ? { $pull: { likes: username } }
    : { $push: { likes: username } }
  );

  revalidatePath(`/blogs/${blogId}`);
}

// ── Comments ─────────────────────────────────────────────────

export async function addComment(blogId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog, Comment } = await getModels();
  const blog = await Blog.findById(blogId);
  const parentId = formData.get('parentId') || null;

  const comment = new Comment({
    user: session.user.username,
    comment: formData.get('comment'),
    parentId: parentId || null,
  });

  blog.comments.push(comment);
  await comment.save();
  await blog.save();

  revalidatePath(`/blogs/${blogId}`);
}

export async function deleteComment(blogId: string, commentId: string) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog, Comment } = await getModels();
  await Blog.findOneAndUpdate({ _id: blogId }, { $pull: { comments: commentId } });
  await Comment.findByIdAndDelete(commentId);

  revalidatePath(`/blogs/${blogId}`);
}

// ── Auth ─────────────────────────────────────────────────────

export async function registerUser(_prevState: any, formData: FormData) {
  const { User } = await getModels();

  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const user = new (User as any)({ username, email });
    await (User as any).register(user, password);
  } catch (e: any) {
    return { error: e.message || 'Registration failed' };
  }

  redirect('/login');
}

export async function resendVerification() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { User } = await getModels();
  const user = await (User as any).findOne({ username: session.user.username });
  if (!user) return { error: 'User not found.' };
  if (user.emailVerified) return { error: 'Email is already verified.' };

  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.verificationToken = token;
  user.verificationTokenExpiry = expiry;
  await user.save();

  await sendVerificationEmail(user.email, user.username, token);
  return { success: 'Verification email sent.' };
}

export async function changePassword(_prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { User } = await getModels();
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  const user = await (User as any).findOne({ username: session.user.username });
  if (!user) return { error: 'User not found.' };

  return new Promise<{ error?: string; success?: string }>((resolve) => {
    (User as any).authenticate()(session.user.username, currentPassword, async (err: any, validUser: any) => {
      if (err || !validUser) {
        resolve({ error: 'Current password is incorrect.' });
        return;
      }
      await user.setPassword(newPassword);
      await user.save();
      resolve({ success: 'Password updated successfully.' });
    });
  });
}
