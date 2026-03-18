// ========== Age calculation ==========
const birthDate = new Date(2004, 7, 2); // 2 août 2004
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
    age--;
}
document.getElementById('age').textContent = age;

// ========== Scroll Reveal ==========
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(el => revealObserver.observe(el));

// ========== Navbar scroll effect & active nav link ==========
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id]:not(#hero)');
const navLinks = document.querySelectorAll('.nav-link');

function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);

    const scrollY = window.scrollY + 120;
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
            current = section.id;
        }
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ========== Mobile nav toggle ==========
const navToggle = document.querySelector('.nav-toggle');
const navLinksContainer = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinksContainer.classList.remove('open');
    });
});

// ========== Skill tag icons ==========
document.querySelectorAll('.skill-tag[data-icon], .card-tags span[data-icon]').forEach(tag => {
    const icon = tag.getAttribute('data-icon');
    if (icon) {
        const img = document.createElement('img');
        img.src = icon;
        img.alt = '';
        img.loading = 'lazy';
        tag.prepend(img);
    }
});

