const CONTACT_API_ENDPOINT = 'https://sut-park-backend.onrender.com/api/contacts';

const langTH = document.getElementById('langTH');
const langEN = document.getElementById('langEN');

if (langTH && langEN) {
    langTH.addEventListener('click', () => switchLanguage('th'));
    langEN.addEventListener('click', () => switchLanguage('en'));
}

/**
 * @param {string} lang 
 */
function switchLanguage(lang) {
    document.querySelectorAll('[data-th]').forEach(el => {
        const translation = el.getAttribute(`data-${lang}`);
        if(translation) {
            el.textContent = translation;
        }
    });

    document.documentElement.lang = lang;
    
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

window.toggleDropdown = function(event, dropdownId) {
    event.preventDefault(); 
    
    document.querySelectorAll('.dropdown-content').forEach(function(el) {
        if (el.id !== dropdownId) {
            el.classList.remove('show');
        }
    });

    document.getElementById(dropdownId).classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.closest('.dropdown')) { 
        var dropdowns = document.getElementsByClassName("dropdown-content");
        for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    
    const menuToggle = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    
    if (menuToggle && navigation) {
        menuToggle.addEventListener('click', () => {
            navigation.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    if (form) {
        form.addEventListener('submit', async function(event) {
            event.preventDefault(); 
            const dataToSend = {
                name: document.getElementById('name')?.value || '',
                email: document.getElementById('email')?.value || '', 
                phone: document.getElementById('phone')?.value || '',
                subject: document.getElementById('subject')?.value || '',
                message: document.getElementById('message')?.value || '',
            };
            
            if (!dataToSend.name || !dataToSend.email || !dataToSend.subject || !dataToSend.message) {
                 formMessage.textContent = '❌ กรุณากรอกข้อมูล Name, Email, Subject และ Message ให้ครบถ้วน';
                 formMessage.className = 'form-message error';
                 formMessage.style.display = 'block';
                 return;
            }

            const submitButton = form.querySelector('.submit-button');
            const originalButtonText = submitButton ? submitButton.textContent : 'ส่งข้อความ';

            if (submitButton) {
                submitButton.textContent = 'กำลังส่ง...';
                submitButton.disabled = true;
            }
            formMessage.style.display = 'none';

            fetch(CONTACT_API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataToSend)
            })
            .then(async response => {
                if (!response.ok) {
                    let errorMessage = `เกิดข้อผิดพลาดในการส่งข้อมูล (Status: ${response.status})`;
                    try {
                        const errorData = await response.json();
                        errorMessage = `❌ ${errorData.message || errorMessage}`;
                    } catch (e) {
                        console.error('API responded with non-JSON error:', await response.text());
                    }
                    throw new Error(errorMessage); 
                }
                return response.json();
            })
            .then(result => {
                console.log('ส่งข้อความสำเร็จ:', result);
                formMessage.textContent = 'ส่งข้อความของคุณเรียบร้อยแล้ว! ขอบคุณที่ติดต่อเราครับ';
                formMessage.className = 'form-message success';
                form.reset(); 
            })
            .catch(error => {
                console.error('เกิดข้อผิดพลาดในการส่ง:', error);
                formMessage.textContent = error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง'; 
                formMessage.className = 'form-message error';
            })
            .finally(() => {
                if (submitButton) {
                    submitButton.textContent = originalButtonText;
                    submitButton.disabled = false;
                }
                formMessage.style.display = 'block';
            });
        });
    } 
});