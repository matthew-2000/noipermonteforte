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

    // === 📣 POPUP EVENTO PRESENTAZIONE LISTA ===

    const EVENT_POPUP_STORAGE_KEY = 'npMonteforteEventPopupDismissed_v1';
    const EVENT_POPUP_COOLDOWN = 6 * 60 * 60 * 1000; // 6 ore
    const EVENT_POPUP_DELAY = 1800; // mostra dopo ~1.8 secondi
    const EVENT_POPUP_DEADLINE = new Date('2025-11-07T19:00:00+01:00').getTime();

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

    const buildEventPopup = () => {
        const popup = document.createElement('section');
        popup.className = 'event-popup';
        popup.setAttribute('role', 'dialog');
        popup.setAttribute('aria-label', 'Presentazione ufficiale della lista civica');
        popup.setAttribute('aria-modal', 'false');
        popup.innerHTML = `
            <div class="event-popup__media" aria-hidden="true">
                <img src="assets/img/logo.png" alt="" loading="lazy">
            </div>
            <div class="event-popup__content">
                <span class="event-popup__eyebrow">Evento in evidenza</span>
                <p class="event-popup__title">Presentazione ufficiale della lista e del programma</p>
                <div class="event-popup__details">
                    <span>🗓️ Venerdì 7 Novembre – ore 19:00</span>
                    <span>📍 Comitato elettorale, via Alvanella</span>
                </div>
                <div class="event-popup__actions">
                    <button type="button" class="event-popup__close" aria-label="Chiudi promemoria">Chiudi</button>
                    <a class="event-popup__link" href="#presentazione">Scopri di più</a>
                </div>
            </div>
        `;

        const dismissPopup = () => {
            popup.classList.remove('is-visible');
            popup.addEventListener('transitionend', () => popup.remove(), { once: true });
            const styles = window.getComputedStyle(popup);
            const duration = parseFloat(styles.transitionDuration) || 0;
            const delay = parseFloat(styles.transitionDelay) || 0;
            if (duration + delay === 0) popup.remove();
        };

        popup.querySelector('.event-popup__close')?.addEventListener('click', () => {
            safeSetStorage(EVENT_POPUP_STORAGE_KEY, Date.now().toString());
            dismissPopup();
        });

        popup.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                safeSetStorage(EVENT_POPUP_STORAGE_KEY, Date.now().toString());
                dismissPopup();
            }
        });

        popup.querySelector('.event-popup__link')?.addEventListener('click', () => {
            safeSetStorage(EVENT_POPUP_STORAGE_KEY, Date.now().toString());
            dismissPopup();
        });

        document.body.appendChild(popup);

        requestAnimationFrame(() => {
            popup.classList.add('is-visible');
        });
    };

    const maybeShowEventPopup = () => {
        if (!document.body.classList.contains('page-home')) return;
        const now = Date.now();
        if (now >= EVENT_POPUP_DEADLINE) return;

        const lastDismissed = parseInt(safeGetStorage(EVENT_POPUP_STORAGE_KEY) || '0', 10);
        if (Number.isFinite(lastDismissed) && lastDismissed > 0 && now - lastDismissed < EVENT_POPUP_COOLDOWN) {
            return;
        }

        window.setTimeout(() => {
            buildEventPopup();
        }, EVENT_POPUP_DELAY);
    };

    if (document.readyState === 'complete') {
        maybeShowEventPopup();
    } else {
        window.addEventListener('load', maybeShowEventPopup, { once: true });
    }
})();
