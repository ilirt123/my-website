const button = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

button?.addEventListener('click', () => {
  nav.classList.toggle('open');
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

const rightMenu = document.querySelector('.right-menu');
const moreToggle = document.querySelector('.more-toggle');

const closeMoreMenu = () => {
  rightMenu?.classList.remove('open');
  moreToggle?.setAttribute('aria-expanded', 'false');
};

moreToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = rightMenu.classList.toggle('open');
  moreToggle.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.more-menu a').forEach((link) => {
  link.addEventListener('click', closeMoreMenu);
});

document.addEventListener('click', (event) => {
  if (rightMenu && !rightMenu.contains(event.target)) {
    closeMoreMenu();
  }
});

const reviewList = document.querySelector('.google-review-list');
const previousReview = document.querySelector('.review-prev');
const nextReview = document.querySelector('.review-next');

const scrollReviews = (direction) => {
  if (!reviewList) return;
  const card = reviewList.querySelector('.google-review-card');
  const distance = card ? card.offsetWidth + 22 : 340;
  reviewList.scrollBy({ left: direction * distance, behavior: 'smooth' });
};

previousReview?.addEventListener('click', () => scrollReviews(-1));
nextReview?.addEventListener('click', () => scrollReviews(1));

const quoteSection = document.querySelector('#quote');
const quoteHeading = document.querySelector('#quote .quote-copy h2');
const quickQuoteBar = document.querySelector('.quick-quote-bar');

if (quoteSection && quoteHeading && quickQuoteBar) {
  const quoteObserver = new IntersectionObserver(
    ([entry]) => {
      quickQuoteBar.classList.toggle('visible', entry.isIntersecting);
    },
    { threshold: 0.6 }
  );

  quoteObserver.observe(quoteHeading);

  quickQuoteBar.addEventListener('submit', (event) => {
    event.preventDefault();
    quoteSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

const lightbox = document.querySelector('.image-lightbox');
const lightboxImage = lightbox?.querySelector('img');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxZoomIn = document.querySelector('.lightbox-zoom-in');
const lightboxZoomOut = document.querySelector('.lightbox-zoom-out');
const lightboxPrev = document.querySelector('.lightbox-prev');
const lightboxNext = document.querySelector('.lightbox-next');
let galleryImages = [];
let lightboxZoom = 1;
let lightboxIndex = 0;

const closeLightbox = () => {
  lightbox?.classList.remove('open');
  lightbox?.setAttribute('aria-hidden', 'true');
  lightboxZoom = 1;
  if (lightboxImage) {
    lightboxImage.src = '';
    lightboxImage.alt = '';
    lightboxImage.style.transform = 'scale(1)';
  }
};

const setLightboxZoom = (zoom) => {
  lightboxZoom = Math.min(2.5, Math.max(0.7, zoom));
  if (lightboxImage) {
    lightboxImage.style.transform = `scale(${lightboxZoom})`;
  }
};

const showLightboxImage = (index) => {
  if (!lightboxImage || !galleryImages.length) return;
  lightboxIndex = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[lightboxIndex];
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  setLightboxZoom(1);
};

const setupLightboxGroup = (selector) => {
  const groupImages = Array.from(document.querySelectorAll(selector));
  groupImages.forEach((image, index) => {
    image.addEventListener('click', () => {
      if (!lightbox || !lightboxImage) return;
      galleryImages = groupImages;
      showLightboxImage(index);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
    });
  });
};

setupLightboxGroup('.service-card img');
setupLightboxGroup('.bathroom-card img');
setupLightboxGroup('.bathroom-gallery img');

lightboxClose?.addEventListener('click', closeLightbox);
lightboxZoomIn?.addEventListener('click', () => setLightboxZoom(lightboxZoom + 0.2));
lightboxZoomOut?.addEventListener('click', () => setLightboxZoom(lightboxZoom - 0.2));
lightboxPrev?.addEventListener('click', () => showLightboxImage(lightboxIndex - 1));
lightboxNext?.addEventListener('click', () => showLightboxImage(lightboxIndex + 1));

lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closeLightbox();
  }
  if (!lightbox?.classList.contains('open')) return;
  if (event.key === 'ArrowLeft') {
    showLightboxImage(lightboxIndex - 1);
  }
  if (event.key === 'ArrowRight') {
    showLightboxImage(lightboxIndex + 1);
  }
});
