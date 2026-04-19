'use server';

import { getServerSession } from 'next-auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { connectDB } from './db';

async function getModels() {
  await connectDB();
  const Blog = (await import('../models/blog')).default;
  const Comment = (await import('../models/comment')).default;
  const User = (await import('../models/user')).default;
  return { Blog, Comment, User };
}

export async function createBlog(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog } = await getModels();

  await Blog.create({
    author: formData.get('author'),
    title: formData.get('title'),
    image: formData.get('image'),
    text: formData.get('text'),
    createdBy: session.user.username,
  });

  revalidatePath('/blogs');
  redirect('/blogs');
}

export async function updateBlog(id: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog } = await getModels();

  await Blog.findByIdAndUpdate(id, {
    author: formData.get('author'),
    title: formData.get('title'),
    image: formData.get('image'),
    text: formData.get('text'),
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

export async function addComment(blogId: string, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const { Blog, Comment } = await getModels();

  const blog = await Blog.findById(blogId);
  const comment = new Comment({
    user: session.user.username,
    comment: formData.get('comment'),
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
