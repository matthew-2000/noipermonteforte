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

    menuToggle?.addEventListener('click', toggleMenu);

    document.addEventListener('click', (event) => {
        if (!nav || !menuToggle) return;
        const target = event.target;
        if (nav.contains(target) || menuToggle.contains(target)) return;
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
        link.addEventListener('click', closeMenu);
    });

    const handleScrollHeader = () => {
        if (!header) return;
        if (window.scrollY > 24) header.classList.add('scrolled');
        else header.classList.remove('scrolled');
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
                // Mobile devices render some sections (like the candidates list)
                // in a single column, making them very tall. With the previous
                // 0.15 threshold the observer never reached the required
                // intersection ratio on phones, so the entire section remained
                // hidden. Observing from 1% onward ensures the animation always
                // triggers while keeping a smoother reveal on larger viewports.
                threshold: [0.01, 0.15],
                rootMargin: '0px 0px -50px 0px',
            }
        );

        animatedElements.forEach((el) => observer.observe(el));
    } else {
        animatedElements.forEach((el) => el.classList.add('is-visible'));
    }

    // === ⚙️ POPUP MODIFICATO ===

    const POPUP_STORAGE_KEY = 'npMonteforteProfilePopupSeen_v1';
    const POPUP_DELAY = 300000;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 giorno in millisecondi

    const safeSetStorage = (key, value) => {
        try {
            window.localStorage.setItem(key, value);
        } catch (_) {}
    };

    const safeGetStorage = (key) => {
        try {
            return window.localStorage.getItem(key);
        } catch (_) {
            return null;
        }
    };

    const focusElement = (element) => {
        if (!element) return;
        try {
            element.focus({ preventScroll: true });
        } catch (_) {
            element.focus();
        }
    };

    const createProfilePopup = () => {
        const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        const popup = document.createElement('section');
        popup.className = 'profile-popup';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-label', 'Presentazione del candidato');
        popup.setAttribute('tabindex', '-1');
        popup.innerHTML = `
            <button class="profile-popup__close" type="button" aria-label="Chiudi presentazione">
                <span>×</span>
            </button>
            <div class="profile-popup__image" aria-hidden="true">
                <img src="assets/img/matteo.png" alt="" loading="lazy">
            </div>
            <div class="profile-popup__content">
                <p class="profile-popup__title">Matteo Ercolino</p>
                <p class="profile-popup__text">Mi chiamo Matteo Ercolino, ho 25 anni e sono uno sviluppatore informatico.
                Ho deciso di candidarmi perché credo che la mia generazione debba tornare protagonista.
                Voglio ricreare una comunità di giovani montefortesi, portare idee concrete e innovazione utile, e rendere Monteforte un paese dove valga la pena restare e costruire il futuro.</p>
            </div>
        `;

        const removePopup = () => {
            popup.remove();
            focusElement(previouslyFocusedElement);
        };

        const closePopup = () => {
            popup.classList.remove('is-visible');

            const onTransitionEnd = () => removePopup();
            popup.addEventListener('transitionend', onTransitionEnd, { once: true });

            const { transitionDuration, transitionDelay } = window.getComputedStyle(popup);
            const duration = parseFloat(transitionDuration) || 0;
            const delay = parseFloat(transitionDelay) || 0;
            if (duration + delay === 0) removePopup();
        };

        popup.querySelector('.profile-popup__close')?.addEventListener('click', () => {
            safeSetStorage(POPUP_STORAGE_KEY, Date.now().toString());
            closePopup();
        });

        popup.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                safeSetStorage(POPUP_STORAGE_KEY, Date.now().toString());
                closePopup();
            }
        });

        document.body.appendChild(popup);

        requestAnimationFrame(() => {
            popup.classList.add('is-visible');
            focusElement(popup);
        });
    };

    const showProfilePopupOncePerDay = () => {
        if (!('localStorage' in window)) return;
        const lastSeen = parseInt(safeGetStorage(POPUP_STORAGE_KEY) || '0', 10);
        const now = Date.now();

        // Mostra solo se è passato almeno un giorno
        if (now - lastSeen < ONE_DAY_MS) return;

        window.setTimeout(() => {
            createProfilePopup();
            safeSetStorage(POPUP_STORAGE_KEY, now.toString());
        }, POPUP_DELAY);
    };

    if (document.readyState === 'complete') {
        showProfilePopupOncePerDay();
    } else {
        window.addEventListener('load', showProfilePopupOncePerDay, { once: true });
    }
})();
