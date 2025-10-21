(function () {
    const header = document.querySelector('.site-header');
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('.primary-nav');
    const navLinks = document.querySelectorAll('.primary-nav a[href^="#"], .hero a[href^="#"], .section a[href^="#"]');
    const primaryNavLinks = document.querySelectorAll('.primary-nav a');

    const closeMenu = () => {
        if (!menuToggle) return;
        menuToggle.setAttribute('aria-expanded', 'false');
        nav?.classList.remove('is-open');
    };

    const toggleMenu = () => {
        const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', String(!expanded));
        nav?.classList.toggle('is-open', !expanded);
    };

    menuToggle?.addEventListener('click', () => {
        toggleMenu();
    });

    document.addEventListener('click', (event) => {
        if (!nav || !menuToggle) return;
        const target = event.target;
        if (nav.contains(target) || menuToggle.contains(target)) {
            return;
        }
        closeMenu();
    });

    navLinks.forEach((link) => {
        link.addEventListener('click', (event) => {
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;
            const target = document.querySelector(href);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            closeMenu();
        });
    });

    primaryNavLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    const handleScrollHeader = () => {
        if (!header) return;
        if (window.scrollY > 24) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    };

    handleScrollHeader();
    window.addEventListener('scroll', handleScrollHeader, { passive: true });

    const animatedElements = document.querySelectorAll('[data-animate]');
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries, obs) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.15,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        animatedElements.forEach((el) => observer.observe(el));
    } else {
        animatedElements.forEach((el) => el.classList.add('is-visible'));
    }
})();
