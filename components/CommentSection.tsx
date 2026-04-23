'use client';

import { useSession } from 'next-auth/react';
import { addComment, deleteComment } from '@/lib/actions';
import { useState } from 'react';
import Link from 'next/link';

interface Comment {
  _id: string;
  user: string;
  comment: string;
  parentId: string | null;
  createdAt?: string;
}

interface Props {
  blogId: string;
  comments: Comment[];
}

function Avatar({ username }: { username: string }) {
  return (
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-700/40 border border-violet-200 dark:border-violet-700/30 flex items-center justify-center text-violet-600 dark:text-violet-300 text-xs font-bold">
      {username?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function CommentSection({ blogId, comments }: Props) {
  const { data: session } = useSession();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const topLevel = comments.filter(c => !c.parentId);
  const getReplies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  const addCommentAction = addComment.bind(null, blogId);
  const canDelete = (comment: Comment) =>
    session && (session.user.username === 'admin' || session.user.username === comment.user);

  return (
    <section>
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">
        Comments <span className="text-slate-400 dark:text-slate-600 text-base font-normal">({comments.length})</span>
      </h2>

      {/* Top-level comment form */}
      {session ? (
        <form action={addCommentAction} className="flex gap-3 mb-8">
          <input type="hidden" name="parentId" value="" />
          <input
            name="comment"
            placeholder="Leave a comment..."
            required
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm"
          />
          <button type="submit" className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors">
            Post
          </button>
        </form>
      ) : (
        <div className="mb-8 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-500 text-center">
          <Link href="/login" className="text-violet-600 dark:text-violet-400 hover:underline">Login</Link> to leave a comment.
        </div>
      )}

      {/* Comment threads */}
      <div className="space-y-4">
        {topLevel.map(comment => (
          <div key={comment._id}>
            {/* Parent comment */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <Avatar username={comment.user} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <Link href={`/users/${comment.user}`} className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400">
                    {comment.user}
                  </Link>
                  <div className="flex items-center gap-2">
                    {session && (
                      <button
                        type="button"
                        onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                        className="text-xs text-slate-400 hover:text-violet-500 transition-colors"
                      >
                        {replyingTo === comment._id ? 'Cancel' : 'Reply'}
                      </button>
                    )}
                    {canDelete(comment) && (
                      <form action={deleteComment.bind(null, blogId, comment._id)}>
                        <button type="submit" className="text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                      </form>
                    )}
                  </div>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 break-words">{comment.comment}</p>
              </div>
            </div>

            {/* Reply form */}
            {replyingTo === comment._id && session && (
              <form
                action={async (fd) => { fd.set('parentId', comment._id); await addCommentAction(fd); setReplyingTo(null); }}
                className="flex gap-2 mt-2 ml-11"
              >
                <input type="hidden" name="parentId" value={comment._id} />
                <input
                  name="comment"
                  placeholder={`Reply to ${comment.user}...`}
                  required
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-lg text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
                <button type="submit" className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
                  Reply
                </button>
              </form>
            )}

            {/* Replies */}
            {getReplies(comment._id).length > 0 && (
              <div className="ml-11 mt-2 space-y-2">
                {getReplies(comment._id).map(reply => (
                  <div key={reply._id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <Avatar username={reply.user} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <Link href={`/users/${reply.user}`} className="text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400">
                          {reply.user}
                        </Link>
                        {canDelete(reply) && (
                          <form action={deleteComment.bind(null, blogId, reply._id)}>
                            <button type="submit" className="text-slate-400 dark:text-slate-600 hover:text-red-500 transition-colors text-lg leading-none">×</button>
                          </form>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 break-words">{reply.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
