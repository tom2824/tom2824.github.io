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

// ========== Navbar scroll effect ==========
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ========== Active nav link on scroll ==========
const sections = document.querySelectorAll('section[id]:not(#hero)');
const navLinks = document.querySelectorAll('.nav-link');

function updateActiveNav() {
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

window.addEventListener('scroll', updateActiveNav, { passive: true });
updateActiveNav();

// ========== Mobile nav toggle ==========
const navToggle = document.querySelector('.nav-toggle');
const navLinksContainer = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
});

navLinksContainer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navLinksContainer.classList.remove('open');
    });
});

// ========== Skill tag icons ==========
document.querySelectorAll('.skill-tag[data-icon]').forEach(tag => {
    const icon = tag.getAttribute('data-icon');
    if (icon) {
        const img = document.createElement('img');
        img.src = icon;
        img.alt = '';
        img.loading = 'lazy';
        tag.prepend(img);
    }
});

// ========== Project Carousel ==========
const track = document.querySelector('.carousel-track');
const cards = document.querySelectorAll('.project-card');
const dotsContainer = document.querySelector('.carousel-dots');
const prevBtn = document.querySelector('.carousel-btn.prev');
const nextBtn = document.querySelector('.carousel-btn.next');
let currentSlide = 0;
const totalSlides = cards.length;

// Create dots
cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.classList.add('carousel-dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
});

function goToSlide(index) {
    currentSlide = index;
    track.style.transform = `translateX(-${index * 100}%)`;
    document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
}

prevBtn.addEventListener('click', () => {
    goToSlide(currentSlide > 0 ? currentSlide - 1 : totalSlides - 1);
});

nextBtn.addEventListener('click', () => {
    goToSlide(currentSlide < totalSlides - 1 ? currentSlide + 1 : 0);
});

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;
const carousel = document.querySelector('.carousel');

carousel.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

carousel.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) nextBtn.click();
        else prevBtn.click();
    }
});

// Auto-advance every 6s
let autoPlay = setInterval(() => nextBtn.click(), 6000);

carousel.addEventListener('mouseenter', () => clearInterval(autoPlay));
carousel.addEventListener('mouseleave', () => {
    autoPlay = setInterval(() => nextBtn.click(), 6000);
});
