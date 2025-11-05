document.addEventListener('DOMContentLoaded', () => {
    const sidebarEl = document.getElementById('sidebar');
    const contentEl = document.getElementById('content');
    let manifest = null; // Will hold the entire index.json content

    const ICONS = {
        BOOK: `<img src="assets/aldonlogo.png" alt="Aldon Wiki Logo" class="icon">`,
        CHEVRON: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>`,
        SUN: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>`,
        MOON: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>`
    };

    const renderWelcomeMessage = (hasPages = true) => {
        let message = `<p>Select a page from the sidebar to get started.</p>`;
        if (!hasPages) {
            message += `<p class="mt-4">It looks like there are no pages defined in your <code>pages/index.json</code> file.</p>`
        }
        contentEl.innerHTML = `
            <div class="content-placeholder">
                ${ICONS.BOOK}
                <h2>Welcome to Aldon Wiki</h2>
                ${message}
            </div>`;
    }
    
    const renderLoading = () => {
        contentEl.innerHTML = `<div class="content-placeholder"><div class="loader"></div><p>Loading Wiki...</p></div>`;
    }

    const renderError = (message) => {
        contentEl.innerHTML = `
            <div class="content-placeholder error-message">
                <h2>Failed to Load Wiki</h2>
                <code>${message}</code>
            </div>`;
    }

    const findPageRecursive = (pages, pageId, path = []) => {
        for (const page of pages) {
            const newPath = [...path, page];
            if (page.id === pageId) {
                return { page, path: newPath };
            }
            if (page.pages) {
                const found = findPageRecursive(page.pages, pageId, newPath);
                if (found) {
                    return found;
                }
            }
        }
        return null;
    };

    const loadPage = async (pageId) => {
        if (!manifest || !manifest.pages) return;
        
        const pageInfo = pageId ? findPageRecursive(manifest.pages, pageId) : null;

        if (!pageInfo) {
            renderWelcomeMessage(manifest.pages.length > 0);
            document.querySelectorAll('.page-link').forEach(link => link.classList.remove('active'));
            return;
        }

        const page = pageInfo.page;

        document.querySelectorAll('.page-link').forEach(link => {
            link.classList.toggle('active', link.dataset.pageId === page.id);
        });
        
        contentEl.innerHTML = `<div class="content-placeholder"><div class="loader"></div></div>`;

        try {
            const response = await fetch(page.path);
            if (!response.ok) {
                throw new Error(`Could not fetch page content from ${page.path}. Status: ${response.status}`);
            }
            const markdown = await response.text();
            const html = marked.parse(markdown);
            contentEl.innerHTML = `<div class="content-wrapper prose">${html}</div>`;
        } catch (error) {
            contentEl.innerHTML = `<div class="content-wrapper prose error-message"><h2>Error loading page</h2><p>${error.message}</p></div>`;
        }
    };

    const renderPageTree = (pages) => {
        if (!pages || pages.length === 0) return '';
        let html = '<ul class="page-list">';
        pages.forEach(page => {
            const hasChildren = page.pages && page.pages.length > 0;
            html += `
                <li class="page-item" data-page-id="${page.id}">
                    <div class="page-link-container">
                        <a href="#${page.id}" class="page-link" data-page-id="${page.id}">${page.title}</a>
                        ${hasChildren ? `<button class="page-toggle" aria-label="Toggle sub-pages">${ICONS.CHEVRON}</button>` : ''}
                    </div>
                    ${hasChildren ? `<div class="sub-pages">${renderPageTree(page.pages)}</div>` : ''}
                </li>`;
        });
        html += '</ul>';
        return html;
    };

    const buildSidebar = (categories, pages) => {
        const homeHref = pages.length > 0 ? `#${pages[0].id}` : '#';

        let sidebarHTML = `
            <div class="sidebar-header">
                 <a href="${homeHref}" class="sidebar-title-link" aria-label="Go to home page">
                    <div class="sidebar-title">
                        ${ICONS.BOOK}
                        <h1>Aldon Wiki</h1>
                    </div>
                </a>
            </div>
            <nav class="sidebar-nav">`;

        categories.forEach(category => {
            const categoryPages = pages.filter(p => p.categoryId === category.id);
            if (categoryPages.length > 0) {
                sidebarHTML += `
                    <div class="category-item">
                        <button class="category-toggle" data-category-id="${category.id}">
                            <span>${category.name}</span>
                            ${ICONS.CHEVRON}
                        </button>
                        <div class="category-pages" id="category-${category.id}">
                            ${renderPageTree(categoryPages)}
                        </div>
                    </div>`;
            }
        });
        
        sidebarHTML += `</nav>`;
        sidebarEl.innerHTML = sidebarHTML;

        document.querySelectorAll('.category-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const categoryId = button.dataset.categoryId;
                const pageList = document.getElementById(`category-${categoryId}`);
                button.classList.toggle('expanded');
                pageList.classList.toggle('expanded');
            });
        });

        document.querySelectorAll('.page-toggle').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const pageItem = button.closest('.page-item');
                pageItem.classList.toggle('expanded');
            });
        });
    };

    const handleRouteChange = () => {
        const pageId = window.location.hash.substring(1);
        if (pageId) {
            const pageInfo = findPageRecursive(manifest.pages, pageId);
            if (pageInfo) {
                loadPage(pageId);
                // Expand category
                const categoryButton = document.querySelector(`.category-toggle[data-category-id="${pageInfo.page.categoryId}"]`);
                const categoryPages = document.getElementById(`category-${pageInfo.page.categoryId}`);
                if (categoryButton && !categoryButton.classList.contains('expanded')) {
                    categoryButton.classList.add('expanded');
                    categoryPages.classList.add('expanded');
                }
                // Expand all parent pages
                pageInfo.path.forEach(ancestorPage => {
                    const pageItem = document.querySelector(`.page-item[data-page-id="${ancestorPage.id}"]`);
                    if (pageItem) {
                        pageItem.classList.add('expanded');
                    }
                });
            } else {
                loadPage(null);
            }
        } else if (manifest && manifest.pages.length > 0) {
            window.location.hash = `#${manifest.pages[0].id}`;
        } else {
            renderWelcomeMessage(false);
        }
    };

    const setupThemeToggle = () => {
        const themeToggleBtn = document.createElement('button');
        themeToggleBtn.classList.add('theme-toggle');
        themeToggleBtn.setAttribute('aria-label', 'Toggle theme');
        
        const header = sidebarEl.querySelector('.sidebar-header');
        if (header) {
            header.appendChild(themeToggleBtn);
        }

        const applyTheme = (theme) => {
            if (theme === 'dark') {
                document.body.classList.add('dark');
                themeToggleBtn.innerHTML = ICONS.SUN;
            } else {
                document.body.classList.remove('dark');
                themeToggleBtn.innerHTML = ICONS.MOON;
            }
        };

        const toggleTheme = () => {
            const currentTheme = document.body.classList.contains('dark') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        };

        themeToggleBtn.addEventListener('click', toggleTheme);

        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));
    };

    const initialize = async () => {
        renderLoading();
        try {
            const response = await fetch('pages/index.json');
            if (!response.ok) {
                throw new Error('Could not load wiki manifest. Make sure pages/index.json exists and is valid JSON.');
            }
            manifest = await response.json();
            
            buildSidebar(manifest.categories, manifest.pages);
            setupThemeToggle();

            window.addEventListener('hashchange', handleRouteChange);
            handleRouteChange(); // Trigger route handling for initial load

        } catch (error) {
            console.error('Initialization failed:', error);
            renderError(error.message);
        }
    };

    initialize();
});