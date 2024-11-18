function toggleAccordion() {
    const content = document.querySelector('.accordion-content');
    const toggle = document.querySelector('.accordion-toggle');
    const arrow = document.querySelector('.accordion-toggle .arrow');
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        arrow.innerHTML = '&#9650;';
        toggle.classList.add('open');
    } else {
        content.style.display = 'none';
        arrow.innerHTML = '&#9660;';
        toggle.classList.remove('open');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('.accordion-content').style.display = 'none';
});
