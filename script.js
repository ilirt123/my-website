console.log("SCRIPT LOADED");

const button = document.querySelector('.topbar .menu-toggle');
const nav = document.querySelector('#primary-navigation');
const rightMenu = document.querySelector('.right-menu');
const moreToggle = document.querySelector('.right-menu .more-toggle');

const setMenuButtonState = (isOpen) => {
  button?.setAttribute('aria-expanded', String(isOpen));
  button?.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
};

const closePrimaryMenu = () => {
  nav?.classList.remove('open');
  setMenuButtonState(false);
};

const closeMoreMenu = () => {
  rightMenu?.classList.remove('open');
  moreToggle?.setAttribute('aria-expanded', 'false');
  setMenuButtonState(false);
};

button?.addEventListener('click', (event) => {
  if (window.innerWidth > 900) {
    event.stopPropagation();
    nav?.classList.remove('open');
    const isOpen = rightMenu?.classList.toggle('open') ?? false;
    setMenuButtonState(isOpen);
    return;
  }

  closeMoreMenu();
  const isOpen = nav?.classList.toggle('open') ?? false;
  setMenuButtonState(isOpen);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePrimaryMenu();
    closeMoreMenu();
  }
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', closePrimaryMenu);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 900) {
    closePrimaryMenu();
  } else {
    closeMoreMenu();
  }
});

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

  if (window.innerWidth <= 900 && nav?.classList.contains('open') && !nav.contains(event.target) && !button?.contains(event.target)) {
    closePrimaryMenu();
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

const carousels = Array.from(document.querySelectorAll('[data-carousel]'));

const getCardsPerView = () => {
  if (window.matchMedia('(max-width: 600px)').matches) return 1;
  if (window.matchMedia('(max-width: 900px)').matches) return 2;
  return 3;
};

const setupCarousel = (carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const cards = Array.from(track?.children || []);
  const previous = carousel.querySelector('.carousel-prev');
  const next = carousel.querySelector('.carousel-next');
  const dots = carousel.querySelector('.carousel-dots');
  let index = 0;
  let cardsPerView = getCardsPerView();
  const rows = Number(carousel.dataset.carouselRows || 1);
  const isGroupedCarousel = rows > 1;
  let startX = 0;
  let dragDelta = 0;
  let didDrag = false;

  if (!track || !cards.length) return;

  const cardsPerPage = () => cardsPerView * rows;
  const pageCount = () => Math.max(1, Math.ceil(cards.length / cardsPerPage()));
  const maxIndex = () => isGroupedCarousel ? pageCount() - 1 : Math.max(0, cards.length - cardsPerView);

  const cardStep = () => {
    const gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return cards[0].getBoundingClientRect().width + gap;
  };

  const renderDots = () => {
    if (!dots) return;
    const pages = pageCount();
    dots.innerHTML = '';
    for (let page = 0; page < pages; page += 1) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', `Go to slide ${page + 1}`);
      dot.addEventListener('click', () => {
        index = isGroupedCarousel ? Math.min(page, maxIndex()) : Math.min(page * cardsPerView, maxIndex());
        updateCarousel();
      });
      dots.appendChild(dot);
    }
  };

  const updateDots = () => {
    if (!dots) return;
    const activePage = Math.min(isGroupedCarousel ? index : Math.floor(index / cardsPerView), dots.children.length - 1);
    Array.from(dots.children).forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === activePage);
      dot.setAttribute('aria-current', dotIndex === activePage ? 'true' : 'false');
    });
  };

  function updateCarousel() {
    index = Math.min(Math.max(index, 0), maxIndex());
    const columnsToMove = isGroupedCarousel ? index * cardsPerView : index;
    track.style.transform = `translate3d(${-columnsToMove * cardStep()}px, 0, 0)`;
    previous?.toggleAttribute('disabled', index === 0);
    next?.toggleAttribute('disabled', index === maxIndex());
    updateDots();
  }

  const move = (direction) => {
    index += direction;
    updateCarousel();
  };

  previous?.addEventListener('click', () => move(-1));
  next?.addEventListener('click', () => move(1));

  track.addEventListener('pointerdown', (event) => {
    startX = event.clientX;
    dragDelta = 0;
    didDrag = false;
    track.setPointerCapture?.(event.pointerId);
  });

  track.addEventListener('pointermove', (event) => {
    if (!startX) return;
    dragDelta = event.clientX - startX;
    if (Math.abs(dragDelta) > 8) didDrag = true;
  });

  track.addEventListener('pointerup', () => {
    if (Math.abs(dragDelta) > 45) {
      move(dragDelta < 0 ? 1 : -1);
    }
    startX = 0;
    dragDelta = 0;
    window.setTimeout(() => {
      didDrag = false;
    }, 0);
  });

  carousel.addEventListener('click', (event) => {
    if (didDrag) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  const refresh = () => {
    cardsPerView = getCardsPerView();
    carousel.style.setProperty('--cards-per-view', cardsPerView);
    index = Math.min(index, maxIndex());
    renderDots();
    updateCarousel();
  };

  refresh();
  return refresh;
};

const refreshCarousels = carousels.map(setupCarousel).filter(Boolean);
window.addEventListener('resize', () => {
  refreshCarousels.forEach((refresh) => refresh());
});

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

const quoteForm = document.querySelector('.quote-form');
const quoteFormMessage = quoteForm?.querySelector('.form-message');

const requiredLeadFields = ['firstName', 'lastName', 'email', 'phone', 'projectType', 'serviceNeeded', 'message'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const setQuoteFormMessage = (message, type = 'error') => {
  if (!quoteFormMessage) return;
  quoteFormMessage.textContent = message;
  quoteFormMessage.className = `form-message visible ${type}`;
};

const clearQuoteFormMessage = () => {
  if (!quoteFormMessage) return;
  quoteFormMessage.textContent = '';
  quoteFormMessage.className = 'form-message';
};

const getLeadField = (name) => quoteForm?.elements.namedItem(name);

const validateQuoteForm = () => {
  let isValid = true;

  requiredLeadFields.forEach((name) => {
    const field = getLeadField(name);
    const value = field?.value?.trim() ?? '';
    const fieldValid = value.length > 0;
    field?.setAttribute('aria-invalid', String(!fieldValid));
    if (!fieldValid) isValid = false;
  });

  const emailField = getLeadField('email');
  const email = emailField?.value?.trim() ?? '';
  if (email && !emailPattern.test(email)) {
    emailField?.setAttribute('aria-invalid', 'true');
    setQuoteFormMessage('Please enter a valid email address.');
    return false;
  }

  if (!isValid) {
    setQuoteFormMessage('Please complete all required fields.');
  }

  return isValid;
};

quoteForm?.addEventListener('input', (event) => {
  const field = event.target;
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
    field.setAttribute('aria-invalid', 'false');
  }
  clearQuoteFormMessage();
});

quoteForm?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!quoteForm || !validateQuoteForm()) return;

  const submitButton = quoteForm.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent ?? '';
  submitButton?.setAttribute('disabled', 'true');
  if (submitButton) submitButton.textContent = 'Sending...';
  clearQuoteFormMessage();

  const payload = Object.fromEntries(new FormData(quoteForm).entries());

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Lead request failed');
    }

    setQuoteFormMessage('Thank you! Your request was sent. We will contact you soon.', 'success');
    quoteForm.reset();
  } catch (error) {
    setQuoteFormMessage('Sorry, your request could not be sent. Please call us at 734-657-7965.');
  } finally {
    submitButton?.removeAttribute('disabled');
    if (submitButton) submitButton.textContent = originalButtonText;
  }
});

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
let lightboxStartX = 0;
let lightboxDragDelta = 0;
const lightboxGroups = new Map();

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

const openLightboxImages = (images, index) => {
  if (!lightbox || !lightboxImage || !images.length) return;
  galleryImages = images;
  showLightboxImage(index);
  lightbox.classList.add('open');
  lightbox.setAttribute('aria-hidden', 'false');
};

const openLightboxGroup = (groupName, index) => {
  const groupImages = lightboxGroups.get(groupName) || [];
  openLightboxImages(groupImages, index);
};

const setupLightboxGroup = (selectorOrImages, groupName) => {
  const groupImages = typeof selectorOrImages === 'string'
    ? Array.from(document.querySelectorAll(selectorOrImages))
    : Array.from(selectorOrImages || []);

  if (!groupImages.length || !groupName) return;
  lightboxGroups.set(groupName, groupImages);

  groupImages.forEach((image, index) => {
    const trigger = image.closest('.project-tile') || image;
    trigger.dataset.lightboxGroup = groupName;
    trigger.dataset.lightboxIndex = String(index);
  });
};

const setupRecentProjectsGalleryLightbox = () => {
  const recentProjectsImages = Array.from(document.querySelectorAll('#bathroom-gallery .bathroom-gallery .gallery-photo img'));
  if (!recentProjectsImages.length) return;

  lightboxGroups.set('recent-projects-gallery', recentProjectsImages);

  recentProjectsImages.forEach((image, index) => {
    image.style.cursor = 'zoom-in';
    image.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openLightboxImages(recentProjectsImages, index);
    }, true);
  });
};

const setupProjectGalleryLightbox = () => {
  const projectImages = Array.from(document.querySelectorAll('#projects .project-grid .project-tile img'));
  if (!projectImages.length) return;

  lightboxGroups.set('projects', projectImages);

  projectImages.forEach((image, index) => {
    const tile = image.closest('.project-tile') || image;
    tile.dataset.lightboxGroup = 'projects';
    tile.dataset.lightboxIndex = String(index);
    tile.style.cursor = 'zoom-in';
    image.style.cursor = 'zoom-in';

    tile.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openLightboxImages(projectImages, index);
    }, true);
  });
};

setupLightboxGroup('.service-card img', 'services');
document.querySelectorAll('.bathroom-card').forEach((card, cardIndex) => {
  setupLightboxGroup(card.querySelectorAll('img'), `bathroom-card-${cardIndex}`);
});
setupRecentProjectsGalleryLightbox();
setupProjectGalleryLightbox();

document.addEventListener('click', (event) => {
  const recentImage = event.target.closest('#bathroom-gallery .bathroom-gallery .gallery-photo img');
  if (recentImage) {
    const recentImages = lightboxGroups.get('recent-projects-gallery') || [];
    const recentIndex = recentImages.indexOf(recentImage);
    if (recentIndex >= 0) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openLightboxImages(recentImages, recentIndex);
    }
    return;
  }

  const projectTrigger = event.target.closest('#projects .project-grid .project-tile');
  if (projectTrigger) {
    const projectImages = lightboxGroups.get('projects') || [];
    const projectImage = projectTrigger.querySelector('img');
    const projectIndex = projectImages.indexOf(projectImage);
    if (projectIndex >= 0) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openLightboxImages(projectImages, projectIndex);
    }
  }
}, true);

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-lightbox-group][data-lightbox-index]');
  if (!trigger) return;
  event.preventDefault();
  event.stopPropagation();
  openLightboxGroup(trigger.dataset.lightboxGroup, Number(trigger.dataset.lightboxIndex));
}, true);

lightboxClose?.addEventListener('click', closeLightbox);
lightboxZoomIn?.addEventListener('click', () => setLightboxZoom(lightboxZoom + 0.2));
lightboxZoomOut?.addEventListener('click', () => setLightboxZoom(lightboxZoom - 0.2));
lightboxPrev?.addEventListener('click', () => showLightboxImage(lightboxIndex - 1));
lightboxNext?.addEventListener('click', () => showLightboxImage(lightboxIndex + 1));

lightboxImage?.addEventListener('pointerdown', (event) => {
  lightboxStartX = event.clientX;
  lightboxDragDelta = 0;
  lightboxImage.setPointerCapture?.(event.pointerId);
});

lightboxImage?.addEventListener('pointermove', (event) => {
  if (!lightboxStartX) return;
  lightboxDragDelta = event.clientX - lightboxStartX;
});

lightboxImage?.addEventListener('pointerup', () => {
  if (Math.abs(lightboxDragDelta) > 45) {
    showLightboxImage(lightboxIndex + (lightboxDragDelta < 0 ? 1 : -1));
  }
  lightboxStartX = 0;
  lightboxDragDelta = 0;
});

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

const backToTopButton = document.querySelector('.back-to-top');

const updateBackToTopButton = () => {
  backToTopButton?.classList.toggle('visible', window.scrollY > 300);
};

backToTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

window.addEventListener('scroll', updateBackToTopButton, { passive: true });
updateBackToTopButton();
