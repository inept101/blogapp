import { connectDB } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { readTime } from '@/lib/utils';

async function getUserBlogs(username: string) {
  await connectDB();
  const Blog = (await import('../../../models/blog')).default;
  const blogs = await Blog.find({ createdBy: username, published: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(blogs));
}

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: rawUsername } = await params;
  const username = decodeURIComponent(rawUsername);
  const blogs = await getUserBlogs(username);

  if (blogs.length === 0) {
    // Check if user exists via any blog (published or not) — still show profile
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="flex items-center gap-6 mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
        <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-800/40 border-2 border-violet-200 dark:border-violet-700 flex items-center justify-center text-3xl font-bold text-violet-600 dark:text-violet-300">
          {username[0]?.toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{username}</h1>
          <p className="text-slate-500 mt-1">{blogs.length} {blogs.length === 1 ? 'post' : 'posts'} published</p>
        </div>
      </div>

      {/* Posts */}
      {blogs.length === 0 ? (
        <p className="text-center text-slate-400 dark:text-slate-500 py-16">No posts yet.</p>
      ) : (
        <div className="space-y-6">
          {blogs.map((blog: any) => (
            <Link
              key={blog._id}
              href={`/blogs/${blog._id}`}
              className="group flex gap-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-violet-900/20"
            >
              {blog.image && (
                <div className="flex-shrink-0 w-28 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                {blog.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {blog.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-medium">{t}</span>
                    ))}
                  </div>
                )}
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-1 text-lg mb-1">
                  {blog.title}
                </h2>
                <p className="text-sm text-slate-500 line-clamp-2 mb-2">
                  {blog.text?.replace(/<[^>]*>/g, ' ').slice(0, 150)}
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-600">
                  <span>{readTime(blog.text || '')}</span>
                  <span>·</span>
                  <span>♥ {blog.likes?.length ?? 0}</span>
                  <span>·</span>
                  <span>💬 {blog.comments?.length ?? 0}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
