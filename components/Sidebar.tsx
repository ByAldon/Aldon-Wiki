import React, { useState, useMemo, useEffect } from 'react';
import { BookIcon, ChevronRightIcon } from './Icons.tsx';
import type { WikiPage, Category } from '../types.ts';

interface SidebarProps {
    pages: WikiPage[];
    categories: Category[];
    activePageId: string | null;
    onSelectPage: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ pages, categories, activePageId, onSelectPage }) => {
    const activePage = useMemo(() => pages.find(p => p.id === activePageId), [pages, activePageId]);
    
    const [expandedCategories, setExpandedCategories] = useState(() => 
        new Set(activePage ? [activePage.categoryId] : [])
    );

    useEffect(() => {
        if (activePage && !expandedCategories.has(activePage.categoryId)) {
            setExpandedCategories(prev => new Set(prev).add(activePage.categoryId));
        }
    }, [activePage, expandedCategories]);

    const handleToggleCategory = (categoryId: string) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const pagesByCategory = useMemo(() => {
        return pages.reduce((acc, page) => {
            const categoryId = page.categoryId || 'uncategorized';
            if (!acc[categoryId]) {
                acc[categoryId] = [];
            }
            acc[categoryId].push(page);
            return acc;
        }, {} as Record<string, WikiPage[]>);
    }, [pages]);

  return (
    <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col flex-shrink-0">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <BookIcon className="w-8 h-8 text-primary"/>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Aldon Wiki</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2 space-y-1 mt-2">
        {categories.map(category => {
            const isExpanded = expandedCategories.has(category.id);
            const categoryPages = pagesByCategory[category.id] || [];
            return (
              <div key={category.id}>
                <button
                  onClick={() => handleToggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-left text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                >
                  <span className="truncate">{category.name}</span>
                  <ChevronRightIcon className={`w-5 h-5 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                {isExpanded && (
                  <ul className="pl-4 mt-1 border-l border-gray-200 dark:border-gray-600">
                    {categoryPages.map(page => (
                      <li key={page.id}>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            onSelectPage(page.id);
                          }}
                          className={`block px-3 py-1.5 text-sm rounded-md truncate ${
                            activePageId === page.id
                              ? 'bg-indigo-100 dark:bg-indigo-900 text-primary dark:text-white font-medium'
                              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page.title || 'Untitled Page'}
                        </a>
                      </li>
                    ))}
                    {categoryPages.length === 0 && <li className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 italic">No pages</li>}
                  </ul>
                )}
              </div>
            );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;