const button = document.querySelector('.topbar .menu-toggle');
const nav = document.querySelector('#primary-navigation');
const rightMenu = document.querySelector('.right-menu');
const moreToggle = document.querySelector('.right-menu .more-toggle');
const searchToggle = document.querySelector('.search-toggle');
const siteSearch = document.querySelector('#site-search');
const siteSearchInput = document.querySelector('#site-search-input');
const siteSearchResults = document.querySelector('.site-search-results');
const siteSearchClose = document.querySelector('.site-search-close');
const submenuToggles = document.querySelectorAll('.submenu-toggle, .more-menu-toggle');
const desktopBathroomsDropdown = document.querySelector('.desktop-nav .bathrooms-dropdown');
const desktopBathroomsTrigger = desktopBathroomsDropdown?.querySelector('.nav-dropdown-trigger');
const hero = document.querySelector('.hero');

const heroImages = [
  'assets/bathroom-gallery-01.jpg',
  'assets/bathroom-gallery-03.jpg',
  'assets/bathroom-gallery-04.jpg',
  'assets/bathroom-gallery-05.jpg',
  'assets/bathroom-gallery-10.jpg',
  'assets/bathroom-gallery-12.jpg',
  'assets/bathroom-gallery-14.jpg',
  'assets/bathroom-gallery-18.jpg',
  'assets/bathroom-gallery-24.jpg',
  'assets/bathroom-gallery-31.jpeg'
];

const setupHeroRotation = () => {
  if (!hero || heroImages.length < 2) return;

  heroImages.forEach((src) => {
    const image = new Image();
    image.src = src;
  });

  const layers = [document.createElement('div'), document.createElement('div')];
  layers.forEach((layer, index) => {
    layer.className = `hero-bg-layer${index === 0 ? ' active' : ''}`;
    layer.style.backgroundImage = `url("${heroImages[index]}")`;
    hero.prepend(layer);
  });

  let imageIndex = 0;
  let activeLayer = 0;

  window.setInterval(() => {
    imageIndex = (imageIndex + 1) % heroImages.length;
    activeLayer = activeLayer === 0 ? 1 : 0;
    const nextLayer = layers[activeLayer];
    const previousLayer = layers[activeLayer === 0 ? 1 : 0];
    nextLayer.style.backgroundImage = `url("${heroImages[imageIndex]}")`;
    nextLayer.classList.add('active');
    previousLayer.classList.remove('active');
  }, 5000);
};

setupHeroRotation();

const setMenuButtonState = (isOpen) => {
  button?.setAttribute('aria-expanded', String(isOpen));
  button?.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
};

const closeSubmenus = (container = document) => {
  container.querySelectorAll('.mobile-nav-group.open, .more-nav-group.open').forEach((group) => {
    group.classList.remove('open');
    group.querySelector('.submenu-toggle, .more-menu-toggle')?.setAttribute('aria-expanded', 'false');
  });
};

const closePrimaryMenu = () => {
  nav?.classList.remove('open');
  if (nav) closeSubmenus(nav);
  setMenuButtonState(false);
};

const closeMoreMenu = () => {
  rightMenu?.classList.remove('open');
  if (rightMenu) closeSubmenus(rightMenu);
  moreToggle?.setAttribute('aria-expanded', 'false');
  setMenuButtonState(false);
};

const closeDesktopBathroomsDropdown = () => {
  desktopBathroomsDropdown?.classList.remove('open');
  desktopBathroomsTrigger?.setAttribute('aria-expanded', 'false');
};

const toggleDesktopBathroomsDropdown = () => {
  if (!desktopBathroomsDropdown || !desktopBathroomsTrigger) return;
  const isOpen = desktopBathroomsDropdown.classList.toggle('open');
  desktopBathroomsTrigger.setAttribute('aria-expanded', String(isOpen));
};

button?.addEventListener('click', (event) => {
  if (window.innerWidth > 900) {
    event.stopPropagation();
    nav?.classList.remove('open');
    const isOpen = rightMenu?.classList.toggle('open') ?? false;
    if (isOpen && rightMenu) closeSubmenus(rightMenu);
    setMenuButtonState(isOpen);
    return;
  }

  closeMoreMenu();
  const isOpen = nav?.classList.toggle('open') ?? false;
  if (isOpen && nav) closeSubmenus(nav);
  setMenuButtonState(isOpen);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    closePrimaryMenu();
    closeMoreMenu();
    closeDesktopBathroomsDropdown();
    closeSearch();
  }
});

document.querySelectorAll('.nav a').forEach((link) => {
  link.addEventListener('click', closePrimaryMenu);
});

window.addEventListener('resize', () => {
  closeDesktopBathroomsDropdown();
  if (window.innerWidth > 900) {
    closePrimaryMenu();
  } else {
    closeMoreMenu();
  }
});

moreToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  const isOpen = rightMenu.classList.toggle('open');
  if (isOpen) closeSubmenus(rightMenu);
  moreToggle.setAttribute('aria-expanded', String(isOpen));
});

desktopBathroomsTrigger?.addEventListener('click', (event) => {
  if (window.innerWidth <= 900) return;
  event.preventDefault();
  event.stopPropagation();
  closePrimaryMenu();
  closeMoreMenu();
  toggleDesktopBathroomsDropdown();
});

desktopBathroomsDropdown?.addEventListener('mouseleave', () => {
  if (window.innerWidth > 900) closeDesktopBathroomsDropdown();
});

desktopBathroomsDropdown?.querySelectorAll('.dropdown-menu a').forEach((link) => {
  link.addEventListener('click', closeDesktopBathroomsDropdown);
});

submenuToggles.forEach((toggle) => {
  toggle.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const group = toggle.closest('.mobile-nav-group, .more-nav-group');
    if (!group) return;
    const isOpen = group.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
});

document.querySelectorAll('.more-menu a').forEach((link) => {
  link.addEventListener('click', closeMoreMenu);
});

document.addEventListener('click', (event) => {
  if (desktopBathroomsDropdown && !desktopBathroomsDropdown.contains(event.target)) {
    closeDesktopBathroomsDropdown();
  }

  if (rightMenu && !rightMenu.contains(event.target)) {
    closeMoreMenu();
  }

  if (window.innerWidth <= 900 && nav?.classList.contains('open') && !nav.contains(event.target) && !button?.contains(event.target)) {
    closePrimaryMenu();
  }
});

const siteSearchItems = [
  { title: 'Home', keywords: 'home all american tiles', target: '#home' },
  { title: 'Services', keywords: 'services bathroom kitchen flooring fireplace tile', target: '#services' },
  { title: 'Bathroom Services', keywords: 'bathroom services remodel tile shower half bathroom waterproofing', target: 'index.html#bathrooms' },
  { title: 'Full Bathroom', keywords: 'full bathroom remodel vanity toilet tile shower', target: 'full-bathroom.html' },
  { title: 'Shower', keywords: 'shower remodel glass shower waterproofing tile', target: 'shower.html' },
  { title: 'Half Bathroom', keywords: 'half bathroom powder room', target: 'half-bathroom.html' },
  { title: 'Tile & Waterproofing', keywords: 'tile waterproofing schluter kerdi ditra heat', target: '#bathrooms' },
  { title: 'Projects Gallery', keywords: 'gallery recent projects photos bathroom shower', target: '#bathroom-gallery' },
  { title: 'Contact / Get a Quote', keywords: 'contact quote estimate get a quote phone form', target: '#quote' },
  { title: 'Map / Service Area', keywords: 'map metro detroit plymouth service area directions', target: '#quote' },
  { title: 'Reviews', keywords: 'google reviews customer reviews', target: '#reviews' }
];

function renderSiteSearchResults(query = '') {
  if (!siteSearchResults) return;
  const normalizedQuery = query.trim().toLowerCase();
  const matches = normalizedQuery
    ? siteSearchItems.filter((item) => `${item.title} ${item.keywords}`.toLowerCase().includes(normalizedQuery))
    : siteSearchItems;

  siteSearchResults.innerHTML = '';

  if (!matches.length) {
    const empty = document.createElement('p');
    empty.className = 'site-search-empty';
    empty.textContent = 'No results found.';
    siteSearchResults.append(empty);
    return;
  }

  matches.forEach((item) => {
    const result = document.createElement('a');
    result.className = 'site-search-result';
    result.href = item.target;
    result.textContent = item.title;
    result.addEventListener('click', (event) => {
      event.preventDefault();
      if (!item.target.startsWith('#')) {
        window.location.href = item.target;
        return;
      }
      const target = document.querySelector(item.target);
      closeSearch();
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      history.pushState(null, '', item.target);
    });
    siteSearchResults.append(result);
  });
}

function openSearch() {
  if (!siteSearch) return;
  closePrimaryMenu();
  closeMoreMenu();
  siteSearch.classList.add('open');
  siteSearch.setAttribute('aria-hidden', 'false');
  searchToggle?.setAttribute('aria-expanded', 'true');
  renderSiteSearchResults(siteSearchInput?.value ?? '');
  window.setTimeout(() => siteSearchInput?.focus(), 0);
}

function closeSearch() {
  siteSearch?.classList.remove('open');
  siteSearch?.setAttribute('aria-hidden', 'true');
  searchToggle?.setAttribute('aria-expanded', 'false');
}

searchToggle?.addEventListener('click', (event) => {
  event.stopPropagation();
  if (siteSearch?.classList.contains('open')) {
    closeSearch();
  } else {
    openSearch();
  }
});

siteSearchClose?.addEventListener('click', closeSearch);
siteSearchInput?.addEventListener('input', (event) => {
  renderSiteSearchResults(event.target.value);
});
siteSearch?.addEventListener('click', (event) => {
  if (event.target === siteSearch) {
    closeSearch();
  }
});

const googleReviewReadMoreUrl = 'https://g.page/r/CXTZE2d_sM_ZEBI/review';

const escapeHtml = (value) => String(value || '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const renderGoogleStars = (rating) => {
  const starCount = Math.max(1, Math.min(5, Math.round(Number(rating) || 5)));
  return '&#9733;'.repeat(starCount);
};

const renderGoogleReviewCard = (review) => {
  const reviewerName = escapeHtml(review.reviewerName || 'Google reviewer');
  const comment = escapeHtml(review.comment || '');
  const reviewDate = review.updateTime || review.createTime
    ? new Date(review.updateTime || review.createTime).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })
    : 'Posted on Google';
  const photo = review.reviewerPhoto
    ? `<img class="reviewer-photo" src="${escapeHtml(review.reviewerPhoto)}" alt="" loading="lazy">`
    : '';

  return `
    <article class="google-review-card">
      <div class="review-card-head">
        <div class="reviewer-identity">${photo}<strong>${reviewerName}</strong></div>
        <span>${escapeHtml(reviewDate)}</span>
      </div>
      <div class="stars" aria-label="${Number(review.starRating) || 5} star rating">${renderGoogleStars(review.starRating)}</div>
      <p>${comment}</p>
    </article>
  `;
};

const showGoogleReviewsFallback = (section) => {
  const ratingCard = section.querySelector('.google-rating-card');
  if (!ratingCard || ratingCard.querySelector('.google-review-more-link')) return;

  const fallbackLink = document.createElement('a');
  fallbackLink.className = 'google-review-link google-review-more-link';
  fallbackLink.href = googleReviewReadMoreUrl;
  fallbackLink.target = '_blank';
  fallbackLink.rel = 'noopener';
  fallbackLink.textContent = 'Read More Google Reviews';
  ratingCard.appendChild(fallbackLink);
};

const loadGoogleBusinessReviews = async () => {
  const reviewSections = Array.from(document.querySelectorAll('.reviews-section'));
  if (!reviewSections.length) return;

  try {
    const response = await fetch('/api/google-reviews', { headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Google reviews API returned ${response.status}`);

    const data = await response.json();
    const reviews = Array.isArray(data.reviews) ? data.reviews.filter((review) => review.comment) : [];
    if (!reviews.length) throw new Error('Google reviews API returned no review comments.');

    reviewSections.forEach((section) => {
      const reviewList = section.querySelector('.google-review-list');
      const ratingCard = section.querySelector('.google-rating-card');
      if (!reviewList) return;

      reviewList.innerHTML = reviews.map(renderGoogleReviewCard).join('');
      reviewList.scrollTo({ left: 0 });
      ratingCard?.querySelector('strong')?.replaceChildren(document.createTextNode(`Based on ${data.totalReviewCount || reviews.length} reviews`));
      if (data.averageRating) {
        ratingCard?.querySelector('.stars')?.setAttribute('aria-label', `${Number(data.averageRating).toFixed(1)} star rating`);
      }
    });
  } catch (error) {
    reviewSections.forEach(showGoogleReviewsFallback);
  }
};

loadGoogleBusinessReviews();

document.querySelectorAll('.google-review-carousel').forEach((carousel) => {
  const reviewList = carousel.querySelector('.google-review-list');
  const previousReview = carousel.querySelector('.review-prev');
  const nextReview = carousel.querySelector('.review-next');
  if (!reviewList) return;

  const scrollReviews = (direction) => {
    const card = reviewList.querySelector('.google-review-card');
    const distance = card ? card.offsetWidth + 22 : 340;
    const maxScroll = reviewList.scrollWidth - reviewList.clientWidth - 4;
    if (direction > 0 && reviewList.scrollLeft >= maxScroll) {
      reviewList.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    reviewList.scrollBy({ left: direction * distance, behavior: 'smooth' });
  };

  previousReview?.addEventListener('click', () => scrollReviews(-1));
  nextReview?.addEventListener('click', () => scrollReviews(1));
  window.setInterval(() => scrollReviews(1), 5200);
});

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
const quoteHeading = document.querySelector('#quote .quote-map-card h2, #quote .quote-copy h2, #quote .quote-copy h3');
const quickQuoteBar = document.querySelector('.quick-quote-bar');

if (quoteSection && quoteHeading && quickQuoteBar) {
  const quoteObserver = new IntersectionObserver(
    ([entry]) => {
      quickQuoteBar.classList.toggle('visible', entry.isIntersecting);
    },
    { threshold: 0.6 }
  );

  quoteObserver.observe(quoteHeading);
}

const quoteForm = document.querySelector('.quote-form');
const quoteFormMessage = quoteForm?.querySelector('.form-message');

const requiredLeadFields = ['firstName', 'lastName', 'email', 'phone', 'preferredDate', 'projectName', 'projectType', 'serviceNeeded', 'message'];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fireLeadConversion = () => {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', 'conversion', {
    'send_to': 'AW-16791484869/WsOrCMGMp6UcEMXz5sY-',
    'value': 1.0,
    'currency': 'USD',
  });
};

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

  const termsFields = quoteForm?.querySelectorAll('input[name="termsAndConditions"]') ?? [];
  const termsValue = quoteForm?.elements.namedItem('termsAndConditions')?.value;
  const termsAccepted = termsValue === 'Agree';
  termsFields.forEach((field) => field.setAttribute('aria-invalid', String(!termsAccepted)));
  if (!termsAccepted) {
    setQuoteFormMessage('Please agree to the Terms and Conditions.');
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
    if (field instanceof HTMLInputElement && field.name === 'termsAndConditions') {
      quoteForm?.querySelectorAll('input[name="termsAndConditions"]').forEach((radio) => {
        radio.setAttribute('aria-invalid', 'false');
      });
    }
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
  payload.contactConsent = payload.termsAndConditions === 'Agree';
  payload.message = [
    `Preferred Date: ${payload.preferredDate}`,
    `Project Name: ${payload.projectName}`,
    '',
    payload.message,
  ].join('\n');

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Lead request failed');
    }

    fireLeadConversion();
    setQuoteFormMessage('Thank you! Your request was sent. We will contact you soon.', 'success');
    quoteForm.reset();
  } catch (error) {
    setQuoteFormMessage('Sorry, your request could not be sent. Please call us at 734-657-7965.');
  } finally {
    submitButton?.removeAttribute('disabled');
    if (submitButton) submitButton.textContent = originalButtonText;
  }
});

const quickQuoteMessage = quickQuoteBar?.querySelector('.quick-quote-message');
const quickQuoteRequiredFields = ['firstName', 'lastName', 'phone', 'email', 'zipCode'];

const setQuickQuoteMessage = (message, type = 'error') => {
  if (!quickQuoteMessage) return;
  quickQuoteMessage.textContent = message;
  quickQuoteMessage.className = `quick-quote-message visible ${type}`;
};

const clearQuickQuoteMessage = () => {
  if (!quickQuoteMessage) return;
  quickQuoteMessage.textContent = '';
  quickQuoteMessage.className = 'quick-quote-message';
};

const getQuickQuoteField = (name) => quickQuoteBar?.elements.namedItem(name);

const validateQuickQuoteForm = () => {
  let isValid = true;

  quickQuoteRequiredFields.forEach((name) => {
    const field = getQuickQuoteField(name);
    const value = field?.value?.trim() ?? '';

    if (!value) {
      field?.setAttribute('aria-invalid', 'true');
      isValid = false;
    } else {
      field?.setAttribute('aria-invalid', 'false');
    }
  });

  const emailField = getQuickQuoteField('email');
  const email = emailField?.value?.trim() ?? '';
  if (email && !emailPattern.test(email)) {
    emailField?.setAttribute('aria-invalid', 'true');
    setQuickQuoteMessage('Please enter a valid email address.');
    return false;
  }

  if (!isValid) {
    setQuickQuoteMessage('Please complete all required fields.');
  }

  return isValid;
};

quickQuoteBar?.addEventListener('input', (event) => {
  const field = event.target;
  if (field instanceof HTMLInputElement) {
    field.setAttribute('aria-invalid', 'false');
  }
  clearQuickQuoteMessage();
});

quickQuoteBar?.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!quickQuoteBar || !validateQuickQuoteForm()) return;

  const submitButton = quickQuoteBar.querySelector('button[type="submit"]');
  const originalButtonText = submitButton?.textContent ?? '';
  submitButton?.setAttribute('disabled', 'true');
  if (submitButton) submitButton.textContent = 'Sending...';
  clearQuickQuoteMessage();

  const payload = {
    ...Object.fromEntries(new FormData(quickQuoteBar).entries()),
    projectType: 'Bathroom',
    serviceNeeded: 'Bathroom',
    message: 'Quick quote request from top form',
    hearAbout: 'Website',
  };

  try {
    const response = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Quick quote request failed');
    }

    fireLeadConversion();
    setQuickQuoteMessage('Thank you! Your request was sent.', 'success');
    quickQuoteBar.reset();
  } catch (error) {
    setQuickQuoteMessage('Sorry, your request could not be sent. Please call us at 734-657-7965.');
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

const updateLightboxNavigation = () => {
  const hasMultipleImages = galleryImages.length > 1;
  lightboxPrev?.toggleAttribute('disabled', !hasMultipleImages);
  lightboxNext?.toggleAttribute('disabled', !hasMultipleImages);
};

const showLightboxImage = (index) => {
  if (!lightboxImage || !galleryImages.length) return;
  lightboxIndex = (index + galleryImages.length) % galleryImages.length;
  const image = galleryImages[lightboxIndex];
  lightboxImage.src = image.src;
  lightboxImage.alt = image.alt;
  setLightboxZoom(1);
  updateLightboxNavigation();
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
  const recentProjectsTriggers = Array.from(document.querySelectorAll('#bathroom-gallery .gallery-lightbox-trigger'));
  const recentProjectsImages = recentProjectsTriggers.length
    ? recentProjectsTriggers.map((trigger) => trigger.querySelector('img')).filter(Boolean)
    : Array.from(document.querySelectorAll('#bathroom-gallery .bathroom-gallery .gallery-photo img'));
  if (!recentProjectsImages.length) return;

  lightboxGroups.set('recent-projects-gallery', recentProjectsImages);

  recentProjectsImages.forEach((image, index) => {
    const trigger = recentProjectsTriggers[index] || image;
    trigger.dataset.lightboxGroup = 'recent-projects-gallery';
    trigger.dataset.lightboxIndex = String(index);
    image.style.cursor = 'zoom-in';

    const openRecentProjectsLightbox = (event) => {
      if (event.galleryLightboxHandled) return;
      event.galleryLightboxHandled = true;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openLightboxImages(recentProjectsImages, index);
    };

    trigger.addEventListener('click', openRecentProjectsLightbox, true);
    image.addEventListener('click', openRecentProjectsLightbox, true);
  });
};

document.querySelectorAll('.service-card').forEach((card, cardIndex) => {
  setupLightboxGroup(card.querySelectorAll('img'), `service-card-${cardIndex}`);
});
document.querySelectorAll('.bathroom-service-card').forEach((card, cardIndex) => {
  setupLightboxGroup(card.querySelectorAll('img'), `bathroom-service-${cardIndex}`);
});
document.querySelectorAll('.bathroom-card').forEach((card, cardIndex) => {
  setupLightboxGroup(card.querySelectorAll('img'), `bathroom-card-${cardIndex}`);
});
document.querySelectorAll('.service-gallery-preview').forEach((gallery, galleryIndex) => {
  const groupName = gallery.querySelector('[data-lightbox-group]')?.dataset.lightboxGroup || `service-preview-${galleryIndex}`;
  setupLightboxGroup(gallery.querySelectorAll('img'), groupName);
});
setupRecentProjectsGalleryLightbox();

const recentProjectsCarousel = document.querySelector('#bathroom-gallery .bathroom-gallery');
let recentProjectsPointerStartX = 0;
let recentProjectsPointerStartY = 0;
let recentProjectsPointerPhoto = null;

recentProjectsCarousel?.addEventListener('pointerdown', (event) => {
  const photo = event.target.closest('.gallery-photo');
  if (!photo) return;
  recentProjectsPointerPhoto = photo;
  recentProjectsPointerStartX = event.clientX;
  recentProjectsPointerStartY = event.clientY;
}, true);

recentProjectsCarousel?.addEventListener('pointerup', (event) => {
  const movedX = Math.abs(event.clientX - recentProjectsPointerStartX);
  const movedY = Math.abs(event.clientY - recentProjectsPointerStartY);
  recentProjectsPointerStartX = 0;
  recentProjectsPointerStartY = 0;
  if (movedX > 8 || movedY > 8) {
    recentProjectsPointerPhoto = null;
  }
}, true);

recentProjectsCarousel?.addEventListener('click', (event) => {
  const photo = event.target.closest('.gallery-photo') || recentProjectsPointerPhoto;
  recentProjectsPointerPhoto = null;
  if (!photo) return;

  const recentProjectsImages = lightboxGroups.get('recent-projects-gallery') || [];
  const index = Number(photo.dataset.lightboxIndex);
  if (!recentProjectsImages.length || Number.isNaN(index)) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  openLightboxImages(recentProjectsImages, index);
}, true);

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('#bathroom-gallery .gallery-lightbox-trigger');
  if (!trigger) return;
  const recentProjectsImages = lightboxGroups.get('recent-projects-gallery') || [];
  const index = Number(trigger.dataset.lightboxIndex ?? trigger.dataset.index);
  if (!recentProjectsImages.length || Number.isNaN(index)) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  openLightboxImages(recentProjectsImages, index);
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
