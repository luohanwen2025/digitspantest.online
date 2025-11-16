/**
 * Blog JavaScript Module
 * Handles article loading, filtering, and UI interactions
 * Optimized for performance and mobile devices
 */

class BlogManager {
    constructor() {
        this.articles = [];
        this.categories = [];
        this.filteredArticles = [];
        this.currentCategory = 'all';
        this.searchQuery = '';
        this.isLoading = false;

        this.init();
    }

    async init() {
        try {
            this.showLoading(true);
            await this.loadData();
            this.setupEventListeners();
            this.renderArticles();
            this.renderCategories();
            this.setupIntersectionObserver();
            this.showLoading(false);
        } catch (error) {
            console.error('Blog initialization failed:', error);
            this.showError('Failed to load blog content. Please try refreshing the page.');
            this.showLoading(false);
        }
    }

    async loadData() {
        // Load articles data
        const articlesResponse = await fetch('/blog/data/articles.json');
        const articlesData = await articlesResponse.json();
        this.articles = articlesData.articles || [];

        // Load categories data
        const categoriesResponse = await fetch('/blog/data/categories.json');
        const categoriesData = await categoriesResponse.json();
        this.categories = categoriesData.categories || [];

        // Initial filter
        this.filteredArticles = [...this.articles];
    }

    setupEventListeners() {
        // Category filter buttons
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.querySelector('.search-button');

        if (searchInput) {
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearch(e.target.value);
            }, 300));

            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleSearch(e.target.value);
                }
            });
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    this.handleSearch(searchInput.value);
                }
            });
        }

        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleUrlState();
        });
    }

    handleCategoryFilter(category) {
        // Update active button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        this.currentCategory = category;
        this.filterArticles();
        this.updateUrl();
        this.renderArticles();
    }

    handleSearch(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.filterArticles();
        this.renderArticles();
    }

    filterArticles() {
        this.filteredArticles = this.articles.filter(article => {
            // Category filter
            if (this.currentCategory !== 'all' && article.category !== this.currentCategory) {
                return false;
            }

            // Search filter
            if (this.searchQuery) {
                const searchText = `${article.title} ${article.excerpt} ${article.tags.join(' ')}`.toLowerCase();
                return searchText.includes(this.searchQuery);
            }

            return true;
        });

        // Sort by date (newest first)
        this.filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    renderArticles() {
        const articlesGrid = document.getElementById('articlesGrid');
        const noResults = document.getElementById('noResults');

        if (!articlesGrid) return;

        if (this.filteredArticles.length === 0) {
            articlesGrid.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';

        const articlesHTML = this.filteredArticles.map(article => this.createArticleCard(article)).join('');
        articlesGrid.innerHTML = articlesHTML;

        // Add click handlers to article cards
        this.setupArticleCardHandlers();
    }

    createArticleCard(article) {
        const category = this.categories.find(cat => cat.id === article.category);
        const formattedDate = this.formatDate(article.date);

        // Handle image loading with fallback
        const imageHtml = article.image
            ? `<div class="article-image">
                <img src="${article.image}" alt="${article.title}" loading="lazy" onerror="this.onerror=null; this.style.display='none'; this.parentElement.classList.add('no-image');">
              </div>`
            : `<div class="article-image no-image">
                <span role="img" aria-label="Article image" class="image-placeholder">${category?.icon || '📝'}</span>
              </div>`;

        return `
            <article class="article-card" data-category="${article.category}" data-id="${article.id}">
                ${imageHtml}
                <div class="article-content">
                    <div class="article-meta">
                        <span class="category-tag" style="background: ${category?.color || '#667eea'};">${category?.name || article.category}</span>
                        <time datetime="${article.date}">${formattedDate}</time>
                        <span class="reading-time">${article.readingTime}</span>
                    </div>
                    <h3 class="article-title">
                        <a href="${article.contentFile}" data-article-id="${article.id}">${this.escapeHtml(article.title)}</a>
                    </h3>
                    <p class="article-excerpt">${this.escapeHtml(article.excerpt)}</p>
                    <div class="article-footer">
                        <span class="author">By ${article.author}</span>
                        <span class="views">${this.formatNumber(article.views)} views</span>
                    </div>
                </div>
            </article>
        `;
    }

    renderCategories() {
        // Categories are already rendered in HTML, but we can update counts if needed
        this.categories.forEach(category => {
            const button = document.querySelector(`[data-category="${category.id}"]`);
            if (button && category.articleCount > 0) {
                // Optionally add article count to button
                const countSpan = button.querySelector('.category-count');
                if (countSpan) {
                    countSpan.textContent = ` (${category.articleCount})`;
                }
            }
        });
    }

    setupArticleCardHandlers() {
        const articleCards = document.querySelectorAll('.article-card');
        articleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't navigate if clicking on a link
                if (e.target.tagName === 'A') return;

                const link = card.querySelector('a');
                if (link) {
                    this.trackArticleClick(link.dataset.articleId);
                }
            });

            // Add keyboard navigation
            card.setAttribute('tabindex', '0');
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = card.querySelector('a');
                    if (link) {
                        link.click();
                    }
                }
            });
        });
    }

    setupIntersectionObserver() {
        // Lazy load images
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.add('lazyloaded');
                            observer.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }

        // Track article impressions for analytics
        const articleObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const articleId = entry.target.dataset.id;
                    this.trackArticleImpression(articleId);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.article-card').forEach(card => {
            articleObserver.observe(card);
        });
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    updateUrl() {
        const url = new URL(window.location);
        if (this.currentCategory !== 'all') {
            url.searchParams.set('category', this.currentCategory);
        } else {
            url.searchParams.delete('category');
        }

        if (this.searchQuery) {
            url.searchParams.set('search', this.searchQuery);
        } else {
            url.searchParams.delete('search');
        }

        window.history.replaceState({}, '', url);
    }

    handleUrlState() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category') || 'all';
        const search = urlParams.get('search') || '';

        if (category !== this.currentCategory) {
            this.handleCategoryFilter(category);
        }

        if (search !== this.searchQuery) {
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = search;
                this.handleSearch(search);
            }
        }
    }

    showLoading(show) {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
        this.isLoading = show;
    }

    showError(message) {
        const articlesGrid = document.getElementById('articlesGrid');
        if (articlesGrid) {
            articlesGrid.innerHTML = `
                <div class="error-message" style="text-align: center; padding: 2rem; color: var(--error-color);">
                    <h3>Error Loading Content</h3>
                    <p>${message}</p>
                    <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
        }
    }

    // Analytics tracking
    trackArticleClick(articleId) {
        // Track article click for analytics
        console.log('Article clicked:', articleId);

        // Update view count (in real implementation, this would be sent to server)
        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            article.views += 1;
        }
    }

    trackArticleImpression(articleId) {
        // Track article impression for analytics
        console.log('Article impression:', articleId);
    }

    // Performance optimization
    optimizePerformance() {
        // Preload next batch of articles if needed
        if (this.filteredArticles.length > 10) {
            // Implement pagination or infinite scroll
        }

        // Debounce scroll events
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Load more articles or trigger animations
            }, 100);
        });
    }
}

// Initialize blog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.blogManager = new BlogManager();
});

// Handle visibility change for performance
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Resume any paused activities
        console.log('Page became visible');
    } else {
        // Pause non-critical activities
        console.log('Page became hidden');
    }
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/blog/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}