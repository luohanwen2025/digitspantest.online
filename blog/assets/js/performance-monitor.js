/**
 * Core Web Vitals Performance Monitor
 * Tracks CLS, LCP, FID, and other performance metrics
 * Optimized for blog performance monitoring
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            cls: 0,
            lcp: 0,
            fid: 0,
            ttfb: 0,
            fcp: 0,
            inp: 0
        };
        this.clsEntries = [];
        this.observers = {};
        this.init();
    }

    init() {
        // Only run if browser supports Performance Observer
        if (!('PerformanceObserver' in window)) {
            console.log('PerformanceObserver not supported');
            return;
        }

        this.observeCLS();
        this.observeLCP();
        this.observeFID();
        this.observeFCP();
        this.observeTTFB();
        this.observeINP();
        this.setupPageHideHandler();
    }

    observeCLS() {
        // Cumulative Layout Shift monitoring
        this.observers.cls = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    this.clsEntries.push(entry);
                    this.metrics.cls += entry.value;
                }
            }
        });

        this.observers.cls.observe({ type: 'layout-shift', buffered: true });
    }

    observeLCP() {
        // Largest Contentful Paint monitoring
        this.observers.lcp = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.metrics.lcp = lastEntry.startTime;
        });

        this.observers.lcp.observe({ type: 'largest-contentful-paint', buffered: true });
    }

    observeFID() {
        // First Input Delay monitoring
        this.observers.fid = new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            if (firstInput) {
                this.metrics.fid = firstInput.processingStart - firstInput.startTime;
            }
        });

        this.observers.fid.observe({ type: 'first-input', buffered: true });
    }

    observeFCP() {
        // First Contentful Paint monitoring
        this.observers.fcp = new PerformanceObserver((entryList) => {
            const fcp = entryList.getEntries()[0];
            if (fcp) {
                this.metrics.fcp = fcp.startTime;
            }
        });

        this.observers.fcp.observe({ type: 'paint', buffered: true });
    }

    observeTTFB() {
        // Time to First Byte monitoring
        this.observers.ttfb = new PerformanceObserver((entryList) => {
            const navigation = entryList.getEntries()[0];
            if (navigation) {
                this.metrics.ttfb = navigation.responseStart;
            }
        });

        this.observers.ttfb.observe({ type: 'navigation', buffered: true });
    }

    observeINP() {
        // Interaction to Next Paint monitoring (optional, newer metric)
        if ('PerformanceObserver' in window && 'interactionId' in PerformanceEntry.prototype) {
            this.observers.inp = new PerformanceObserver((entryList) => {
                let maxDuration = 0;
                for (const entry of entryList.getEntries()) {
                    if (entry.duration > maxDuration) {
                        maxDuration = entry.duration;
                    }
                }
                if (maxDuration > 0) {
                    this.metrics.inp = maxDuration;
                }
            });

            this.observers.inp.observe({ type: 'event', buffered: true });
        }
    }

    setupPageHideHandler() {
        // Send metrics when page is hidden/unloaded
        const sendMetrics = () => {
            this.sendMetricsToAnalytics();
            this.logMetricsToConsole();
        };

        // Use pagehide for better reliability
        window.addEventListener('pagehide', sendMetrics);

        // Fallback for browsers that don't support pagehide
        window.addEventListener('beforeunload', sendMetrics);
    }

    sendMetricsToAnalytics() {
        const metrics = this.getFinalMetrics();

        // Send to Google Analytics 4 (if available)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'web_vitals', {
                event_category: 'Web Vitals',
                event_label: 'Blog Performance',
                value: Math.round(metrics.cls * 1000), // CLS in thousandths
                custom_map: {
                    'lcp': Math.round(metrics.lcp),
                    'fid': Math.round(metrics.fid),
                    'fcp': Math.round(metrics.fcp),
                    'ttfb': Math.round(metrics.ttfb),
                    'inp': Math.round(metrics.inp)
                }
            });
        }

        // Send to custom analytics endpoint
        if (navigator.sendBeacon) {
            const data = new Blob([JSON.stringify({
                url: window.location.href,
                timestamp: Date.now(),
                metrics: metrics
            })], { type: 'application/json' });

            navigator.sendBeacon('/api/analytics/web-vitals', data);
        }
    }

    logMetricsToConsole() {
        const metrics = this.getFinalMetrics();
        console.log('📊 Core Web Vitals:', {
            CLS: `${metrics.cls.toFixed(4)} (Good: <0.1, Needs Improvement: <0.25)`,
            LCP: `${metrics.lcp.toFixed(0)}ms (Good: <2.5s, Needs Improvement: <4s)`,
            FID: `${metrics.fid.toFixed(0)}ms (Good: <100ms, Needs Improvement: <300ms)`,
            FCP: `${metrics.fcp.toFixed(0)}ms (Good: <1.8s, Needs Improvement: <3s)`,
            TTFB: `${metrics.ttfb.toFixed(0)}ms (Good: <800ms, Needs Improvement: <1.8s)`,
            INP: `${metrics.inp.toFixed(0)}ms (Good: <200ms, Needs Improvement: <500ms)`
        });

        // Performance recommendations
        this.logPerformanceRecommendations(metrics);
    }

    logPerformanceRecommendations(metrics) {
        const recommendations = [];

        if (metrics.cls > 0.1) {
            recommendations.push('High CLS detected: Add explicit dimensions to images and avoid dynamic content shifts');
        }

        if (metrics.lcp > 2500) {
            recommendations.push('Slow LCP: Optimize images, use CDN, and reduce server response time');
        }

        if (metrics.fid > 100) {
            recommendations.push('High FID: Minimize main thread blocking and optimize JavaScript');
        }

        if (metrics.fcp > 1800) {
            recommendations.push('Slow FCP: Inline critical CSS and optimize font loading');
        }

        if (metrics.ttfb > 800) {
            recommendations.push('High TTFB: Optimize server response time and use CDN');
        }

        if (recommendations.length > 0) {
            console.log('⚡ Performance Recommendations:', recommendations);
        }
    }

    getFinalMetrics() {
        return {
            cls: this.metrics.cls,
            lcp: this.metrics.lcp,
            fid: this.metrics.fid,
            fcp: this.metrics.fcp,
            ttfb: this.metrics.ttfb,
            inp: this.metrics.inp,
            timestamp: Date.now(),
            url: window.location.href
        };
    }

    // Public method to get current metrics
    getMetrics() {
        return this.getFinalMetrics();
    }

    // Method to manually trigger metrics reporting
    reportMetrics() {
        this.sendMetricsToAnalytics();
        this.logMetricsToConsole();
    }
}

// Initialize performance monitoring when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.performanceMonitor = new PerformanceMonitor();
});

// Expose global function for manual reporting
window.reportWebVitals = () => {
    if (window.performanceMonitor) {
        window.performanceMonitor.reportMetrics();
    }
};