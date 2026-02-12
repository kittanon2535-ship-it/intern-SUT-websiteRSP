const bgWrapper = document.querySelector('.hero-bg-wrapper');
const stopAtScroll = 500; 

document.addEventListener('mousemove', (e) => {
    if (window.scrollY > stopAtScroll || !bgWrapper) return;

    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    const percentX = (mouseX - centerX) / centerX;
    const percentY = (mouseY - centerY) / centerY;

    const moveX = percentX * 20; 
    const moveY = percentY * 20; 

    bgWrapper.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
});

document.addEventListener('DOMContentLoaded', () => {
    
    const buttons = document.querySelectorAll('.btn-item');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 70,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    const content = document.querySelector('.hero-content');
    if (content) {
        content.style.opacity = '0';
        content.style.transition = 'opacity 1.5s ease-in-out';
        setTimeout(() => { content.style.opacity = '1'; }, 300);
    }

    const serviceItems = document.querySelectorAll('.service-item');
    const detailOverlay = document.querySelector('.detail-overlay-v2');
    const detailTitle = document.getElementById('detailTitle');
    const detailText = document.getElementById('detailText');
    const detailLeftImage = document.getElementById('detailLeftImage');

    if (detailOverlay) {
        serviceItems.forEach(item => {
            item.addEventListener('click', () => {
                const title = item.getAttribute('data-title');
                const detail = item.getAttribute('data-detail');
                const imageUrl = item.querySelector('img').src;

                const tempImg = new Image();
                tempImg.src = imageUrl;

                tempImg.onload = () => {
                    detailTitle.textContent = title;
                    detailText.textContent = detail;
                    detailLeftImage.style.backgroundImage = `url('${imageUrl}')`;

                    serviceItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');

                    detailOverlay.style.display = 'flex';

                    requestAnimationFrame(() => {
                        void detailLeftImage.offsetWidth; 
                        requestAnimationFrame(() => {
                            detailOverlay.classList.add('show');
                        });
                    });
                };
            });
        });
    }

    const track = document.getElementById('logo-track');
    if (track) {
        const initialContent = track.innerHTML;
        const fillTrack = () => {
            while (track.scrollWidth < window.innerWidth * 3) {
                track.innerHTML += initialContent;
            }
        };
        fillTrack();
        window.addEventListener('resize', fillTrack);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
});

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    const mainLogo = document.getElementById('mainLogo');
    if (window.scrollY > 50) {
        header.classList.add('sticky');
    } else {
        header.classList.remove('sticky');
    }
});
 
window.closeDetail = function() {
    const detailOverlay = document.querySelector('.detail-overlay-v2');
    const serviceItems = document.querySelectorAll('.service-item');
    const detailLeftImage = document.getElementById('detailLeftImage');
    if (!detailOverlay) return;
    detailOverlay.classList.remove('show');
    setTimeout(() => {
        serviceItems.forEach(i => i.classList.remove('active'));
        if (detailLeftImage) detailLeftImage.style.backgroundImage = ''; 
    }, 400); 
}

document.addEventListener('click', (e) => {
    const detailOverlay = document.querySelector('.detail-overlay-v2');
    if (e.target === detailOverlay) closeDetail();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDetail();
});

// ระบบสลับภาษา
function switchLanguage(lang) {
    document.querySelectorAll('[data-th]').forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) el.textContent = text;
    });
    document.documentElement.lang = lang;
    const lTH = document.getElementById('langTH');
    const lEN = document.getElementById('langEN');
    if (lTH && lEN) {
        lTH.classList.toggle('active', lang === 'th');
        lEN.classList.toggle('active', lang === 'en');
    }
}
document.getElementById('langTH')?.addEventListener('click', () => switchLanguage('th'));
document.getElementById('langEN')?.addEventListener('click', () => switchLanguage('en'));
switchLanguage('th'); // เริ่มต้นภาษาไทย

let nextDom = document.getElementById('next');
let prevDom = document.getElementById('prev');
let carouselDom = document.querySelector('.carousel');
if (carouselDom && nextDom && prevDom) {
    let SliderDom = carouselDom.querySelector('.list');
    let thumbnailBorderDom = document.querySelector('.thumbnail');
    let timeRunning = 3000;
    let timeAutoNext = 7000;
    let runTimeOut;
    let runNextAuto = setTimeout(() => nextDom.click(), timeAutoNext);

    function showSlider(type) {
        let SliderItemsDom = SliderDom.querySelectorAll('.item');
        let thumbnailItemsDom = document.querySelectorAll('.thumbnail .item');
        if (type === 'next') {
            SliderDom.appendChild(SliderItemsDom[0]);
            thumbnailBorderDom.appendChild(thumbnailItemsDom[0]);
            carouselDom.classList.add('next');
        } else {
            SliderDom.prepend(SliderItemsDom[SliderItemsDom.length - 1]);
            thumbnailBorderDom.prepend(thumbnailItemsDom[thumbnailItemsDom.length - 1]);
            carouselDom.classList.add('prev');
        }
        clearTimeout(runTimeOut);
        runTimeOut = setTimeout(() => {
            carouselDom.classList.remove('next');
            carouselDom.classList.remove('prev');
        }, timeRunning);
        clearTimeout(runNextAuto);
        runNextAuto = setTimeout(() => nextDom.click(), timeAutoNext);
    }
    nextDom.onclick = () => showSlider('next');
    prevDom.onclick = () => showSlider('prev');
}

const setupTrack = (trackId) => {
    const track = document.getElementById(trackId);
    const originalContent = track.innerHTML;
    track.innerHTML = originalContent + originalContent;
    const scrollDistance = track.scrollWidth / 2;
    track.style.setProperty('--scroll-distance', `-${scrollDistance}px`);
};

window.onload = () => {
    setupTrack('track1');
    setupTrack('track2');
};