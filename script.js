/*==========================
ANIMATION AU SCROLL
==========================*/
// Ajoute .show à chaque <section> quand elle entre dans le viewport
const sections = document.querySelectorAll('section');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      sectionObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

sections.forEach(section => sectionObserver.observe(section));


/*==========================
MENU ACTIF
==========================*/
// Met en surbrillance le lien du menu correspondant à la section visible
const navLinks = document.querySelectorAll('nav a');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}, { threshold: 0.5 });

sections.forEach(section => {
  if (section.id) navObserver.observe(section);
});


/*==========================
BOUTON RETOUR EN HAUT
==========================*/
const topButton = document.getElementById('topButton');

window.addEventListener('scroll', () => {
  topButton.style.display = window.scrollY > 400 ? 'block' : 'none';
});

topButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/*==========================
ÉTOILES ANIMÉES (fonction réutilisable)
==========================*/
function initStarField(canvasId, containerSelector, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const container = containerSelector
    ? canvas.closest(containerSelector)
    : canvas.parentElement;

  let stars = [];
  let width, height;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const density = options.density || 22000;
  const minCount = options.minCount || 24;

  function resize() {
    width = container.offsetWidth;
    height = container.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    createStars();
  }

  function createStars() {
    const count = Math.max(minCount, Math.floor((width * height) / density));
    stars = Array.from({ length: count }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.8 + 0.6,
      speedX: (Math.random() - 0.5) * 0.15,
      speedY: (Math.random() - 0.5) * 0.15,
      twinkleSpeed: Math.random() * 0.015 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
      colorChoice: Math.random() < 0.5 ? 'accent' : 'blueprint'
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    stars.forEach(star => {
      star.x += star.speedX;
      star.y += star.speedY;

      if (star.x < 0) star.x = width;
      if (star.x > width) star.x = 0;
      if (star.y < 0) star.y = height;
      if (star.y > height) star.y = 0;

      star.twinklePhase += star.twinkleSpeed;
      const twinkle = (Math.sin(star.twinklePhase) + 1) / 2;
      const opacity = 0.15 + twinkle * 0.45;

      const color = star.colorChoice === 'accent'
        ? `rgba(224, 52, 138, ${opacity})`
        : `rgba(122, 95, 176, ${opacity})`;

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);

  if (!prefersReducedMotion) {
    draw();
  } else {
    ctx.clearRect(0, 0, width, height);
    stars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(122, 95, 176, 0.3)';
      ctx.fill();
    });
  }
}

// Étoiles du hero (arrière-plan discret)
initStarField('starsCanvas', '.hero');

// Étoiles autour de la photo de profil
initStarField('photoStarsCanvas', '.hero-photo-wrap', { density: 5500, minCount: 18 });

// Étoiles de l'écran d'introduction (plus denses)
initStarField('introStarsCanvas', '.intro-screen', { density: 9000, minCount: 50 });


/*==========================
ÉCRAN D'INTRODUCTION
==========================*/
document.body.classList.add('no-scroll');

const introScreen = document.getElementById('introScreen');
const INTRO_DURATION = 2600; // durée d'affichage en ms avant disparition

function hideIntro() {
  if (!introScreen) return;
  introScreen.classList.add('hide');
  document.body.classList.remove('no-scroll');
}

setTimeout(hideIntro, INTRO_DURATION);

// Permet aussi de passer l'intro en cliquant dessus
if (introScreen) {
  introScreen.addEventListener('click', hideIntro);
}


/*==========================
FORMULAIRE DE CONTACT
==========================*/
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');
const thankYouScreen = document.getElementById('thankYouScreen');
const FORM_AJAX_ENDPOINT = 'https://formsubmit.co/ajax/hamzababsaaid08@gmail.com';

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.btn-submit');
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.disabled = true;

    contactStatus.textContent = '';
    contactStatus.className = 'contact-status';

    const formData = new FormData(contactForm);

    try {
      const response = await fetch(FORM_AJAX_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      if (!response.ok) throw new Error('Échec de l\'envoi');

      // Succès : afficher l'écran de remerciement animé
      contactForm.reset();
      showThankYouScreen();

    } catch (error) {
      contactStatus.textContent = "Une erreur est survenue. Réessaie, ou écris directement à hamzababsaaid08@gmail.com.";
      contactStatus.className = 'contact-status error';
    } finally {
      submitBtn.textContent = originalBtnText;
      submitBtn.disabled = false;
    }
  });
}

function showThankYouScreen() {
  if (!thankYouScreen) return;
  document.body.classList.add('no-scroll');
  thankYouScreen.classList.add('show');

  setTimeout(() => {
    thankYouScreen.classList.remove('show');
    document.body.classList.remove('no-scroll');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 3200);
}


/*==========================
LOGO ENSEM — DÉPLACEMENT ALÉATOIRE AU CLIC
==========================*/
(function () {
  const logo = document.getElementById('ensemFloatLogo');
  const section = document.getElementById('profil');
  if (!logo || !section) return;

  function moveLogoRandom() {
    const sectionWidth = section.clientWidth;
    const sectionHeight = section.clientHeight;
    const logoWidth = logo.offsetWidth || 86;
    const logoHeight = logo.offsetHeight || 86;

    // Zone autorisée : partie droite de la section, en dehors du texte
    const minLeftPercent = 0.62; // 62% de la largeur -> ne touche jamais le texte (max 760px de large)
    const minLeft = sectionWidth * minLeftPercent;
    const maxLeft = Math.max(minLeft, sectionWidth - logoWidth - 24);

    const minTop = 16;
    const maxTop = Math.max(minTop, sectionHeight - logoHeight - 16);

    const randomLeft = minLeft + Math.random() * Math.max(0, maxLeft - minLeft);
    const randomTop = minTop + Math.random() * Math.max(0, maxTop - minTop);

    logo.style.left = randomLeft + 'px';
    logo.style.top = randomTop + 'px';
  }

  logo.addEventListener('click', moveLogoRandom);

  // Position initiale + repositionnement si la fenêtre change de taille
  window.addEventListener('load', moveLogoRandom);
  window.addEventListener('resize', moveLogoRandom);
  moveLogoRandom();
})();


/*==========================
BARRES DE NIVEAU DE LANGUE
==========================*/
const langFills = document.querySelectorAll('.lang-fill');

const langObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      el.style.width = el.dataset.fill + '%';
      langObserver.unobserve(el);
    }
  });
}, { threshold: 0.4 });

langFills.forEach(el => langObserver.observe(el));