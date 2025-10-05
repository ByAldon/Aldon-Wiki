import React, { useState } from 'react';
import type { WikiPage, Category } from '../types';
import { suggestTitle } from '../services/geminiService';
import { SaveIcon, CancelIcon, SparklesIcon } from './Icons';

interface EditViewProps {
  page: WikiPage;
  categories: Category[];
  onSave: (id: string, title: string, content: string, categoryId: string) => void;
  onCancel: () => void;
}

const EditView: React.FC<EditViewProps> = ({ page, categories, onSave, onCancel }) => {
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [categoryId, setCategoryId] = useState(page.categoryId);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    onSave(page.id, title, content, categoryId);
  };

  const handleSuggestTitle = async () => {
    setIsSuggesting(true);
    setError(null);
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            throw new Error("API_KEY environment variable not set.");
        }
      const suggestedTitle = await suggestTitle(content);
      setTitle(suggestedTitle);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error("Failed to suggest title:", err);
    } finally {
      setIsSuggesting(false);
    }
  };


  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 md:p-8 space-y-6 h-full flex flex-col">
      <div className="flex-shrink-0 space-y-4">
        <div className="relative">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Page Title"
            className="w-full p-3 text-3xl font-bold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary pr-12"
          />
          <button
            onClick={handleSuggestTitle}
            disabled={isSuggesting}
            className="absolute top-1/2 right-3 -translate-y-1/2 p-2 text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Suggest Title"
          >
            {isSuggesting ? (
              <div className="w-5 h-5 border-2 border-transparent border-t-primary rounded-full animate-spin"></div>
            ) : (
              <SparklesIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        <div>
          <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category-select"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
      <div className="flex-grow flex flex-col">
        <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your Markdown content here..."
            className="w-full h-full flex-grow p-4 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
      </div>
      <div className="flex-shrink-0 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 dark:text-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none"
        >
          <CancelIcon className="w-5 h-5 inline-block mr-2 -mt-1" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-indigo-600 focus:outline-none"
        >
          <SaveIcon className="w-5 h-5 inline-block mr-2 -mt-1" />
          Save Page
        </button>
      </div>
    </div>
  );
};

export default EditView;