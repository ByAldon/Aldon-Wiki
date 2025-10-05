document.addEventListener('DOMContentLoaded', () => {
    const sidebarEl = document.getElementById('sidebar');
    const contentEl = document.getElementById('content');
    let activePageId = null;

    const ICONS = {
        BOOK: `<svg xmlns="http://www.w3.org/2000/svg" class="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="width: 2rem; height: 2rem; color: var(--primary-color);">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>`,
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

    const loadPage = async (page) => {
        activePageId = page.id;
        
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

    const buildSidebar = (categories, pages) => {
        const pagesByCategory = pages.reduce((acc, page) => {
            if (!acc[page.categoryId]) {
                acc[page.categoryId] = [];
            }
            acc[page.categoryId].push(page);
            return acc;
        }, {});

        let sidebarHTML = `
            <div class="sidebar-header">
                 <a href="#" id="home-link" class="sidebar-title-link" aria-label="Go to home page">
                    <div class="sidebar-title">
                        ${ICONS.BOOK}
                        <h1>Aldon Wiki</h1>
                    </div>
                </a>
            </div>
            <nav class="sidebar-nav">`;

        categories.forEach(category => {
            const categoryPages = pagesByCategory[category.id] || [];
            sidebarHTML += `
                <div class="category-item">
                    <button class="category-toggle" data-category-id="${category.id}">
                        <span>${category.name}</span>
                        ${ICONS.CHEVRON}
                    </button>
                    <div class="category-pages" id="category-${category.id}">
                        ${categoryPages.map(page => `
                            <a href="#" class="page-link" data-page-id="${page.id}">${page.title}</a>
                        `).join('')}
                    </div>
                </div>`;
        });
        
        sidebarHTML += `</nav>`;
        sidebarEl.innerHTML = sidebarHTML;
        
        const homeLink = document.getElementById('home-link');
        if (homeLink && pages.length > 0) {
            homeLink.addEventListener('click', (e) => {
                e.preventDefault();
                loadPage(pages[0]);
            });
        }

        document.querySelectorAll('.category-toggle').forEach(button => {
            button.addEventListener('click', () => {
                const categoryId = button.dataset.categoryId;
                const pageList = document.getElementById(`category-${categoryId}`);
                button.classList.toggle('expanded');
                pageList.classList.toggle('expanded');
            });
        });

        document.querySelectorAll('.page-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.dataset.pageId;
                const pageToLoad = pages.find(p => p.id === pageId);
                if (pageToLoad) {
                    loadPage(pageToLoad);
                }
            });
        });
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

        // Initialize theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            // Default to light theme if no preference is saved.
            applyTheme('light');
        }
    };

    const initialize = async () => {
        renderLoading();
        try {
            const response = await fetch('pages/index.json');
            if (!response.ok) {
                throw new Error('Could not load wiki manifest. Make sure pages/index.json exists and is valid JSON.');
            }
            const manifest = await response.json();
            
            buildSidebar(manifest.categories, manifest.pages);
            setupThemeToggle();

            if (manifest.pages.length > 0) {
                const firstPage = manifest.pages[0];
                loadPage(firstPage);
                const firstCategoryButton = document.querySelector(`.category-toggle[data-category-id="${firstPage.categoryId}"]`);
                if(firstCategoryButton) {
                    firstCategoryButton.click();
                }
            } else {
                renderWelcomeMessage(false);
            }
        } catch (error) {
            console.error('Initialization failed:', error);
            renderError(error.message);
        }
    };

    initialize();
});