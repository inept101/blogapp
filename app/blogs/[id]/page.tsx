import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { deleteBlog } from '@/lib/actions';
import Link from 'next/link';
import LikeButton from '@/components/LikeButton';
import CommentSection from '@/components/CommentSection';
import { readTime } from '@/lib/utils';

async function getBlog(id: string) {
  await connectDB();
  const [Blog] = await Promise.all([
    import('../../../models/blog').then(m => m.default),
    import('../../../models/comment'),
  ]);
  const blog = await Blog.findById(id).populate('comments').lean();
  if (!blog) return null;
  return JSON.parse(JSON.stringify(blog));
}

export default async function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [blog, session] = await Promise.all([getBlog(id), getServerSession(authOptions)]);

  if (!blog) notFound();

  const canEdit = session && (session.user.username === 'admin' || session.user.username === blog.createdBy);
  const deleteBlogAction = deleteBlog.bind(null, blog._id);

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map((tag: string) => (
            <Link key={tag} href={`/blogs?tag=${tag}`} className="px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-medium hover:bg-violet-200 dark:hover:bg-violet-800/40 transition-colors">
              {tag}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-4">{blog.title}</h1>

      {/* Meta */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <Link href={`/users/${blog.createdBy}`} className="text-slate-700 dark:text-slate-300 font-medium hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
            {blog.author}
          </Link>
          <span>·</span>
          <span>{readTime(blog.text || '')}</span>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2">
            <Link href={`/blogs/${blog._id}/edit`} className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-white text-xs font-medium transition-all">Edit</Link>
            <form action={deleteBlogAction}>
              <button type="submit" className="px-4 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs font-medium transition-all">Delete</button>
            </form>
          </div>
        )}
      </div>

      {/* Cover image */}
      {blog.image && (
        <div className="mb-10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={blog.image} alt={blog.title} className="w-full max-h-96 object-cover" />
        </div>
      )}

      {/* Content — rendered as rich HTML from TipTap */}
      <div
        className="prose prose-slate dark:prose-invert max-w-none mb-10"
        dangerouslySetInnerHTML={{ __html: blog.text }}
      />

      {/* Draft badge */}
      {!blog.published && (
        <div className="mb-6 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 text-sm font-medium inline-block">
          Draft — not visible to others
        </div>
      )}

      {/* Like + share row */}
      <div className="flex items-center gap-3 py-6 border-y border-slate-200 dark:border-slate-800 mb-12">
        <LikeButton blogId={blog._id} likes={blog.likes ?? []} />
        <span className="text-sm text-slate-400 dark:text-slate-600">
          {blog.likes?.length === 1 ? '1 like' : `${blog.likes?.length ?? 0} likes`}
        </span>
      </div>

      <CommentSection blogId={blog._id} comments={blog.comments ?? []} />
    </article>
  );
}
