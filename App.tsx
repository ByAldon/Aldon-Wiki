// FIX: Import React and hooks directly.
import React, { useState, useMemo, useCallback, useEffect } from 'react';

// Import types and components with full file extensions for module resolution.
import type { WikiPage, Category } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import ContentView from './components/ContentView.tsx';
import { BookIcon } from './components/Icons.tsx';

const App = () => {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWikiData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
        setIsLoading(true);
    }
    try {
      // Use new URL() to create a robust, absolute path for the manifest
      const manifestResponse = await fetch(new URL('pages/index.json', window.location.href).href);
      if (!manifestResponse.ok) {
        throw new Error('Could not load wiki manifest. Make sure pages/index.json exists.');
      }
      const manifest = await manifestResponse.json();

      const pagePromises = manifest.pages.map(async (pageMeta: { path: string; id: string; title: string; categoryId: string; }) => {
        // Encode path components to handle spaces and other special characters
        const encodedPath = pageMeta.path.split('/').map(encodeURIComponent).join('/');
        
        // Use a relative path from the root, now correctly encoded
        const pageResponse = await fetch(new URL(encodedPath, window.location.href).href);
        if (!pageResponse.ok) {
          console.warn(`Failed to load page content from ${pageMeta.path}`);
          return null;
        }
        const content = await pageResponse.text();
        return {
          id: pageMeta.id,
          title: pageMeta.title,
          categoryId: pageMeta.categoryId,
          content: content,
        };
      });

      const loadedPages = (await Promise.all(pagePromises)).filter((p): p is WikiPage => p !== null);

      setCategories(manifest.categories);
      setPages(loadedPages);
      
      // Preserve active page on refresh, or set default on initial load.
      setActivePageId(currentId => {
          const pageStillExists = loadedPages.some(p => p.id === currentId);
          if (currentId && pageStillExists) {
              return currentId; // Keep current page if it still exists
          }
          // If no page is selected, or selected page was removed, default to first page
          if (loadedPages.length > 0) {
              return manifest.pages[0].id;
          }
          return null; // No pages left
      });

      setError(null); // Clear any previous errors on a successful fetch

    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while loading the wiki.');
    } finally {
      if (isInitialLoad) {
          setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchWikiData(true); // Initial fetch
    
    // Set up interval for auto-refreshing every minute
    const intervalId = setInterval(() => fetchWikiData(false), 60000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchWikiData]);

  const activePage = useMemo(() => pages.find(p => p.id === activePageId), [pages, activePageId]);
  const activeCategory = useMemo(() => categories.find(c => c.id === activePage?.categoryId), [categories, activePage]);

  const handleSelectPage = useCallback((id: string) => {
    setActivePageId(id);
  }, []);
  
  const renderContent = () => {
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
                <p className="mt-4 text-lg">Loading Wiki...</p>
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-red-500 dark:text-red-400">
                <h2 className="text-2xl font-bold mb-4">Failed to Load Wiki</h2>
                <p className="max-w-md bg-red-100 dark:bg-red-900/50 p-4 rounded-md">{error}</p>
            </div>
        );
    }
    if (activePage) {
        return <ContentView page={activePage} categoryName={activeCategory?.name} />;
    }
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <div className="max-w-md">
                <BookIcon className="w-16 h-16 mx-auto mb-4 text-gray-400"/>
                <h2 className="text-2xl font-bold mb-4">Welcome to Aldon Wiki</h2>
                <p>Select a page from the sidebar to get started.</p>
                {pages.length === 0 && <p className="mt-4">It looks like there are no pages defined in your <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded">pages/index.json</code> file.</p>}
            </div>
        </div>
    );
  }

  return (
    <div className="flex h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar
        pages={pages}
        categories={categories}
        activePageId={activePageId}
        onSelectPage={handleSelectPage}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;