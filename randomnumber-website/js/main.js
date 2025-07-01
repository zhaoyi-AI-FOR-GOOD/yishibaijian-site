// 导航栏滚动效果
document.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('shadow-sm');
            navbar.style.padding = '1rem 0';
        } else {
            navbar.classList.remove('shadow-sm');
            navbar.style.padding = '1.5rem 0';
        }
    });
    
    // 激活当前导航项
    const currentLocation = location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        if(link.getAttribute('href') === currentLocation) {
            link.classList.add('active');
        }
    });
});

// 卡片动画入场效果
window.addEventListener('load', function() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}); 