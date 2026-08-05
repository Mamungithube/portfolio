document.addEventListener('DOMContentLoaded', () => {
    // 1. Particle Canvas Animation System
    initParticleCanvas();

    // 3. Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
            mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('hidden');
        });
    }

    // 4. Smooth Scrolling & Close Mobile Menu
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
    });

    // 5. Scroll Reveal & Counter Trigger
    const reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom, .stagger-parent');
    let countersStarted = false;

    const revealOnScroll = () => {
        const wh = window.innerHeight;
        reveals.forEach(el => {
            if (el.getBoundingClientRect().top < wh - 80) {
                el.classList.add('active');
            }
        });

        // Trigger Stats Counter Animation
        const statsSection = document.getElementById('stats-overview');
        if (statsSection && !countersStarted && statsSection.getBoundingClientRect().top < wh - 100) {
            countersStarted = true;
            animateCounters();
        }
    };

    window.addEventListener('scroll', revealOnScroll, { passive: true });
    revealOnScroll();

    // 6. ScrollSpy Navbar Highlight
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    const updateActiveNav = () => {
        const scrollPosition = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollPosition >= top && scrollPosition < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active-nav');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active-nav');
                    }
                });
            }
        });
    };
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav();

    // 7. EmailJS Setup & Contact Form Handling
    if (window.emailjs) {
        emailjs.init('qKT37YhhFQyLDO5pT');
    }

    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const btnText = document.getElementById('btn-text');
    const btnIcon = document.getElementById('btn-icon');
    const btnLoading = document.getElementById('btn-loading');
    const captchaQuestionEl = document.getElementById('captcha-question');
    const captchaAnswerEl = document.getElementById('captcha-answer');

    const timeTokenEl = document.getElementById('time-token');
    const pageLoadTime = Date.now();
    if (timeTokenEl) {
        timeTokenEl.value = pageLoadTime.toString();
    }

    let captchaCorrectAnswer = 0;

    function generateCaptcha() {
        if (!captchaQuestionEl) return;
        const n1 = Math.floor(Math.random() * 9) + 1;
        const n2 = Math.floor(Math.random() * 9) + 1;
        captchaCorrectAnswer = n1 + n2;
        captchaQuestionEl.textContent = `${n1} + ${n2}`;
        if (captchaAnswerEl) captchaAnswerEl.value = '';
    }

    generateCaptcha();

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const fd = new FormData(contactForm);

            // 1. Honeypot Anti-Spam Check (Silently reject automated bots)
            if (fd.get('b_honeypot_check') || fd.get('bot-field')) {
                console.warn('Bot detected via honeypot field.');
                contactForm.reset();
                generateCaptcha();
                return;
            }

            // 2. Automated Script Speed Check (Reject submissions faster than 1.5 seconds)
            if (Date.now() - pageLoadTime < 1500) {
                console.warn('Automated script submission detected (too fast).');
                contactForm.reset();
                generateCaptcha();
                return;
            }

            // 3. Security Math Challenge Verification (Blocks Python/Go Scripts)
            const userCaptchaAns = parseInt(captchaAnswerEl ? captchaAnswerEl.value : '0', 10);
            if (userCaptchaAns !== captchaCorrectAnswer) {
                formMessage.innerHTML = '<div class="bg-red-500/20 border border-red-500 text-red-400 px-6 py-4 rounded-lg flex items-center gap-3"><i class="fas fa-exclamation-triangle text-xl"></i><span>Incorrect security answer. Please try again.</span></div>';
                formMessage.classList.remove('hidden');
                setTimeout(() => formMessage.classList.add('hidden'), 5000);
                generateCaptcha();
                return;
            }

            // 4. Rate Limiting Check (Allow max 1 message per 60 seconds)
            const lastSubmit = localStorage.getItem('last_contact_submit');
            const now = Date.now();
            const COOLDOWN_MS = 60000; // 60 seconds

            if (lastSubmit && (now - parseInt(lastSubmit, 10)) < COOLDOWN_MS) {
                const remainingSec = Math.ceil((COOLDOWN_MS - (now - parseInt(lastSubmit, 10))) / 1000);
                formMessage.innerHTML = `<div class="bg-amber-500/20 border border-amber-500 text-amber-400 px-6 py-4 rounded-lg flex items-center gap-3"><i class="fas fa-exclamation-triangle text-xl"></i><span>Please wait ${remainingSec} seconds before sending another message.</span></div>`;
                formMessage.classList.remove('hidden');
                setTimeout(() => formMessage.classList.add('hidden'), 5000);
                generateCaptcha();
                return;
            }

            btnText.textContent = 'Sending...';
            if (btnIcon) btnIcon.classList.add('hidden');
            if (btnLoading) btnLoading.classList.remove('hidden');

            // Send via Netlify Forms Native Endpoint (Blocks automated script requests)
            fetch("/", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams(fd).toString()
            }).catch(err => console.log('Netlify Form fetch error:', err));

            const templateParams = {
                from_name: fd.get('name'),
                email: fd.get('email'),
                subject: fd.get('subject'),
                message: fd.get('message'),
            };

            emailjs.send('service_gcp6qrd', 'template_8gl5u4h', templateParams)
                .then(function () {
                    localStorage.setItem('last_contact_submit', Date.now().toString());
                    formMessage.innerHTML = '<div class="success-message bg-green-500/20 border border-green-500 text-green-400 px-6 py-4 rounded-lg flex items-center gap-3"><i class="fas fa-check-circle text-xl"></i><span>Message sent successfully! I\'ll get back to you soon.</span></div>';
                    formMessage.classList.remove('hidden');
                    contactForm.reset();
                    generateCaptcha();
                    setTimeout(() => formMessage.classList.add('hidden'), 5000);
                })
                .catch(function (error) {
                    formMessage.innerHTML = '<div class="bg-red-500/20 border border-red-500 text-red-400 px-6 py-4 rounded-lg flex items-center gap-3"><i class="fas fa-exclamation-circle text-xl"></i><span>Something went wrong. Please try again or email directly.</span></div>';
                    formMessage.classList.remove('hidden');
                    console.error('EmailJS error:', error);
                    setTimeout(() => formMessage.classList.add('hidden'), 5000);
                })
                .finally(function () {
                    btnText.textContent = 'Send Message';
                    if (btnIcon) btnIcon.classList.remove('hidden');
                    if (btnLoading) btnLoading.classList.add('hidden');
                });
        });
    }
});

/* =============================================
   PARTICLE CANVAS ANIMATION
   ============================================= */
function initParticleCanvas() {
    let canvas = document.getElementById('particle-canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'particle-canvas';
        document.body.prepend(canvas);
    }

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(Math.floor(width / 20), 55);

    const colors = ['rgba(255, 107, 53,', 'rgba(0, 210, 255,', 'rgba(255, 180, 162,'];

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2.2 + 1,
            colorPrefix: colors[Math.floor(Math.random() * colors.length)],
            alpha: Math.random() * 0.45 + 0.15,
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            // Cursor interaction
            const dxMouse = mouseX - p.x;
            const dyMouse = mouseY - p.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            
            if (distMouse < 120) {
                p.x -= (dxMouse / distMouse) * 0.4;
                p.y -= (dyMouse / distMouse) * 0.4;
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${p.colorPrefix} ${p.alpha})`;
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 140) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(255, 107, 53, ${0.18 * (1 - dist / 140)})`;
                    ctx.lineWidth = 0.7;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }
    animate();
}



/* =============================================
   ANIMATED COUNTERS FOR KEY METRICS
   ============================================= */
function animateCounters() {
    const counterElements = document.querySelectorAll('.counter-val');
    counterElements.forEach(el => {
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const prefix = el.getAttribute('data-prefix') || '';
        const duration = 1800; // ms
        const startTime = performance.now();

        function update(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease Out Cubic
            const currentVal = Math.floor(easeProgress * target);
            el.textContent = `${prefix}${currentVal}${suffix}`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.textContent = `${prefix}${target}${suffix}`;
            }
        }
        requestAnimationFrame(update);
    });
}

/* =============================================
   FILTER PROJECTS FUNCTION
   ============================================= */
function filterProjects(category) {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active-filter');
        btn.style.background = '';
        btn.style.color = '';
        btn.style.borderColor = '';
    });
    const targetBtn = document.querySelector('[data-filter="' + category + '"]');
    if (targetBtn) {
        targetBtn.classList.add('active-filter');
    }

    document.querySelectorAll('#projects-grid > div').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = '';
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity .4s ease, transform .4s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.style.display = 'none';
        }
    });
}

/* =============================================
   TOAST NOTIFICATION & COPY HELPER
   ============================================= */
function showToast(message) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fas fa-check-circle text-accent"></i> <span>${message}</span>`;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function copyEmail(email) {
    const targetEmail = email || 'orroshidmdmamun50@gmail.com';
    navigator.clipboard.writeText(targetEmail).then(() => {
        showToast('Email copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy email: ', err);
    });
}
