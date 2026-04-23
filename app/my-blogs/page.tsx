import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { readTime } from '@/lib/utils';
import { deleteBlog } from '@/lib/actions';

async function getMyBlogs(username: string) {
  await connectDB();
  const Blog = (await import('../../models/blog')).default;
  const blogs = await Blog.find({ createdBy: username }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(blogs));
}

export default async function MyBlogsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/login');

  const blogs = await getMyBlogs(session.user.username);
  const published = blogs.filter((b: any) => b.published);
  const drafts = blogs.filter((b: any) => !b.published);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">My Posts</h1>
          <p className="text-slate-500 mt-1">
            {published.length} published · {drafts.length} draft{drafts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/blogs/new"
          className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/40"
        >
          + New Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <p className="text-lg mb-4">You haven't written anything yet.</p>
          <Link href="/blogs/new" className="text-violet-600 dark:text-violet-400 hover:underline">
            Write your first post →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog: any) => (
            <div
              key={blog._id}
              className="flex items-start gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              {/* Thumbnail */}
              {blog.image ? (
                <div className="flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-24 h-16 rounded-xl bg-gradient-to-br from-violet-100 to-slate-100 dark:from-violet-900/30 dark:to-slate-800 flex items-center justify-center text-2xl opacity-40">
                  ✍
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/blogs/${blog._id}`}
                        className="font-semibold text-slate-900 dark:text-slate-100 hover:text-violet-600 dark:hover:text-violet-400 transition-colors line-clamp-1"
                      >
                        {blog.title}
                      </Link>
                      {!blog.published && (
                        <span className="flex-shrink-0 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium">
                          Draft
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-600">
                      <span>{readTime(blog.text || '')}</span>
                      <span>·</span>
                      <span>♥ {blog.likes?.length ?? 0}</span>
                      <span>·</span>
                      <span>💬 {blog.comments?.length ?? 0}</span>
                      {blog.tags?.length > 0 && (
                        <>
                          <span>·</span>
                          <span>{blog.tags.slice(0, 2).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    <Link
                      href={`/blogs/${blog._id}/edit`}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-500 hover:text-violet-600 dark:hover:text-white text-xs font-medium transition-all"
                    >
                      Edit
                    </Link>
                    <form action={deleteBlog.bind(null, blog._id)}>
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/40 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-all"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
