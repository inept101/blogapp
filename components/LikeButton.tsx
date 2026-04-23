'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toggleLike } from '@/lib/actions';

interface Props {
  blogId: string;
  likes: string[];
}

export default function LikeButton({ blogId, likes }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [optimisticLikes, setOptimisticLikes] = useState(likes);

  const hasLiked = session ? optimisticLikes.includes(session.user.username) : false;

  async function handleLike() {
    if (!session) { router.push('/login'); return; }

    setOptimisticLikes(prev =>
      hasLiked ? prev.filter(u => u !== session.user.username) : [...prev, session.user.username]
    );

    await toggleLike(blogId);
    router.refresh();
  }

  return (
    <button
      onClick={handleLike}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-all text-sm font-medium ${
        hasLiked
          ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400'
          : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-red-400 hover:text-red-500 dark:hover:border-red-600 dark:hover:text-red-400'
      }`}
    >
      <span>{hasLiked ? '♥' : '♡'}</span>
      <span>{optimisticLikes.length}</span>
    </button>
  );
}
