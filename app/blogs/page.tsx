import { connectDB } from '@/lib/db';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readTime } from '@/lib/utils';

const PER_PAGE = 9;

async function getBlogs(search: string, tag: string, page: number, username?: string) {
  await connectDB();
  const Blog = (await import('../../models/blog')).default;

  const query: any = { published: { $ne: false } };
  if (tag) query.tags = tag;
  if (search) query.$text = { $search: search };

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
    .skip((page - 1) * PER_PAGE)
    .limit(PER_PAGE)
    .lean();

  return { blogs: JSON.parse(JSON.stringify(blogs)), total };
}

async function getAllTags() {
  await connectDB();
  const Blog = (await import('../../models/blog')).default;
  const result = await Blog.aggregate([
    { $match: { published: { $ne: false } } },
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);
  return result.map((r: any) => r._id);
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; tag?: string; page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const sp = await searchParams;
  const search = sp.search || '';
  const tag = sp.tag || '';
  const page = Math.max(1, parseInt(sp.page || '1'));

  const [{ blogs, total }, allTags] = await Promise.all([
    getBlogs(search, tag, page),
    getAllTags(),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  function buildUrl(overrides: Record<string, any>) {
    const params = new URLSearchParams();
    const merged = { search, tag, page, ...overrides };
    if (merged.search) params.set('search', merged.search);
    if (merged.tag) params.set('tag', merged.tag);
    if (merged.page > 1) params.set('page', String(merged.page));
    const q = params.toString();
    return `/blogs${q ? `?${q}` : ''}`;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">All Posts</h1>
          <p className="text-slate-500 mt-1">{total} {total === 1 ? 'post' : 'posts'}{tag ? ` tagged "${tag}"` : ''}{search ? ` matching "${search}"` : ''}</p>
        </div>
        {session && (
          <Link href="/blogs/new" className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/40">
            + New Post
          </Link>
        )}
      </div>

      {/* Search */}
      <form method="get" action="/blogs" className="mb-6">
        {tag && <input type="hidden" name="tag" value={tag} />}
        <div className="flex gap-2">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search posts..."
            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <button type="submit" className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors">
            Search
          </button>
          {search && (
            <Link href={buildUrl({ search: '', page: 1 })} className="px-5 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 transition-colors">
              Clear
            </Link>
          )}
        </div>
      </form>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={buildUrl({ tag: '', page: 1 })}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              !tag ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400'
            }`}
          >
            All
          </Link>
          {allTags.map((t: string) => (
            <Link
              key={t}
              href={buildUrl({ tag: t, page: 1 })}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                tag === t ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400'
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      )}

      {/* Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-20 text-slate-400 dark:text-slate-500">
          <p className="text-lg">No posts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog: any) => (
            <div
              key={blog._id}
              className="group relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-violet-400 dark:hover:border-violet-500/50 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-100 dark:hover:shadow-violet-900/20"
            >
              {/* overlay link covers the whole card */}
              <Link href={`/blogs/${blog._id}`} className="absolute inset-0 z-0" aria-label={blog.title} />
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
                {blog.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {blog.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-medium">{t}</span>
                    ))}
                  </div>
                )}
                <h2 className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors line-clamp-2 mb-2 text-lg">
                  {blog.title}
                </h2>
                <p className="text-sm text-slate-500 line-clamp-2 flex-1 mb-4">
                  {blog.text?.replace(/<[^>]*>/g, ' ').slice(0, 150)}
                </p>
                <div className="relative z-10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Link href={`/users/${blog.createdBy}`} className="text-slate-400 dark:text-slate-600 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors">
                      {blog.author}
                    </Link>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-400 dark:text-slate-600">{readTime(blog.text || '')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
                    <span>♥ {blog.likes?.length ?? 0}</span>
                    <span className="text-violet-600 dark:text-violet-500 font-medium">Read →</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {page > 1 && (
            <Link href={buildUrl({ page: page - 1 })} className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-500 hover:text-violet-600 transition-all text-sm font-medium">
              ← Prev
            </Link>
          )}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Link
              key={p}
              href={buildUrl({ page: p })}
              className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                p === page
                  ? 'bg-violet-600 text-white'
                  : 'border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-500 hover:text-violet-600'
              }`}
            >
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={buildUrl({ page: page + 1 })} className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-500 hover:text-violet-600 transition-all text-sm font-medium">
              Next →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
