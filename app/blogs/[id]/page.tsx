import { connectDB } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { deleteBlog, addComment, deleteComment } from '@/lib/actions';
import Link from 'next/link';

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

export default async function BlogPage({ params }: { params: { id: string } }) {
  const [blog, session] = await Promise.all([getBlog(params.id), getServerSession(authOptions)]);

  if (!blog) notFound();

  const canEdit = session && (session.user.username === 'admin' || session.user.username === blog.createdBy);
  const deleteBlogAction = deleteBlog.bind(null, blog._id);

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight mb-4">{blog.title}</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span className="text-slate-700 dark:text-slate-400 font-medium">{blog.author}</span>
          {canEdit && (
            <div className="ml-auto flex items-center gap-2">
              <Link
                href={`/blogs/${blog._id}/edit`}
                className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-500 hover:text-violet-600 dark:hover:text-white text-xs font-medium transition-all"
              >
                Edit
              </Link>
              <form action={deleteBlogAction}>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-400 dark:hover:border-red-700 text-xs font-medium transition-all"
                >
                  Delete
                </button>
              </form>
            </div>
          )}
        </div>
      </header>

      {blog.image && (
        <div className="mb-10 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
          <img src={blog.image} alt={blog.title} className="w-full max-h-96 object-cover" />
        </div>
      )}

      <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg whitespace-pre-line mb-16">
        {blog.text}
      </div>

      <hr className="border-slate-200 dark:border-slate-800 mb-12" />

      <section>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          Comments{' '}
          <span className="text-slate-400 dark:text-slate-600 text-base font-normal">({blog.comments?.length ?? 0})</span>
        </h2>

        {session ? (
          <form action={addComment.bind(null, blog._id)} className="flex gap-3 mb-8">
            <input
              name="comment"
              placeholder="Leave a comment..."
              required
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors"
            >
              Post
            </button>
          </form>
        ) : (
          <div className="mb-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 text-center">
            <Link href="/login" className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300">Login</Link> to leave a comment.
          </div>
        )}

        <div className="space-y-4">
          {blog.comments?.map((comment: any) => {
            const canDeleteComment = session && (session.user.username === 'admin' || session.user.username === comment.user);
            return (
              <div key={comment._id} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-700/40 border border-violet-200 dark:border-violet-700/30 flex items-center justify-center text-violet-600 dark:text-violet-300 text-xs font-bold">
                  {comment.user?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">{comment.user}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 break-words">{comment.comment}</p>
                </div>
                {canDeleteComment && (
                  <form action={deleteComment.bind(null, blog._id, comment._id)}>
                    <button type="submit" className="flex-shrink-0 text-slate-400 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition-colors text-lg leading-none" aria-label="Delete comment">×</button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </article>
  );
}
