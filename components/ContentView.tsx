
import React, { lazy } from 'react';
import type { WikiPage } from '../types.ts';

// Use React.lazy for robust dynamic importing
const LazyMarkdownRenderer = lazy(async () => {
  const [markdownModule, gfmModule] = await Promise.all([
    import('https://esm.sh/react-markdown@9?bundle'),
    import('https://esm.sh/remark-gfm@4?bundle')
  ]);
  
  // The component needs to be the default export of the module
  return { default: (props: { content: string }) => 
    <markdownModule.default remarkPlugins={[gfmModule.default]}>
      {props.content}
    </markdownModule.default> 
  };
});


const ContentView: React.FC<{ 
    page: WikiPage; 
    categoryName?: string;
}> = ({ page, categoryName }) => {
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
        <LazyMarkdownRenderer content={page.content} />
      </article>
    </div>
  );
};

export default ContentView;