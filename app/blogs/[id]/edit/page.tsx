import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { updateBlog } from '@/lib/actions';
import BlogForm from '@/components/BlogForm';

async function getBlog(id: string) {
  await connectDB();
  const Blog = (await import('../../../../models/blog')).default;
  const blog = await Blog.findById(id).lean();
  if (!blog) return null;
  return JSON.parse(JSON.stringify(blog));
}

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [blog, session] = await Promise.all([getBlog(id), getServerSession(authOptions)]);

  if (!blog) notFound();
  if (!session) redirect('/login');

  const canEdit = session.user.username === 'admin' || session.user.username === blog.createdBy;
  if (!canEdit) redirect(`/blogs/${id}`);

  const updateBlogAction = updateBlog.bind(null, blog._id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Edit Post</h1>
        <p className="text-slate-500 mt-1">Update your post</p>
      </div>
      <BlogForm
        action={updateBlogAction}
        initial={{
          author: blog.author,
          title: blog.title,
          image: blog.image,
          text: blog.text,
          tags: blog.tags,
          published: blog.published,
        }}
        submitLabel="Save Changes"
        cancelHref={`/blogs/${blog._id}`}
      />
    </div>
  );
}
