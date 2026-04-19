import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { updateBlog } from '@/lib/actions';

async function getBlog(id: string) {
  await connectDB();
  const Blog = (await import('../../../../models/blog')).default;
  const blog = await Blog.findById(id).lean();
  if (!blog) return null;
  return JSON.parse(JSON.stringify(blog));
}

export default async function EditBlogPage({ params }: { params: { id: string } }) {
  const [blog, session] = await Promise.all([getBlog(params.id), getServerSession(authOptions)]);

  if (!blog) notFound();
  if (!session) redirect('/login');

  const canEdit = session.user.username === 'admin' || session.user.username === blog.createdBy;
  if (!canEdit) redirect(`/blogs/${params.id}`);

  const updateBlogAction = updateBlog.bind(null, blog._id);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Edit Post</h1>
        <p className="text-slate-500 mt-1">Update your post</p>
      </div>

      <form action={updateBlogAction} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Author name</label>
          <input
            type="text"
            name="author"
            defaultValue={blog.author}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
          <input
            type="text"
            name="title"
            defaultValue={blog.title}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Cover image URL <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="url"
            name="image"
            defaultValue={blog.image ?? ''}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
          <textarea
            name="text"
            rows={10}
            defaultValue={blog.text}
            required
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-y"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/40"
          >
            Save Changes
          </button>
          <a
            href={`/blogs/${blog._id}`}
            className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 font-medium transition-colors"
          >
            Cancel
          </a>
        </div>
      </form>
    </div>
  );
}
