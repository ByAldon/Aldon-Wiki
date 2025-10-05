
import React from 'react';
import type { WikiPage } from '../types';
import { PlusIcon, BookIcon } from './Icons';

interface SidebarProps {
  pages: WikiPage[];
  activePageId: string | null;
  onSelectPage: (id: string) => void;
  onCreateNew: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ pages, activePageId, onSelectPage, onCreateNew }) => {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-3">
        <BookIcon className="w-8 h-8 text-primary"/>
        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Aldon Wiki</h1>
      </div>
      <div className="p-2">
        <button
          onClick={onCreateNew}
          className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:focus:ring-offset-gray-800"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          New Page
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <ul>
          {pages.map(page => (
            <li key={page.id}>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelectPage(page.id);
                }}
                className={`block px-3 py-2 text-sm rounded-md truncate ${
                  activePageId === page.id
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-primary dark:text-white font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {page.title || 'Untitled Page'}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
