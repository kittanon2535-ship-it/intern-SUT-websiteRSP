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
    const scrollDistance = 50; 
    if (window.scrollY > scrollDistance) {
        header.classList.add('sticky'); 
    } else {
        header.classList.remove('sticky'); 
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


