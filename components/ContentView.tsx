
import React, { useEffect, useState } from 'react';
import type { WikiPage } from '../types';
import { EditIcon, TrashIcon } from './Icons';

// Dynamically import react-markdown and remark-gfm
let ReactMarkdown: any = () => null;
let remarkGfm: any;

const loadMarkdown = async () => {
  const [markdownModule, gfmModule] = await Promise.all([
    import('https://esm.sh/react-markdown@9?bundle'),
    import('https://esm.sh/remark-gfm@4?bundle')
  ]);
  ReactMarkdown = markdownModule.default;
  remarkGfm = gfmModule.default;
};


const ContentView: React.FC<{ page: WikiPage; onEdit: () => void; onDelete: (id: string) => void; }> = ({ page, onEdit, onDelete }) => {
  const [isMarkdownLoaded, setIsMarkdownLoaded] = useState(false);
  
  useEffect(() => {
    loadMarkdown().then(() => setIsMarkdownLoaded(true));
  }, []);

  if (!isMarkdownLoaded) {
    return <div className="p-4 text-center">Loading content viewer...</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
      <header className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{page.title}</h1>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
            aria-label="Edit Page"
          >
            <EditIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(page.id)}
            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800"
            aria-label="Delete Page"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </header>
      <article className="prose prose-indigo dark:prose-invert lg:prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {page.content}
        </ReactMarkdown>
      </article>
    </div>
  );
};

export default ContentView;
