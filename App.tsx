import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { WikiPage, Category } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import ContentView from './components/ContentView';
import EditView from './components/EditView';
import { PlusIcon } from './components/Icons';

const initialContent = `
# Welcome to Aldon Wiki

This is your personal, Markdown-powered wiki. Everything you write here is saved directly in your browser's local storage.

## How to Get Started

1.  **Create a new page:** Click the "New Page" button in the sidebar.
2.  **Create a category:** Click the folder icon in the sidebar to create categories.
3.  **Write content:** Use Markdown syntax to format your text. You can create headings, lists, links, and more.
4.  **Edit pages:** Click the "Edit" button on any page to make changes and assign it to a category.
5.  **AI Title Suggestions:** When editing, click the magic wand button next to the title to let AI suggest a title based on your content.

## What is Markdown?

Markdown is a lightweight markup language with plain-text-formatting syntax. It's designed so that it can be converted to HTML and many other formats.

-   **Bold:** \`**Bold Text**\`
-   *Italic:* \`*Italic Text*\`
-   \`Code:\` \`\`\` \`Code Block\` \`\`\`

Enjoy building your personal knowledge base!
`;

const UNCATEGORIZED_ID = 'uncategorized';

const App: React.FC = () => {
  const [pages, setPages] = useLocalStorage<WikiPage[]>('aldon-wiki-pages', []);
  const [categories, setCategories] = useLocalStorage<Category[]>('aldon-wiki-categories', []);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    // Initialize default categories and pages if they don't exist
    if (pages.length === 0 && categories.length === 0) {
      const gettingStartedCategory: Category = { id: crypto.randomUUID(), name: 'Getting Started' };
      const uncategorizedCategory: Category = { id: UNCATEGORIZED_ID, name: 'Uncategorized' };
      
      const welcomePage: WikiPage = {
        id: crypto.randomUUID(),
        title: "Welcome!",
        content: initialContent,
        categoryId: gettingStartedCategory.id,
      };

      setCategories([gettingStartedCategory, uncategorizedCategory]);
      setPages([welcomePage]);
      setActivePageId(welcomePage.id);
    } else if (!activePageId && pages.length > 0) {
      setActivePageId(pages[0].id);
    }
  }, [pages, categories, setPages, setCategories, activePageId]);
  
  const activePage = useMemo(() => pages.find(p => p.id === activePageId), [pages, activePageId]);
  const activeCategory = useMemo(() => categories.find(c => c.id === activePage?.categoryId), [categories, activePage]);

  const handleSelectPage = useCallback((id: string) => {
    setActivePageId(id);
    setIsEditing(false);
  }, []);

  const handleCreateNewPage = useCallback((categoryId: string = UNCATEGORIZED_ID) => {
    const newPage: WikiPage = {
      id: crypto.randomUUID(),
      title: 'Untitled Page',
      content: '# New Page\n\nStart writing your content here.',
      categoryId,
    };
    setPages(prevPages => [newPage, ...prevPages]);
    setActivePageId(newPage.id);
    setIsEditing(true);
  }, [setPages]);

  const handleSavePage = useCallback((id: string, title: string, content: string, categoryId: string) => {
    setPages(prevPages =>
      prevPages.map(p => (p.id === id ? { ...p, title, content, categoryId } : p))
    );
    setIsEditing(false);
  }, [setPages]);

  const handleDeletePage = useCallback((id: string) => {
    if (window.confirm('Are you sure you want to delete this page?')) {
      const remainingPages = pages.filter(p => p.id !== id);
      setPages(remainingPages);
      if (activePageId === id) {
        setActivePageId(remainingPages.length > 0 ? remainingPages[0].id : null);
        setIsEditing(false);
      }
    }
  }, [pages, activePageId, setPages]);

  const handleCreateCategory = useCallback((name: string) => {
    if (name && !categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
        const newCategory: Category = { id: crypto.randomUUID(), name };
        setCategories(prev => [...prev, newCategory]);
    } else {
        alert('Category name already exists or is empty.');
    }
  }, [categories, setCategories]);

  return (
    <div className="flex h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar
        pages={pages}
        categories={categories}
        activePageId={activePageId}
        onSelectPage={handleSelectPage}
        onCreateNewPage={handleCreateNewPage}
        onCreateNewCategory={handleCreateCategory}
      />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activePage ? (
          isEditing ? (
            <EditView
              key={activePage.id}
              page={activePage}
              categories={categories}
              onSave={handleSavePage}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <ContentView
              page={activePage}
              categoryName={activeCategory?.name}
              onEdit={() => setIsEditing(true)}
              onDelete={handleDeletePage}
            />
          )
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
             <div className="max-w-md">
              <h2 className="text-2xl font-bold mb-4">No pages yet</h2>
              <p className="mb-6">Click the button below to create your first page and start your wiki.</p>
              <button
                onClick={() => handleCreateNewPage()}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create First Page
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;