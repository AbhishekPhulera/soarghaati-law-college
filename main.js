/* ==========================================================================
   SOARGHAATI LAW COLLEGE • OFFICIAL LIVING CANVAS ENGINE
   Pithoragarh, Uttarakhand | Established 2026
   Continuous Cinematic Playback, Scroll Synergy & Admission Form Handlers
   ========================================================================== */

import { SiteConfigService } from './AdminEdit/services/siteConfigService.js';

const TOTAL_FRAMES = 280;
const images = new Array(TOTAL_FRAMES + 1);
let loadedCount = 0;
let isReady = false;

// Scroll-Driven Frame Engine State (Plays smoothly as user scrolls down/up)
let currentFrame = 1;
let targetFrame = 1;

// DOM Elements
const canvas = document.getElementById('living-canvas');
const ctx = canvas.getContext('2d', { alpha: false });
const heroSection = document.getElementById('hero');
const preloader = document.getElementById('preloader');
const preloaderBar = document.getElementById('preloader-bar');
const preloaderPct = document.getElementById('preloader-pct');

// Story Beats
const beat1 = document.getElementById('hero-beat-1');
const beat2 = document.getElementById('hero-beat-2');
const beat3 = document.getElementById('hero-beat-3');

/* ==========================================================================
   CANVAS SIZING & ASPECT RATIO PRESERVATION
   ========================================================================== */

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.parentElement.clientWidth || window.innerWidth;
  const h = canvas.parentElement.clientHeight || window.innerHeight;

  canvas.width = w * dpr;
  canvas.height = h * dpr;
  canvas.style.width = `${w}px`;
  canvas.style.height = `${h}px`;

  ctx.scale(dpr, dpr);
  renderFrame(Math.round(currentFrame));
}

window.addEventListener('resize', resizeCanvas);

function getFrameSrc(index) {
  const padded = String(index).padStart(3, '0');
  return `/ezgif-frame-${padded}.jpg`;
}

/* ==========================================================================
   STREAMED FRAME PRELOADER
   ========================================================================== */

function preloadImages() {
  return new Promise((resolve) => {
    // On mobile devices, frames are not needed; dismiss preloader immediately
    if (window.innerWidth <= 768) {
      if (preloader) preloader.classList.add('fade-out');
      isReady = true;
      resolve();
      return;
    }

    // Load frame 1 immediately
    const firstImg = new Image();
    firstImg.src = getFrameSrc(1);
    firstImg.onload = () => {
      images[1] = firstImg;
      resizeCanvas();
      renderFrame(1);
      // Start animation loop as soon as frame 1 is ready
      requestAnimationFrame(updateEngine);
    };

    // Load remaining frames progressively
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = (i === 1) ? firstImg : new Image();
      if (i > 1) {
        img.src = getFrameSrc(i);
      }

      img.onload = () => {
        images[i] = img;
        loadedCount++;
        const pct = Math.floor((loadedCount / TOTAL_FRAMES) * 100);

        if (preloaderBar) preloaderBar.style.width = `${pct}%`;
        if (preloaderPct) preloaderPct.innerText = `Loading Campus Visuals... ${pct}%`;

        // Dismiss preloader once critical mass or complete
        if (loadedCount >= 20 && preloader && !preloader.classList.contains('fade-out')) {
          preloader.classList.add('fade-out');
          resolve();
        }

        if (loadedCount >= TOTAL_FRAMES) {
          isReady = true;
          if (preloader) preloader.classList.add('fade-out');
          resolve();
        }
      };

      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= 20 && preloader && !preloader.classList.contains('fade-out')) {
          preloader.classList.add('fade-out');
          resolve();
        }
        if (loadedCount >= TOTAL_FRAMES) {
          isReady = true;
          if (preloader) preloader.classList.add('fade-out');
          resolve();
        }
      };
    }
  });
}

/* ==========================================================================
   CANVAS RENDERING ENGINE
   ========================================================================== */

let lastDrawnFrame = -1;

function getAvailableFrame(frameIdx) {
  if (images[frameIdx] && images[frameIdx].complete && images[frameIdx].naturalWidth > 0) {
    return images[frameIdx];
  }
  for (let i = frameIdx - 1; i >= 1; i--) {
    if (images[i] && images[i].complete && images[i].naturalWidth > 0) {
      return images[i];
    }
  }
  for (let i = frameIdx + 1; i <= TOTAL_FRAMES; i++) {
    if (images[i] && images[i].complete && images[i].naturalWidth > 0) {
      return images[i];
    }
  }
  return null;
}

function renderFrame(frameIdx) {
  const img = getAvailableFrame(frameIdx);
  if (!img) return;

  const w = canvas.parentElement.clientWidth || window.innerWidth;
  const h = canvas.parentElement.clientHeight || window.innerHeight;

  ctx.clearRect(0, 0, w, h);

  // Eliminate Google Gemini watermark with clean cinematic zoom
  const sx = img.naturalWidth * 0.04;
  const sy = img.naturalHeight * 0.04;
  const sw = img.naturalWidth * 0.78;
  const sh = img.naturalHeight * 0.78;

  const imgAspect = sw / sh;
  const screenAspect = w / h;

  let drawW, drawH, drawX, drawY;

  if (screenAspect > imgAspect) {
    drawW = w;
    drawH = w / imgAspect;
    drawX = 0;
    drawY = (h - drawH) / 2;
  } else {
    drawH = h;
    drawW = h * imgAspect;
    drawX = (w - drawW) / 2;
    drawY = 0;
  }

  // Draw clean cropped frame with zero watermark
  ctx.drawImage(img, sx, sy, sw, sh, drawX, drawY, drawW, drawH);
  lastDrawnFrame = frameIdx;
}

/* ==========================================================================
   PURE SCROLL-DRIVEN PLAYBACK ENGINE
   (Advances smoothly as user scrolls down, reverses as user scrolls up)
   ========================================================================== */

function getHeroScrollProgress() {
  if (!heroSection) return 0;
  const rect = heroSection.getBoundingClientRect();
  const maxScroll = heroSection.offsetHeight - window.innerHeight;
  const scrolled = -rect.top;
  return Math.min(Math.max(scrolled / maxScroll, 0), 1);
}

function updateEngine() {
  if (window.innerWidth <= 768) {
    // Mobile view is a clean static landing card (no canvas frames needed)
    requestAnimationFrame(updateEngine);
    return;
  }

  const progress = getHeroScrollProgress();

  // Directly map scroll progress to target frame (1 to 280)
  targetFrame = 1 + progress * (TOTAL_FRAMES - 1);

  // Silky-smooth physics interpolation (60/120 fps)
  currentFrame += (targetFrame - currentFrame) * 0.14;

  const frameInt = Math.min(Math.max(Math.round(currentFrame), 1), TOTAL_FRAMES);

  if (frameInt !== lastDrawnFrame || lastDrawnFrame === -1) {
    renderFrame(frameInt);

    // Switch story beats based on scroll progress
    if (beat1 && beat2 && beat3) {
      if (progress < 0.32) {
        beat1.classList.add('active');
        beat2.classList.remove('active');
        beat3.classList.remove('active');
      } else if (progress >= 0.32 && progress < 0.68) {
        beat1.classList.remove('active');
        beat2.classList.add('active');
        beat3.classList.remove('active');
      } else {
        beat1.classList.remove('active');
        beat2.classList.remove('active');
        beat3.classList.add('active');
      }
    }
  }

  requestAnimationFrame(updateEngine);
}

/* ==========================================================================
   DIRECT ADMISSIONS FORM & WHATSAPP INTEGRATION
   ========================================================================== */

const admissionForm = document.getElementById('college-admission-form');
const successBanner = document.getElementById('form-success-banner');
const successWaLink = document.getElementById('success-wa-link');
const btnWaDirectSend = document.getElementById('btn-wa-direct-send');

function buildWhatsAppMessage(name, phone, prog, qual, city) {
  const text = `*New Admission Inquiry - Soarghaati Law College (2026 Batch)*\n\n` +
    `👤 *Student Name:* ${name || 'N/A'}\n` +
    `📞 *Phone Number:* ${phone || 'N/A'}\n` +
    `⚖️ *Desired Program:* ${prog || 'B.A. LL.B'}\n` +
    `🎓 *Qualification:* ${qual || 'N/A'}\n` +
    `📍 *Location:* ${city || 'Pithoragarh, Uttarakhand'}\n\n` +
    `_Please send the official college prospectus and admission procedure details._`;
  return encodeURIComponent(text);
}

/* ==========================================================================
   ADMISSION ENQUIRY STORAGE (Direct integration with Admin Dashboard)
   ========================================================================== */

function saveEnquiryToDashboard(leadData) {
  try {
    const STORAGE_KEY = 'slc_admission_leads_v1';
    let leads = [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        leads = JSON.parse(stored);
      } catch (e) {
        leads = [];
      }
    }

    const count = leads.length + 1;
    const padded = String(count).padStart(3, '0');
    const newId = `SLC-2026-${padded}`;

    let courseName = leadData.program || 'B.A. LL.B (5-Year Integrated)';
    if (courseName.includes('5') || courseName.toLowerCase().includes('ba')) {
      courseName = 'B.A. LL.B (5-Year Integrated)';
    } else if (courseName.includes('3') || courseName.toLowerCase().includes('graduate')) {
      courseName = 'LL.B (3-Year Degree)';
    } else if (courseName.toLowerCase().includes('llm') || courseName.toLowerCase().includes('master')) {
      courseName = 'LL.M (2-Year Master of Laws)';
    }

    const cleanName = (leadData.name || '').trim() || 'Prospective Student';
    const emailPrefix = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.');

    const newLead = {
      id: newId,
      name: cleanName,
      email: `${emailPrefix}@gmail.com`,
      mobile: (leadData.phone || '').trim() || '9876543210',
      altMobile: '',
      course: courseName,
      city: (leadData.city || '').trim() || 'Pithoragarh',
      state: (leadData.state || '').trim() || 'Uttarakhand',
      academicScore: (leadData.qualification || '').trim() || 'Class XII / Graduate',
      category: 'General',
      createdAt: new Date().toISOString(),
      status: 'New',
      followUpDate: null,
      message: `Direct online admission enquiry submitted via college website for ${courseName}. Qualification: ${leadData.qualification || 'N/A'}. Location: ${leadData.city || 'Pithoragarh'}, ${leadData.state || 'Uttarakhand'}.`,
      notes: [
        {
          id: 'note-' + Date.now().toString(36),
          author: 'Website Admission Form',
          text: `Online lead submitted from ${leadData.city || 'Pithoragarh'}, ${leadData.state || 'Uttarakhand'}. Phone: +91 ${leadData.phone || 'N/A'}.`,
          createdAt: new Date().toISOString()
        }
      ],
      history: [
        {
          timestamp: new Date().toISOString(),
          action: 'Online Enquiry Received',
          details: `Candidate registered for ${courseName}`,
          performedBy: 'College Website Visitor'
        }
      ]
    };

    leads.unshift(newLead);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));

    // Persist directly to Hostinger Server Database (SQLite & JSON)
    try {
      fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: cleanName,
          mobile: (leadData.phone || '').trim(),
          email: `${emailPrefix}@gmail.com`,
          course: courseName,
          percentage: (leadData.qualification || '').trim(),
          state: (leadData.state || '').trim(),
          city: (leadData.city || '').trim(),
          source: 'Website Admission Form'
        })
      }).then(r => r.json()).then(res => {
        if (res && res.success && res.id) {
          newLead.id = res.id;
          if (leads[0]) leads[0].id = res.id;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
        }
      }).catch(err => {
        console.warn('[Admissions Desk] Error saving lead to server database:', err);
      });
    } catch (netErr) {
      console.warn('[Admissions Desk] Server sync error:', netErr);
    }

    return newLead;
  } catch (err) {
    console.warn('[Admissions Desk] Error saving lead to storage:', err);
  }
}

if (admissionForm) {
  admissionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = (document.getElementById('student-name')?.value || '').trim();
    const phone = (document.getElementById('student-phone')?.value || '').trim();
    const prog = document.getElementById('student-program')?.value || 'B.A. LL.B (5-Year)';
    const qual = (document.getElementById('student-qualification')?.value || '').trim();
    const state = document.getElementById('student-state')?.value || 'Uttarakhand';
    const city = (document.getElementById('student-city')?.value || '').trim() || 'Pithoragarh';

    // Save directly to the Admin Dashboard storage
    saveEnquiryToDashboard({ name, phone, program: prog, qualification: qual, city, state });

    const locationStr = city ? `${city}, ${state}` : state;
    const waMsg = buildWhatsAppMessage(name, phone, prog, qual, locationStr);
    const activeWa = (SiteConfigService.getConfig()?.institution?.whatsappNumber || '917830201028').replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${activeWa}?text=${waMsg}`;

    if (successWaLink) successWaLink.href = waUrl;

    admissionForm.style.display = 'none';
    if (successBanner) successBanner.style.display = 'block';
  });
}

if (btnWaDirectSend) {
  btnWaDirectSend.addEventListener('click', () => {
    const name = (document.getElementById('student-name')?.value || '').trim() || 'Prospective Student';
    const phone = (document.getElementById('student-phone')?.value || '').trim();
    const prog = document.getElementById('student-program')?.value || 'B.A. LL.B (5-Year)';
    const qual = (document.getElementById('student-qualification')?.value || '').trim();
    const state = document.getElementById('student-state')?.value || 'Uttarakhand';
    const city = (document.getElementById('student-city')?.value || '').trim() || 'Pithoragarh';

    // Save directly to the Admin Dashboard storage
    saveEnquiryToDashboard({ name, phone, program: prog, qualification: qual, city, state });

    const locationStr = city ? `${city}, ${state}` : state;
    const waMsg = buildWhatsAppMessage(name, phone, prog, qual, locationStr);
    const activeWa = (SiteConfigService.getConfig()?.institution?.whatsappNumber || '917830201028').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${activeWa}?text=${waMsg}`, '_blank');
  });
}

/* ==========================================================================
   MODAL DIALOG HANDLERS
   ========================================================================== */

const modalOverlay = document.getElementById('admission-modal');
const modalClose = document.getElementById('modal-close');
const modalForm = document.getElementById('modal-app-form');
const modalSuccess = document.getElementById('modal-success');
const modalWaRedirect = document.getElementById('modal-wa-redirect');

function bindModalButtons() {
  document.querySelectorAll('.open-modal-btn').forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      const prog = btn.getAttribute('data-program');
      if (prog) {
        const select = document.getElementById('m-prog');
        if (select) {
          let matched = false;
          for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].value === prog || select.options[i].text.includes(prog)) {
              select.selectedIndex = i;
              matched = true;
              break;
            }
          }
          if (!matched) select.value = prog;
        }
      }
      if (modalOverlay) modalOverlay.classList.add('open');
    };
  });
}

bindModalButtons();

if (modalClose) {
  modalClose.addEventListener('click', () => {
    if (modalOverlay) modalOverlay.classList.remove('open');
  });
}

if (modalOverlay) {
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('open');
  });
}

if (modalForm) {
  modalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = (document.getElementById('m-name')?.value || '').trim();
    const phone = (document.getElementById('m-phone')?.value || '').trim();
    const prog = document.getElementById('m-prog')?.value || 'B.A. LL.B (5-Year)';
    const qual = (document.getElementById('m-qual')?.value || '').trim();
    const state = document.getElementById('m-state')?.value || 'Uttarakhand';
    const city = (document.getElementById('m-city')?.value || '').trim() || 'Pithoragarh';

    // Save directly to the Admin Dashboard storage
    saveEnquiryToDashboard({ name, phone, program: prog, qualification: qual, city, state });

    const locationStr = city ? `${city}, ${state}` : state;
    const waMsg = buildWhatsAppMessage(name, phone, prog, qual, locationStr);
    if (modalWaRedirect) {
      const activeWa = (SiteConfigService.getConfig()?.institution?.whatsappNumber || '917830201028').replace(/[^0-9]/g, '');
      modalWaRedirect.href = `https://wa.me/${activeWa}?text=${waMsg}`;
    }

    modalForm.style.display = 'none';
    if (modalSuccess) modalSuccess.style.display = 'block';
  });
}

/* ==========================================================================
   NAVIGATION, SCROLL-SPY & MOBILE MENU
   ========================================================================== */

const mobileNavToggle = document.getElementById('mobile-nav-toggle');
const collegeNavMenu = document.getElementById('college-nav-menu');
const navItems = document.querySelectorAll('.college-nav-menu .nav-item');

if (mobileNavToggle && collegeNavMenu) {
  mobileNavToggle.addEventListener('click', () => {
    mobileNavToggle.classList.toggle('open');
    collegeNavMenu.classList.toggle('open');
  });

  // Handle mobile clicks for dropdowns vs direct links
  const dropdownWrappers = collegeNavMenu.querySelectorAll('.nav-item-wrap.has-dropdown');
  dropdownWrappers.forEach((wrap) => {
    const parentLink = wrap.querySelector(':scope > a.nav-item');
    if (parentLink) {
      parentLink.addEventListener('click', (e) => {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          wrap.classList.toggle('open-mobile-dd');
        }
      });
    }
  });

  // Direct sublinks and single nav links close the drawer on mobile
  const directLinks = collegeNavMenu.querySelectorAll('.dropdown-link, .nav-item-wrap:not(.has-dropdown) a, .drawer-mobile-ctas a, .drawer-mobile-ctas button');
  directLinks.forEach((item) => {
    item.addEventListener('click', (e) => {
      mobileNavToggle.classList.remove('open');
      collegeNavMenu.classList.remove('open');
      if (window.innerWidth <= 768 && item.getAttribute('href') === '#admissions') {
        e.preventDefault();
        if (admissionModal) admissionModal.classList.add('open');
      }
    });
  });
}

// Scroll Spy to highlight active navigation link
const spySections = [
  { id: 'hero', nav: document.querySelector('.nav-item[href="#hero"]') },
  { id: 'about', nav: document.querySelector('.nav-item[href="#about"]') },
  { id: 'programs', nav: document.querySelector('.nav-item[href="#programs"]') },
  { id: 'admissions', nav: document.querySelector('.nav-item[href="#admissions"]') },
  { id: 'gallery', nav: document.querySelector('.nav-item[href="#gallery"]') },
  { id: 'contact', nav: document.querySelector('.nav-item[href="#contact"]') }
];

window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 180;

  for (let i = spySections.length - 1; i >= 0; i--) {
    const sec = document.getElementById(spySections[i].id);
    if (sec && sec.offsetTop <= scrollPos) {
      navItems.forEach((n) => n.classList.remove('active'));
      if (spySections[i].nav) {
        spySections[i].nav.classList.add('active');
      }
      break;
    }
  }
}, { passive: true });

/* ==========================================================================
   DYNAMIC CMS CONFIGURATION APPLICATOR (/AdminEdit SYNC)
   ========================================================================== */

function applySiteConfig() {
  const config = SiteConfigService.getConfig();
  if (!config) return;

  const { institution, formConfig, courses } = config;

  // 1. Top Strip Announcement Ticker & Academic Batch
  const announcementEl = document.querySelector('.strip-text');
  if (announcementEl && institution.topAnnouncement) {
    announcementEl.innerHTML = institution.topAnnouncement;
  }
  const stripBadge = document.querySelector('.strip-badge');
  if (stripBadge && institution.academicYear) {
    stripBadge.textContent = `ADMISSIONS ${institution.academicYear}`;
  }

  // 2. Primary Helplines & WhatsApp numbers
  const primaryPhone = institution.phonePrimary || '+91 7830201028';
  const cleanPhone = primaryPhone.replace(/\s+/g, '');
  const waNum = (institution.whatsappNumber || '917830201028').replace(/[^0-9]/g, '');

  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.href = `tel:${cleanPhone}`;
  });

  const stripPhoneSpan = document.querySelector('.strip-phone-link span');
  if (stripPhoneSpan) stripPhoneSpan.textContent = primaryPhone;

  const boxPhoneNum = document.querySelector('.box-phone-num');
  if (boxPhoneNum) boxPhoneNum.textContent = primaryPhone;

  const floatPhone = document.querySelector('.float-text');
  if (floatPhone) floatPhone.textContent = `Admissions Helpline: ${primaryPhone}`;

  const footerPhone = document.querySelector('.footer-contact-block a[href^="tel:"]');
  if (footerPhone) footerPhone.textContent = primaryPhone;

  const formNoticePhone = document.querySelector('.form-notice strong');
  if (formNoticePhone) formNoticePhone.textContent = primaryPhone;

  // WhatsApp links update
  document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
    const curHref = link.getAttribute('href');
    if (curHref) {
      link.setAttribute('href', curHref.replace(/wa\.me\/[0-9]+/, `wa.me/${waNum}`));
    }
  });

  // Email links update
  if (institution.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.href = `mailto:${institution.email}`;
      const span = link.querySelector('span');
      if (span) span.textContent = institution.email;
    });
  }

  // Campus Address update
  if (institution.address) {
    const addrEl = document.querySelector('.footer-address');
    if (addrEl) {
      addrEl.innerHTML = `<strong>Campus Address:</strong><br>${institution.address.replace(/\n/g, '<br>')}`;
    }
  }

  // 3. Brochure links
  if (institution.brochureUrl) {
    document.querySelectorAll('.btn-download-brochure').forEach(btn => {
      btn.href = institution.brochureUrl;
    });
  }

  // 4. Form Dropdowns: Course / Program
  const studentProgSelect = document.getElementById('student-program');
  const modalProgSelect = document.getElementById('m-prog');

  const populateProgSelect = (selectEl) => {
    if (!selectEl) return;
    const curVal = selectEl.value;
    selectEl.innerHTML = '<option value="" disabled selected>-- Select Desired Programme --</option>';

    let options = [];
    if (Array.isArray(formConfig?.programOptions) && formConfig.programOptions.length > 0) {
      options = formConfig.programOptions;
    } else if (Array.isArray(courses) && courses.length > 0) {
      options = courses.map(c => ({
        id: c.id,
        value: c.title,
        label: `${c.title} (${c.degreeBadge || c.duration || 'Degree'})`
      }));
    } else {
      options = [
        { id: 'ba-llb-5yr', value: 'B.A. LL.B (5-Year)', label: 'B.A. LL.B (5-Year Integrated Course - After 10+2)' },
        { id: 'llb-3yr', value: 'LL.B (3-Year)', label: 'LL.B (3-Year Professional Course - After Graduation)' }
      ];
    }

    options.forEach(opt => {
      const optEl = document.createElement('option');
      optEl.value = opt.value || opt.label;
      optEl.textContent = opt.label || opt.value;
      selectEl.appendChild(optEl);
    });

    if (curVal && options.some(o => (o.value || o.label) === curVal)) {
      selectEl.value = curVal;
    }
  };

  populateProgSelect(studentProgSelect);
  populateProgSelect(modalProgSelect);

  // 5. Form Dropdowns: State
  const studentStateSelect = document.getElementById('student-state');
  const modalStateSelect = document.getElementById('m-state');

  const populateStateSelect = (selectEl) => {
    if (!selectEl || !formConfig.stateOptions) return;
    const curVal = selectEl.value;
    selectEl.innerHTML = '<option value="" disabled selected>Select State</option>';
    formConfig.stateOptions.forEach(st => {
      const optEl = document.createElement('option');
      optEl.value = st;
      optEl.textContent = st;
      selectEl.appendChild(optEl);
    });
    if (curVal) selectEl.value = curVal;
  };

  populateStateSelect(studentStateSelect);
  populateStateSelect(modalStateSelect);

  // 6. Form Title & Subtitle & Submit Text
  const applyTitle = document.querySelector('.apply-title');
  if (applyTitle && formConfig.heading) applyTitle.innerText = formConfig.heading;

  const applySubtitle = document.querySelector('.apply-subtitle');
  if (applySubtitle && formConfig.subheading) applySubtitle.innerText = formConfig.subheading;

  const btnSubmitApp = document.querySelector('.btn-submit-app span');
  if (btnSubmitApp && formConfig.submitBtnText) btnSubmitApp.innerText = formConfig.submitBtnText;

  const btnModalSubmit = document.querySelector('.btn-modal-submit span');
  if (btnModalSubmit && formConfig.submitBtnText) btnModalSubmit.innerText = formConfig.submitBtnText;

  // Field Requirements Sync
  if (formConfig.fields) {
    const setReq = (id, isReq) => {
      const el = document.getElementById(id);
      if (el) el.required = !!isReq;
    };
    setReq('student-name', formConfig.fields.nameRequired !== false);
    setReq('m-name', formConfig.fields.nameRequired !== false);
    setReq('student-phone', formConfig.fields.mobileRequired !== false);
    setReq('m-phone', formConfig.fields.mobileRequired !== false);
    setReq('student-program', formConfig.fields.programRequired !== false);
    setReq('m-prog', formConfig.fields.programRequired !== false);
    setReq('student-qualification', formConfig.fields.qualificationRequired !== false);
    setReq('m-qual', formConfig.fields.qualificationRequired !== false);
    setReq('student-state', formConfig.fields.stateRequired !== false);
    setReq('m-state', formConfig.fields.stateRequired !== false);
    setReq('student-city', formConfig.fields.cityRequired !== false);
    setReq('m-city', formConfig.fields.cityRequired !== false);
  }

  // 7. Dynamic Detailed Courses Grid (#programs .programs-tri-grid)
  const progGrid = document.querySelector('.programs-tri-grid');
  if (progGrid && courses && courses.length > 0) {
    progGrid.innerHTML = courses.map(c => `
      <div class="prog-detailed-card ${c.isFeatured ? 'featured-prog' : ''}">
        ${c.isFeatured ? `<div class="card-badge-top">${c.featuredLabel || 'MOST POPULAR'}</div>` : ''}
        <div class="prog-card-header">
          <div class="prog-tag-row">
            <span class="degree-badge ${c.badgeColor === 'blue' ? 'blue' : ''}">${c.degreeBadge}</span>
            <span class="degree-code">${c.eligibilityCode || ''}</span>
          </div>
          <h3 class="prog-card-name">${c.title}</h3>
          <p class="prog-card-subtitle">${c.subtitle || ''}</p>
        </div>

        <div class="prog-card-body">
          <p class="prog-desc-p">${c.description}</p>

          ${c.curriculumTags && c.curriculumTags.length > 0 ? `
            <div class="prog-curriculum-highlights">
              <h4 class="curr-title">Key Curriculum Modules:</h4>
              <div class="curr-tags-grid">
                ${c.curriculumTags.map(t => `<span>${t}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          <div class="prog-meta-strip">
            <div class="p-meta"><span class="m-lbl">Duration:</span><strong>${c.duration}</strong></div>
            <div class="p-meta"><span class="m-lbl">Affiliation:</span><strong>${c.affiliation}</strong></div>
            <div class="p-meta"><span class="m-lbl">Approval:</span><strong>${c.approval}</strong></div>
            ${c.annualSeats ? `<div class="p-meta"><span class="m-lbl">Annual Seats:</span><strong>${c.annualSeats}</strong></div>` : ''}
          </div>
        </div>

        <div class="prog-card-footer">
          <button class="btn-enroll open-modal-btn" data-program="${c.code || c.title}">
            <span>Apply for ${c.code || c.title}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
          <a href="https://wa.me/${waNum}?text=Hello,%20I%20want%20details%20for%20${encodeURIComponent(c.title)}%20Admissions." target="_blank" rel="noopener" class="btn-wa-query">
            <span>Quick WhatsApp Query</span>
          </a>
        </div>
      </div>
    `).join('');
  }

  // 8. Dynamic Hero Program Quick Cards (.hero-programs-strip)
  const heroProgStrip = document.querySelector('.hero-programs-strip');
  if (heroProgStrip && courses && courses.length > 0) {
    heroProgStrip.innerHTML = courses.map(c => `
      <div class="hero-prog-card open-modal-btn" data-program="${c.code || c.title}">
        <div class="prog-icon">${c.icon || '⚖️'}</div>
        <div class="prog-text">
          <span class="prog-degree">${c.code || c.title}</span>
          <span class="prog-desc">${c.heroDesc || c.subtitle || c.duration}</span>
        </div>
        <span class="prog-arrow">→</span>
      </div>
    `).join('');
  }

  // 9. Dynamic Header Navbar 'Programmes' Dropdown
  const progDropdown = document.querySelector('a.nav-item[href="#programs"] + .nav-dropdown-menu');
  if (progDropdown && courses && courses.length > 0) {
    progDropdown.innerHTML = `
      ${courses.map(c => `
        <a href="#programs" class="dropdown-link">
          <strong>${c.title}</strong>
          <span class="dd-desc">${c.heroDesc || c.subtitle || c.duration}</span>
        </a>
      `).join('')}
      <a href="#what-you-learn" class="dropdown-link">Curriculum &amp; Clinical Legal Education</a>
    `;
  }

  // 10. Dynamic Footer 'Programmes' List
  const allColTitles = Array.from(document.querySelectorAll('.footer-col-title'));
  const footerProgTitle = allColTitles.find(el => el.textContent.trim().toLowerCase() === 'programmes');
  if (footerProgTitle && footerProgTitle.nextElementSibling && courses && courses.length > 0) {
    const footerList = footerProgTitle.nextElementSibling;
    footerList.innerHTML = `
      ${courses.map(c => `
        <li><a href="#programs">${c.code || c.title} (${c.degreeBadge || c.duration})</a></li>
      `).join('')}
      <li><a href="#what-you-learn">Moot Court &amp; Trial Advocacy</a></li>
      <li><a href="#what-you-learn">Legal Aid &amp; Clinical Education</a></li>
    `;
  }

  // 11. Dynamic Seats Status Pill
  const statusPillCourseSpan = document.querySelector('.status-pill-item span:last-child');
  if (statusPillCourseSpan && courses && courses.length > 0) {
    statusPillCourseSpan.textContent = courses.map(c => c.code || c.title).join(' • ') + ' Seats Available';
  }

  // 12. Rebind all modal trigger buttons
  bindModalButtons();
}

// Listen to storage sync events
window.addEventListener('storage', (e) => {
  if (e.key === 'slc_site_config_v1') {
    applySiteConfig();
  }
});

window.addEventListener('slc_site_config_updated', () => {
  applySiteConfig();
});

// Apply configuration immediately from cached storage
applySiteConfig();

// Asynchronously hydrate latest configuration from disk/server to guarantee persistence
SiteConfigService.initConfig().then(() => {
  applySiteConfig();
}).catch((err) => {
  console.warn('[main.js] Server config hydration note:', err);
});

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */

resizeCanvas();
requestAnimationFrame(updateEngine);

preloadImages().then(() => {
  resizeCanvas();
  renderFrame(Math.round(currentFrame));
});

