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
/* =============================================
   COSMIC DEEP SPACE & ASTEROID CANVAS ANIMATION
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
        initSpaceElements();
    });

    let stars = [];
    let asteroids = [];
    let shootingStars = [];

    function createAsteroid(x, y) {
        const radius = Math.random() * 7 + 5; // 5px to 12px size
        const numPoints = Math.floor(Math.random() * 3) + 5; // 5 to 7 irregular vertices
        const points = [];
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const dist = radius * (0.7 + Math.random() * 0.5);
            points.push({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
        }
        return {
            x: x !== undefined ? x : Math.random() * width,
            y: y !== undefined ? y : Math.random() * height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius,
            points,
            angle: Math.random() * Math.PI * 2,
            vAngle: (Math.random() - 0.5) * 0.012, // rotation speed
            color: Math.random() > 0.4 ? 'rgba(242, 125, 82, 0.35)' : 'rgba(244, 162, 97, 0.35)'
        };
    }

    function initSpaceElements() {
        stars = [];
        asteroids = [];
        shootingStars = [];

        // 1. Generate Deep Space Stars
        const starCount = Math.min(Math.floor(width / 12), 110);
        const starColors = [
            'rgba(255, 255, 255,',   // Icy White
            'rgba(242, 125, 82,',    // Soft Warm Terracotta
            'rgba(244, 162, 97,',    // Muted Peach
            'rgba(224, 122, 95,'     // Soft Coral
        ];

        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                radius: Math.random() * 1.8 + 0.6,
                colorPrefix: starColors[Math.floor(Math.random() * starColors.length)],
                baseAlpha: Math.random() * 0.45 + 0.2,
                twinkleSpeed: Math.random() * 0.03 + 0.008,
                twinklePhase: Math.random() * Math.PI * 2
            });
        }

        // 2. Generate Drifting Asteroids/Space Rocks
        const asteroidCount = Math.min(Math.floor(width / 180), 8);
        for (let i = 0; i < asteroidCount; i++) {
            asteroids.push(createAsteroid());
        }
    }

    // 3. Spawn Shooting Stars periodically
    function spawnShootingStar() {
        if (shootingStars.length < 2 && Math.random() < 0.012) {
            shootingStars.push({
                x: Math.random() * width * 0.8,
                y: Math.random() * height * 0.4,
                length: Math.random() * 90 + 60,
                speed: Math.random() * 7 + 5,
                angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2, // ~45 deg downward slope
                alpha: 1,
                width: Math.random() * 1.5 + 1
            });
        }
    }

    initSpaceElements();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // A. Draw & Update Deep Space Stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];

            // Twinkle effect
            s.twinklePhase += s.twinkleSpeed;
            const currentAlpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.22;

            // Cursor interaction (gentle repulsion)
            const dxMouse = mouseX - s.x;
            const dyMouse = mouseY - s.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < 100) {
                s.x -= (dxMouse / distMouse) * 0.3;
                s.y -= (dyMouse / distMouse) * 0.3;
            }

            s.x += s.vx;
            s.y += s.vy;

            if (s.x < 0) s.x = width;
            if (s.x > width) s.x = 0;
            if (s.y < 0) s.y = height;
            if (s.y > height) s.y = 0;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
            ctx.fillStyle = `${s.colorPrefix} ${Math.max(0.1, currentAlpha)})`;
            ctx.fill();

            // Constellation Laser Connections between nearby stars
            for (let j = i + 1; j < stars.length; j++) {
                const s2 = stars[j];
                const dx = s.x - s2.x;
                const dy = s.y - s2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(s.x, s.y);
                    ctx.lineTo(s2.x, s2.y);
                    ctx.strokeStyle = `rgba(255, 107, 53, ${0.12 * (1 - dist / 120)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // B. Draw & Update Drifting Asteroids (Space Rocks)
        for (let i = 0; i < asteroids.length; i++) {
            const ast = asteroids[i];

            // Cursor reaction
            const dxMouse = mouseX - ast.x;
            const dyMouse = mouseY - ast.y;
            const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distMouse < 140) {
                ast.x -= (dxMouse / distMouse) * 0.4;
                ast.y -= (dyMouse / distMouse) * 0.4;
            }

            ast.x += ast.vx;
            ast.y += ast.vy;
            ast.angle += ast.vAngle;

            if (ast.x < -30) ast.x = width + 30;
            if (ast.x > width + 30) ast.x = -30;
            if (ast.y < -30) ast.y = height + 30;
            if (ast.y > height + 30) ast.y = -30;

            // Render Asteroid Polygon
            ctx.save();
            ctx.translate(ast.x, ast.y);
            ctx.rotate(ast.angle);

            ctx.beginPath();
            ctx.moveTo(ast.points[0].x, ast.points[0].y);
            for (let p = 1; p < ast.points.length; p++) {
                ctx.lineTo(ast.points[p].x, ast.points[p].y);
            }
            ctx.closePath();

            ctx.strokeStyle = ast.color;
            ctx.lineWidth = 1.2;
            ctx.fillStyle = 'rgba(10, 14, 39, 0.4)';
            ctx.fill();
            ctx.stroke();

            // Inner crater/rock detail dot
            ctx.beginPath();
            ctx.arc(ast.radius * 0.3, -ast.radius * 0.2, 1.2, 0, Math.PI * 2);
            ctx.fillStyle = ast.color;
            ctx.fill();

            ctx.restore();
        }

        // C. Draw & Update Shooting Meteors (খসে পড়া তারা / উল্কাপাত)
        spawnShootingStar();
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ms = shootingStars[i];
            const tailX = ms.x - Math.cos(ms.angle) * ms.length;
            const tailY = ms.y - Math.sin(ms.angle) * ms.length;

            const grad = ctx.createLinearGradient(ms.x, ms.y, tailX, tailY);
            grad.addColorStop(0, `rgba(255, 255, 255, ${ms.alpha})`);
            grad.addColorStop(0.3, `rgba(255, 107, 53, ${ms.alpha * 0.7})`);
            grad.addColorStop(1, `rgba(0, 210, 255, 0)`);

            ctx.beginPath();
            ctx.moveTo(ms.x, ms.y);
            ctx.lineTo(tailX, tailY);
            ctx.strokeStyle = grad;
            ctx.lineWidth = ms.width;
            ctx.stroke();

            ms.x += Math.cos(ms.angle) * ms.speed;
            ms.y += Math.sin(ms.angle) * ms.speed;
            ms.alpha -= 0.012;

            if (ms.alpha <= 0 || ms.x > width + 100 || ms.y > height + 100) {
                shootingStars.splice(i, 1);
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
        btn.classList.remove('active-filter', 'border-accent/40', 'bg-accent/10', 'text-accent', 'font-semibold');
        btn.classList.add('text-cream/40', 'border-transparent');
    });

    const targetBtn = document.querySelector('[data-filter="' + category + '"]');
    if (targetBtn) {
        targetBtn.classList.remove('text-cream/40', 'border-transparent');
        targetBtn.classList.add('active-filter', 'border-accent/40', 'bg-accent/10', 'text-accent', 'font-semibold');
    }

    document.querySelectorAll('#projects-grid > div').forEach(card => {
        if (card.dataset.category === category) {
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

/* =============================================
   EMAIL ACTION MODAL HANDLER
   ============================================= */
function openEmailModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = document.getElementById('email-modal');
    const card = document.getElementById('email-modal-card');
    if (modal && card) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
    }
}

function closeEmailModal() {
    const modal = document.getElementById('email-modal');
    const card = document.getElementById('email-modal-card');
    if (modal && card) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-100');
        card.classList.add('scale-95');
    }
}

/* =============================================
   RESUME VIEWER MODAL HANDLER
   ============================================= */
function openResumeModal(e) {
    if (e && e.preventDefault) e.preventDefault();
    const modal = document.getElementById('resume-modal');
    const card = document.getElementById('resume-modal-card');
    if (modal && card) {
        modal.classList.remove('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-95');
        card.classList.add('scale-100');
        document.body.style.overflow = 'hidden';
    }
}

function closeResumeModal() {
    const modal = document.getElementById('resume-modal');
    const card = document.getElementById('resume-modal-card');
    if (modal && card) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        card.classList.remove('scale-100');
        card.classList.add('scale-95');
        document.body.style.overflow = '';
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeEmailModal();
        closeResumeModal();
    }
});
