// Navigation functionality for Kooperativet Beth-Nahrin website

(function() {
    'use strict';

    // DOM Elements
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navigation = document.getElementById('navigation');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const sections = document.querySelectorAll('section[id]');

    // Handle navigation background on scroll
    function handleNavigationScroll() {
        if (window.scrollY > 50) {
            navigation.classList.add('scrolled');
        } else {
            navigation.classList.remove('scrolled');
        }
    }

    // Mobile Menu Toggle
    function toggleMobileMenu() {
        const isExpanded = mobileMenuToggle.getAttribute('aria-expanded') === 'true';
        mobileMenuToggle.setAttribute('aria-expanded', !isExpanded);
        navMenu.classList.toggle('active');
        mobileMenuOverlay.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Update aria-hidden for overlay
        mobileMenuOverlay.setAttribute('aria-hidden', isExpanded ? 'true' : 'false');
        
        // Focus management: focus first link when opening menu
        if (!isExpanded) {
            const firstLink = navMenu.querySelector('.nav-link');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 300);
            }
        } else {
            // Return focus to toggle button when closing
            mobileMenuToggle.focus();
        }
    }

    // Close mobile menu
    function closeMobileMenu() {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        mobileMenuOverlay.classList.remove('active');
        document.body.classList.remove('menu-open');
        mobileMenuOverlay.setAttribute('aria-hidden', 'true');
        
        // Return focus to toggle button
        mobileMenuToggle.focus();
    }

    // Close mobile menu when clicking overlay
    function handleOverlayClick() {
        if (navMenu.classList.contains('active')) {
            closeMobileMenu();
        }
    }

    // Get the height of the navbar when scrolled (smaller size)
    function getScrolledNavHeight() {
        // Temporarily add scrolled class to get the smaller height
        const wasScrolled = navigation.classList.contains('scrolled');
        if (!wasScrolled) {
            navigation.classList.add('scrolled');
        }
        const scrolledHeight = navigation.offsetHeight;
        if (!wasScrolled) {
            navigation.classList.remove('scrolled');
        }
        return scrolledHeight;
    }

    // Smooth scroll to section
    function smoothScrollToSection(event) {
        event.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
            // For hero section, scroll to absolute top
            if (targetId === '#hero') {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else {
                // For other sections, account for navbar shrinking (20px difference)
                // Use scrolled navbar height and add 20px to compensate for shrinkage during scroll
                const scrolledNavHeight = getScrolledNavHeight();
                const navbarShrinkage = 20; // Navbar shrinks by ~20px when scrolling
                const targetPosition = targetSection.offsetTop - scrolledNavHeight + navbarShrinkage;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }

            // Close mobile menu after clicking a link
            if (navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        }
    }

    // Highlight active section in navigation
    function highlightActiveSection() {
        const scrollPosition = window.scrollY + navigation.offsetHeight + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                        link.setAttribute('aria-current', 'page');
                    }
                });
            }
        });
    }

    // Handle scroll events with throttling for better performance
    let scrollTimeout;
    function handleScroll() {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        scrollTimeout = window.requestAnimationFrame(() => {
            handleNavigationScroll();
            highlightActiveSection();
        });
    }

    // Intersection Observer for fade-in animations
    function setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-visible');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe elements with fade-in class
        const fadeInElements = document.querySelectorAll('.fade-in');
        fadeInElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Smooth scroll polyfill for older browsers
    function smoothScrollPolyfill() {
        // Check if smooth scroll is supported
        if (!('scrollBehavior' in document.documentElement.style)) {
            // Polyfill for smooth scroll
            const smoothScrollTo = (targetPosition, duration) => {
                const startPosition = window.pageYOffset;
                const distance = targetPosition - startPosition;
                let startTime = null;

                const animation = (currentTime) => {
                    if (startTime === null) startTime = currentTime;
                    const timeElapsed = currentTime - startTime;
                    const run = ease(timeElapsed, startPosition, distance, duration);
                    window.scrollTo(0, run);
                    if (timeElapsed < duration) requestAnimationFrame(animation);
                };

                const ease = (t, b, c, d) => {
                    t /= d / 2;
                    if (t < 1) return c / 2 * t * t + b;
                    t--;
                    return -c / 2 * (t * (t - 2) - 1) + b;
                };

                requestAnimationFrame(animation);
            };

            // Override smooth scroll for navigation links
            navLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault();
                    const targetId = this.getAttribute('href');
                    const targetSection = document.querySelector(targetId);

                    if (targetSection) {
                        const navHeight = navigation.offsetHeight;
                        const targetPosition = targetSection.offsetTop - navHeight;
                        smoothScrollTo(targetPosition, 800);

                        // Close mobile menu after clicking a link
                        if (navMenu.classList.contains('active')) {
                            closeMobileMenu();
                        }
                    }
                });
            });
        }
    }

    // Initialize event listeners
    function init() {
        // Mobile menu toggle
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', toggleMobileMenu);
        }

        // Close menu when clicking overlay
        if (mobileMenuOverlay) {
            mobileMenuOverlay.addEventListener('click', handleOverlayClick);
        }

        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', smoothScrollToSection);
        });
        
        // Handle logo link click to scroll to top
        const logoLink = document.querySelector('.nav-logo a');
        if (logoLink) {
            logoLink.addEventListener('click', function(event) {
                event.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    closeMobileMenu();
                }
            });
        }

        // Handle scroll events
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Set initial states
        handleNavigationScroll();
        highlightActiveSection();

        // Setup Intersection Observer for fade-in animations
        setupIntersectionObserver();

        // Apply smooth scroll polyfill if needed
        smoothScrollPolyfill();

        // Update footer year
        const yearElement = document.getElementById('current-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }

        // Handle escape key to close mobile menu
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && navMenu.classList.contains('active')) {
                closeMobileMenu();
            }
        });
        
        // Trap focus within mobile menu when open
        document.addEventListener('keydown', (event) => {
            if (!navMenu.classList.contains('active')) return;
            
            if (event.key === 'Tab') {
                const focusableElements = navMenu.querySelectorAll('.nav-link');
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];
                
                // If shift+tab on first element, focus last element
                if (event.shiftKey && document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
                // If tab on last element, focus first element
                else if (!event.shiftKey && document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
