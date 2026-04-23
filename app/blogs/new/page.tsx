import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { createBlog } from '@/lib/actions';
import BlogForm from '@/components/BlogForm';

export default async function NewBlogPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">New Post</h1>
        <p className="text-slate-500 mt-1">Share something with the world</p>
      </div>
      <BlogForm action={createBlog} submitLabel="Publish Post" cancelHref="/blogs" />
    </div>
  );
}
