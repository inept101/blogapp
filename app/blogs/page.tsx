import { connectDB } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getBlogs() {
  await connectDB();
  const Blog = (await import('../../models/blog')).default;
  const blogs = await Blog.find({}).sort({ _id: -1 }).lean();
  return JSON.parse(JSON.stringify(blogs));
}

export default async function BlogsPage() {
  const [blogs, session] = await Promise.all([getBlogs(), getServerSession(authOptions)]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Posts</h1>
          <p className="text-slate-500 dark:text-slate-500 mt-1">{blogs.length} {blogs.length === 1 ? 'post' : 'posts'} published</p>
        </div>
        {session && (
          <Link
            href="/blogs/new"
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/40"
          >
            + New Post
          </Link>
        )}
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <p className="text-lg">No posts yet.</p>
          {session && (
            <Link href="/blogs/new" className="mt-4 inline-block text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">
              Be the first to write one →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: any) => (
            <Link
              key={blog._id}
              href={`/blogs/${blog._id}`}
              className="group flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-violet-400 dark:hover:border-violet-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 dark:hover:shadow-violet-900/20"
            >
              {blog.image ? (
                <div className="h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-violet-100 to-slate-100 dark:from-violet-900/30 dark:to-slate-800 flex items-center justify-center">
                  <span className="text-4xl opacity-30">✍</span>
                </div>
              )}

              <div className="flex flex-col flex-1 p-5">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-2 mb-2 text-lg">
                  {blog.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-3 flex-1 mb-4">{blog.text}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-600 font-medium">{blog.author}</span>
                  <span className="text-violet-600 dark:text-violet-500 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors font-medium">Read →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
