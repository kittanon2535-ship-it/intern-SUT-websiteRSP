function switchLanguage(lang) {
    document.querySelectorAll('[data-th]').forEach(el => {
        if (el.tagName !== 'BUTTON') {
             el.textContent = el.getAttribute(`data-${lang}`);
        }
    });

    document.documentElement.lang = lang;
    const langTH = document.getElementById('langTH');
    const langEN = document.getElementById('langEN');

    if (langTH && langEN) {
        langTH.classList.toggle('active', lang === 'th');
        langEN.classList.toggle('active', lang === 'en');
    }
}

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const mainLogo = document.getElementById('mainLogo');
    const scrollDistance = 50; 

    if (!mainLogo) return;
    if (window.scrollY > scrollDistance) {
        header.classList.add('sticky'); 
        mainLogo.src = '../logo/Logo2.png';
    } else {
        header.classList.remove('sticky'); 
        mainLogo.src = '../logo/Logo.png';
    }
});

document.addEventListener('DOMContentLoaded', () => {

    const scrollElements = document.querySelectorAll('.scroll-animate');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (entry.target.classList.contains('vmc-card')) {
                    entry.target.classList.add('slide-up');
                } else if (entry.target.classList.contains('leader-highlight')) {
                    entry.target.classList.add('slide-down');
                } 
                else {
                    entry.target.classList.add('fade-in');
                }
                observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    scrollElements.forEach(el => {
        scrollObserver.observe(el);
    });
    
    const langTH = document.getElementById('langTH');
    const langEN = document.getElementById('langEN');

    if (langTH && langEN) {
        switchLanguage(document.documentElement.lang || 'th'); 

        langTH.addEventListener('click', () => switchLanguage('th'));
        langEN.addEventListener('click', () => switchLanguage('en'));
    }

    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });

        navigation.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navigation.classList.contains('active')) { 
                    navigation.classList.remove('active');
                    menuToggle.classList.remove('active');
                }
            });
        });
    }
}); 