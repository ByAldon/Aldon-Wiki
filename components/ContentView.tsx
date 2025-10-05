// Fix: Add necessary imports for React, markdown rendering, and types.
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { WikiPage } from '../types';

const ContentView: React.FC<{ page: WikiPage; categoryName?: string; }> = ({ page, categoryName }) => {
  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8">
      <header className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        {categoryName && (
          <p className="text-sm font-medium text-primary mb-2">{categoryName}</p>
        )}
        <div className="flex justify-between items-start">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{page.title}</h1>
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

// Fix: Add default export for the ContentView component.
export default ContentView;
