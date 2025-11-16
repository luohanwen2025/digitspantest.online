/**
 * Blog Search Module
 * Implements high-performance client-side search functionality
 * Optimized for mobile devices and fast response times
 */

class BlogSearch {
    constructor(blogManager) {
        this.blogManager = blogManager;
        this.searchIndex = [];
        this.searchResults = [];
        this.isSearching = false;
        this.minSearchLength = 2;
        this.maxResults = 50;
        this.searchDebounceTime = 150; // Faster response for better UX

        this.init();
    }

    init() {
        this.buildSearchIndex();
        this.setupSearchInterface();
        this.setupKeyboardNavigation();
        this.setupSearchAnalytics();
    }

    buildSearchIndex() {
        if (!this.blogManager.articles || this.blogManager.articles.length === 0) {
            console.warn('No articles available for search indexing');
            return;
        }

        this.searchIndex = this.blogManager.articles.map(article => ({
            id: article.id,
            title: article.title.toLowerCase(),
            excerpt: article.excerpt.toLowerCase(),
            tags: article.tags.map(tag => tag.toLowerCase()),
            category: article.category.toLowerCase(),
            author: article.author.toLowerCase(),
            searchText: [
                article.title,
                article.excerpt,
                article.tags.join(' '),
                article.category,
                article.author
            ].join(' ').toLowerCase(),
            original: article
        }));

        console.log(`Search index built with ${this.searchIndex.length} articles`);
    }

    setupSearchInterface() {
        const searchInput = document.getElementById('searchInput');
        const searchButton = document.querySelector('.search-button');

        if (searchInput) {
            // Add input event with debouncing
            searchInput.addEventListener('input', this.debounce((e) => {
                this.handleSearchInput(e.target.value);
            }, this.searchDebounceTime));

            // Add focus/blur events for UX improvements
            searchInput.addEventListener('focus', () => {
                this.handleSearchFocus();
            });

            searchInput.addEventListener('blur', () => {
                this.handleSearchBlur();
            });

            // Handle special keys
            searchInput.addEventListener('keydown', (e) => {
                this.handleSearchKeydown(e);
            });

            // Add clear button functionality
            this.addClearButton(searchInput);
        }

        if (searchButton) {
            searchButton.addEventListener('click', () => {
                const searchInput = document.getElementById('searchInput');
                if (searchInput) {
                    this.performSearch(searchInput.value);
                }
            });
        }
    }

    handleSearchInput(query) {
        const trimmedQuery = query.trim();

        // Clear search if empty
        if (trimmedQuery === '') {
            this.clearSearch();
            return;
        }

        // Check minimum length
        if (trimmedQuery.length < this.minSearchLength) {
            this.showSearchSuggestions(trimmedQuery);
            return;
        }

        // Perform search
        this.performSearch(trimmedQuery);
    }

    performSearch(query) {
        if (this.isSearching || !this.searchIndex.length) return;

        this.isSearching = true;
        this.showSearching(true);

        // Use setTimeout to prevent blocking UI
        setTimeout(() => {
            this.executeSearch(query);
            this.isSearching = false;
            this.showSearching(false);
        }, 0);
    }

    executeSearch(query) {
        const startTime = performance.now();
        const queryLower = query.toLowerCase();
        const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);

        // Score each article based on relevance
        const scoredResults = this.searchIndex.map(item => {
            let score = 0;
            let matchDetails = {
                titleMatches: 0,
                excerptMatches: 0,
                tagMatches: 0,
                categoryMatches: 0,
                exactMatches: 0
            };

            // Exact phrase matching (highest priority)
            if (item.searchText.includes(queryLower)) {
                score += 10;
                matchDetails.exactMatches = 1;
            }

            // Word-by-word matching
            queryWords.forEach(word => {
                // Title matches (highest weight)
                if (item.title.includes(word)) {
                    score += 5;
                    matchDetails.titleMatches++;
                }

                // Excerpt matches
                if (item.excerpt.includes(word)) {
                    score += 3;
                    matchDetails.excerptMatches++;
                }

                // Tag matches
                if (item.tags.some(tag => tag.includes(word))) {
                    score += 2;
                    matchDetails.tagMatches++;
                }

                // Category matches
                if (item.category.includes(word)) {
                    score += 1;
                    matchDetails.categoryMatches++;
                }
            });

            // Boost recent articles
            const articleDate = new Date(item.original.date);
            const daysSincePublished = (new Date() - articleDate) / (1000 * 60 * 60 * 24);
            if (daysSincePublished < 30) {
                score += 1; // Recent articles get slight boost
            }

            // Boost featured articles
            if (item.original.featured) {
                score += 2;
            }

            return {
                item: item,
                score: score,
                matchDetails: matchDetails
            };
        });

        // Filter out zero-score results and sort by relevance
        this.searchResults = scoredResults
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, this.maxResults)
            .map(result => result.item);

        const endTime = performance.now();
        const searchTime = endTime - startTime;

        console.log(`Search completed in ${searchTime.toFixed(2)}ms, found ${this.searchResults.length} results`);

        this.displaySearchResults(query);
        this.trackSearchAnalytics(query, this.searchResults.length, searchTime);
    }

    displaySearchResults(query) {
        if (this.searchResults.length === 0) {
            this.showNoResults(query);
            return;
        }

        // Update the blog manager's filtered articles with search results
        this.blogManager.filteredArticles = this.searchResults.map(result => result.original);
        this.blogManager.renderArticles();

        // Add search result highlighting
        this.highlightSearchTerms(query);

        // Show search summary
        this.showSearchSummary(query, this.searchResults.length);
    }

    highlightSearchTerms(query) {
        const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);

        // Wait for DOM to update, then highlight terms
        setTimeout(() => {
            document.querySelectorAll('.article-title, .article-excerpt').forEach(element => {
                let text = element.textContent;
                let highlightedText = text;

                queryWords.forEach(word => {
                    const regex = new RegExp(`(${this.escapeRegExp(word)})`, 'gi');
                    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
                });

                if (highlightedText !== text) {
                    element.innerHTML = highlightedText;
                }
            });
        }, 100);
    }

    showSearchSummary(query, resultCount) {
        // Remove existing summary
        const existingSummary = document.querySelector('.search-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        const summaryHTML = `
            <div class="search-summary" style="margin: 1rem 0; padding: 1rem; background: var(--bg-secondary); border-radius: 8px;">
                <p style="margin: 0; color: var(--text-secondary);">
                    Found <strong>${resultCount}</strong> article${resultCount !== 1 ? 's' : ''} for "<strong>${this.escapeHtml(query)}</strong>"
                    <button class="clear-search" style="margin-left: 1rem; padding: 0.25rem 0.75rem; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
                        Clear Search
                    </button>
                </p>
            </div>
        `;

        const articlesContainer = document.querySelector('.articles-container');
        if (articlesContainer) {
            articlesContainer.insertAdjacentHTML('afterbegin', summaryHTML);

            // Add clear search handler
            const clearButton = document.querySelector('.clear-search');
            if (clearButton) {
                clearButton.addEventListener('click', () => {
                    this.clearSearch();
                });
            }
        }
    }

    showNoResults(query) {
        const articlesGrid = document.getElementById('articlesGrid');
        const noResults = document.getElementById('noResults');

        if (articlesGrid) articlesGrid.innerHTML = '';
        if (noResults) {
            noResults.innerHTML = `
                <h3>No articles found</h3>
                <p>No articles match your search for "<strong>${this.escapeHtml(query)}</strong>". </p>
                <p>Try different keywords or browse all categories.</p>
                <button class="clear-search-btn" style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--primary-color); color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Clear Search
                </button>
            `;
            noResults.style.display = 'block';

            const clearBtn = noResults.querySelector('.clear-search-btn');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => {
                    this.clearSearch();
                });
            }
        }
    }

    showSearchSuggestions(partialQuery) {
        // Implementation for search suggestions
        // This could show popular searches or auto-complete suggestions
        console.log('Search suggestions for:', partialQuery);
    }

    clearSearch() {
        this.searchQuery = '';
        this.searchResults = [];

        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = '';
        }

        // Remove search summary
        const searchSummary = document.querySelector('.search-summary');
        if (searchSummary) {
            searchSummary.remove();
        }

        // Hide no results
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = 'none';
        }

        // Reset to show all articles in current category
        this.blogManager.filterArticles();
        this.blogManager.renderArticles();

        // Update URL
        this.blogManager.updateUrl();
    }

    setupKeyboardNavigation() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('keydown', (e) => {
            this.handleSearchKeydown(e);
        });
    }

    handleSearchKeydown(e) {
        switch (e.key) {
            case 'Escape':
                e.preventDefault();
                this.clearSearch();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.focusFirstResult();
                break;
            case 'Enter':
                e.preventDefault();
                const query = e.target.value.trim();
                if (query.length >= this.minSearchLength) {
                    this.performSearch(query);
                }
                break;
        }
    }

    focusFirstResult() {
        const firstArticle = document.querySelector('.article-card');
        if (firstArticle) {
            firstArticle.focus();
        }
    }

    addClearButton(searchInput) {
        // Create clear button
        const clearBtn = document.createElement('button');
        clearBtn.innerHTML = '✕';
        clearBtn.className = 'search-clear-btn';
        clearBtn.style.cssText = `
            position: absolute;
            right: 3.5rem;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            font-size: 1.2rem;
            color: var(--text-light);
            cursor: pointer;
            padding: 0.25rem;
            display: none;
            transition: color 0.2s ease;
        `;

        const searchContainer = searchInput.parentElement;
        if (searchContainer) {
            searchContainer.style.position = 'relative';
            searchContainer.appendChild(clearBtn);

            // Show/hide clear button based on input
            searchInput.addEventListener('input', () => {
                clearBtn.style.display = searchInput.value ? 'block' : 'none';
            });

            clearBtn.addEventListener('click', () => {
                this.clearSearch();
                searchInput.focus();
            });
        }
    }

    handleSearchFocus() {
        // Add visual feedback for focus
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.classList.add('search-focused');
        }
    }

    handleSearchBlur() {
        // Remove visual feedback for blur
        const searchContainer = document.querySelector('.search-container');
        if (searchContainer) {
            searchContainer.classList.remove('search-focused');
        }
    }

    showSearching(show) {
        const loadingEl = document.querySelector('.loading');
        if (loadingEl) {
            loadingEl.style.display = show ? 'block' : 'none';
        }
    }

    setupSearchAnalytics() {
        // Track search usage for analytics
        this.searchStats = {
            totalSearches: 0,
            successfulSearches: 0,
            averageSearchTime: 0,
            popularQueries: {}
        };
    }

    trackSearchAnalytics(query, resultCount, searchTime) {
        this.searchStats.totalSearches++;

        if (resultCount > 0) {
            this.searchStats.successfulSearches++;
        }

        // Update average search time
        const totalTime = this.searchStats.averageSearchTime * (this.searchStats.totalSearches - 1);
        this.searchStats.averageSearchTime = (totalTime + searchTime) / this.searchStats.totalSearches;

        // Track popular queries
        const normalizedQuery = query.toLowerCase().trim();
        this.searchStats.popularQueries[normalizedQuery] = (this.searchStats.popularQueries[normalizedQuery] || 0) + 1;

        console.log('Search analytics:', {
            query: query,
            resultCount: resultCount,
            searchTime: searchTime.toFixed(2) + 'ms',
            successRate: ((this.searchStats.successfulSearches / this.searchStats.totalSearches) * 100).toFixed(1) + '%'
        });
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$\u0026');
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

    // Public API
    getSearchStats() {
        return this.searchStats;
    }

    getPopularQueries(limit = 10) {
        const queries = Object.entries(this.searchStats.popularQueries)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([query, count]) => ({ query, count }));
        return queries;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogSearch;
}

// Initialize search when blog manager is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.blogManager) {
        window.blogSearch = new BlogSearch(window.blogManager);
    } else {
        // Wait for blog manager to be ready
        const checkBlogManager = setInterval(() => {
            if (window.blogManager) {
                window.blogSearch = new BlogSearch(window.blogManager);
                clearInterval(checkBlogManager);
            }
        }, 100);
    }
});