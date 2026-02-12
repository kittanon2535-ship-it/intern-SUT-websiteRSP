const langTH = document.getElementById('langTH');
const langEN = document.getElementById('langEN');


langTH.addEventListener('click', () => switchLanguage('th'));
langEN.addEventListener('click', () => switchLanguage('en'));

function switchLanguage(lang) {
  document.querySelectorAll('[data-th]').forEach(el => {
    el.textContent = el.getAttribute(`data-${lang}`);
  });

  document.documentElement.lang = lang;
  langTH.classList.toggle('active', lang === 'th');
  langEN.classList.toggle('active', lang === 'en');
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
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
});

const serviceData = [
    { id: 1, title: "TRAINING ROOM", img: "../workingspace/trainningroom.jpg", delay: 1100 },
    { id: 2, title: "MEETING ROOM", img: "../workingspace/meetingroom.jpg", delay: 1200 },
    { id: 3, title: "CO-WORKING", img: "../workingspace/coworking.jpg", delay: 1300 },
    { id: 4, title: "RSP HALL", img: "../workingspace/rsphall2.jpg", delay: 1400 },
    { id: 5, title: "FOOD HALL", img: "../workingspace/foodhall1.jpg", delay: 1500 },
    { id: 6, title: "NE2 INNO STORE", img: "../workingspace/inno.jpg", delay: 1600 },
    { id: 7, title: "LABORATORY", img: "../workingspace/EMC.jpg", delay: 1700 }
];
const container = document.getElementById('col-left');

serviceData.forEach(item => {
    container.innerHTML += `
        <div class="service-card" data-aos="fade-up" data-aos-delay="${item.delay}">
            <img src="${item.img}" alt="${item.title}">
            <h3>${item.title}</h3>
        </div>
    `;
});
function initServices() {
    const colLeft = document.getElementById('col-left');
    const colRight = document.getElementById('col-right');
    const wrapper = document.querySelector('.services-wrapper'); 

    if (colLeft) colLeft.innerHTML = '';
    if (colRight) colRight.innerHTML = '';

    serviceData.forEach((item, index) => {
        let container;
        if (index === 6) { 
            container = wrapper; 
        } else {
            const targetColId = (index % 2 === 0) ? 'col-left' : 'col-right';
            container = document.getElementById(targetColId);
        }
        if (!container) return;
        const group = document.createElement('div');
        group.className = index === 6 ? 'service-group special-center' : 'service-group';
        group.innerHTML = `
            <div class="card-3d main-header" 
                 data-aos="fade-up" 
                 data-aos-delay="${index * 100}"
                 onmousemove="handleTilt(event, this)" 
                 onmouseleave="handleReset(this)">
                <img src="${item.img}" alt="${item.title}">
                <div class="overlay">
                    <h2>${item.title}</h2>
                </div>
            </div>
            <div class="sub-list" id="subList-${item.id}"></div> 
        `;
        
        container.appendChild(group);
    });

    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
}
function toggleNested(id) {
}

function handleTilt(e, el) {
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rotateX = (rect.height / 1 - y) / 20;
    const rotateY = (x - rect.width / 7) / 70;
    
    el.style.transition = 'transform 0.15s ease-out';
    el.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`;
}

function handleReset(el) {
    el.style.transition = 'transform 0.8s cubic-bezier(0.23, 1, 0.32, 1)';
    el.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
}

function toggleSubList(id) {
    const list = document.getElementById(`subList-${id}`);
    if (list) list.classList.toggle('active');
}

function toggleDetail(detailId, el) {
    const detail = document.getElementById(`detail-${detailId}`);
    if (!detail) return;
    
    const isActive = detail.classList.contains('active');
    const parent = el.closest('.sub-list');
    
    parent.querySelectorAll('.glass-detail').forEach(d => d.classList.remove('active'));
    parent.querySelectorAll('.sub-row').forEach(r => r.classList.remove('active'));

    if (!isActive) {
        detail.classList.add('active');
        el.classList.add('active');
    }
}
document.addEventListener('DOMContentLoaded', initServices);
