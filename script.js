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
        
        // Update active class on links
        document.querySelectorAll('.page-link').forEach(link => {
            link.classList.toggle('active', link.dataset.pageId === page.id);
        });
        
        // Show loading state for content
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
                ${ICONS.BOOK}
                <h1>Aldon Wiki</h1>
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

        // Add event listeners
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

    const initialize = async () => {
        renderLoading();
        try {
            const response = await fetch('pages/index.json');
            if (!response.ok) {
                throw new Error('Could not load wiki manifest. Make sure pages/index.json exists and is valid JSON.');
            }
            const manifest = await response.json();
            
            buildSidebar(manifest.categories, manifest.pages);

            if (manifest.pages.length > 0) {
                const firstPage = manifest.pages[0];
                loadPage(firstPage);
                // Expand the first category by default
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