import Link from 'next/link';
import { connectDB } from '@/lib/db';

async function getRecentBlogs() {
  try {
    await connectDB();
    const Blog = (await import('../models/blog')).default;
    const blogs = await Blog.find({}).sort({ _id: -1 }).limit(3).lean();
    return JSON.parse(JSON.stringify(blogs));
  } catch {
    return [];
  }
}

export default async function LandingPage() {
  const blogs = await getRecentBlogs();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-violet-50 to-slate-50 dark:from-slate-950 dark:via-violet-950/30 dark:to-slate-950 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-400/10 dark:bg-violet-600/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-300 dark:border-violet-500/30 bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 text-xs font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 dark:bg-violet-400 animate-pulse" />
            Open to all writers
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Write. Share.<br />Connect.
          </h1>

          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10">
            A minimal, distraction-free platform to publish your ideas and read stories from writers around the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/blogs"
              className="px-8 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/50"
            >
              Explore Posts
            </Link>
            <Link
              href="/register"
              className="px-8 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-violet-500 text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-white font-semibold transition-all"
            >
              Start Writing
            </Link>
          </div>
        </div>
      </section>

      {/* Recent posts */}
      {blogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Recent Posts</h2>
            <Link href="/blogs" className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {blogs.map((blog: any) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog._id}`}
                className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-violet-400 dark:hover:border-violet-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 dark:hover:shadow-violet-900/20"
              >
                {blog.image && (
                  <div className="h-44 overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-2 mb-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-500 line-clamp-2 mb-3">{blog.text}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-600 font-medium">{blog.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
