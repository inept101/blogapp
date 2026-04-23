'use client';

import { useState, useRef } from 'react';
import TipTapEditor from './TipTapEditor';
import { useRouter } from 'next/navigation';

interface Props {
  action: (formData: FormData) => Promise<void>;
  initial?: {
    author?: string;
    title?: string;
    image?: string;
    text?: string;
    tags?: string[];
    published?: boolean;
  };
  submitLabel?: string;
  cancelHref?: string;
}

export default function BlogForm({ action, initial = {}, submitLabel = 'Publish Post', cancelHref = '/blogs' }: Props) {
  const [content, setContent] = useState(initial.text || '');
  const [tags, setTags] = useState<string[]>(initial.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState(initial.image || '');
  const [published, setPublished] = useState(initial.published !== false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function addTag(e: React.KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (!tags.includes(tag)) setTags([...tags, tag]);
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setTags(tags.filter(t => t !== tag));
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, type: file.type }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const { uploadUrl, publicUrl } = await res.json();
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
        setImage(publicUrl);
      }
    } catch {
      // fallback to URL input
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="space-y-6">
      {/* Hidden fields for client-managed state */}
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="tags" value={tags.join(',')} />
      <input type="hidden" name="image" value={image} />
      <input type="hidden" name="published" value={String(published)} />

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Author name</label>
        <input
          type="text"
          name="author"
          defaultValue={initial.author}
          placeholder="Your display name"
          required
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Title</label>
        <input
          type="text"
          name="title"
          defaultValue={initial.title}
          placeholder="Give your post a title"
          required
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Tags <span className="text-slate-400 font-normal">(press Enter or comma to add)</span>
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 text-sm font-medium">
              {tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">×</button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={tagInput}
          onChange={e => setTagInput(e.target.value)}
          onKeyDown={addTag}
          placeholder="e.g. javascript, web, tutorial"
          className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        />
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Cover image <span className="text-slate-400 font-normal">(URL or upload)</span>
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={image}
            onChange={e => setImage(e.target.value)}
            placeholder="https://..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-500 hover:text-violet-600 transition-all text-sm font-medium disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : '↑ Upload'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>
        {image && (
          <div className="mt-2 h-32 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <img src={image} alt="Cover preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Content</label>
        <TipTapEditor content={content} onChange={setContent} />
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPublished(!published)}
          className={`relative w-11 h-6 rounded-full transition-colors ${published ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${published ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {published ? 'Published' : 'Draft (only you can see this)'}
        </span>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-semibold transition-colors shadow-lg shadow-violet-200 dark:shadow-violet-900/40"
        >
          {submitLabel}
        </button>
        <a
          href={cancelHref}
          className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-slate-600 font-medium transition-colors"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
