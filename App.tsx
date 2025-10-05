
import React, { useState, useMemo, useCallback, useEffect, Suspense } from 'react';
import type { WikiPage, Category } from './types';
import Sidebar from './components/Sidebar';
import ContentView from './components/ContentView';
import { BookIcon } from './components/Icons';

const App: React.FC = () => {
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWikiData = async () => {
      try {
        const manifestResponse = await fetch('./pages/index.json');
        if (!manifestResponse.ok) {
          throw new Error('Could not load wiki manifest. Make sure pages/index.json exists.');
        }
        const manifest = await manifestResponse.json();

        const pagePromises = manifest.pages.map(async (pageMeta: {
          id: string;
          title: string;
          categoryId: string;
          path: string;
        }) => {
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

        const loadedPages = (await Promise.all(pagePromises)).filter(p => p !== null) as WikiPage[];

        setCategories(manifest.categories);
        setPages(loadedPages);

        if (loadedPages.length > 0) {
          const