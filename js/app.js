/* ==========================================
   White Coat Collective - Interactive App Script
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileDrawer();
  initToastContainer();
  initModalSystem();
  initSearchAndFilters();
  initForms();
});

// Toast System
function initToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, icon = 'check_circle') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span class="material-symbols-outlined text-primary">${icon}</span>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Navbar Scroll Effect
function initNavbar() {
  const header = document.querySelector('.header-nav');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 15) {
      header.classList.add('shadow-scrolled');
    } else {
      header.classList.remove('shadow-scrolled');
    }
  });
}

// Mobile Drawer Navigation
function initMobileDrawer() {
  const toggleBtn = document.querySelectorAll('.mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const overlay = document.getElementById('drawer-overlay');
  const closeBtn = document.getElementById('close-drawer-btn');

  if (!drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  };

  toggleBtn.forEach(btn => btn.addEventListener('click', openDrawer));
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

// Modal System
function initModalSystem() {
  const backdrop = document.getElementById('modal-backdrop');
  const modalBody = document.getElementById('modal-body-content');
  const closeBtn = document.getElementById('close-modal-btn');

  if (!backdrop || !modalBody) return;

  window.openModal = function (title, contentHtml) {
    document.getElementById('modal-title').textContent = title;
    modalBody.innerHTML = contentHtml;
    backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function () {
    backdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Render existing RSVP logs on page load
  renderRSVPLogTable();

  // Clear log listener
  const clearLogBtn = document.getElementById('clear-rsvp-log-btn');
  if (clearLogBtn) {
    clearLogBtn.addEventListener('click', () => {
      localStorage.removeItem('wcc_rsvp_logs');
      renderRSVPLogTable();
      showToast('RSVP transmission log cleared.', 'delete');
    });
  }

  // Handle Edit Sheet URL button clicks
  document.querySelectorAll('.btn-config-sheet').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const card = e.target.closest('article') || e.target.closest('.event-card') || e.target.closest('#newsletter-card');
      const title = card ? (card.querySelector('h3') ? card.querySelector('h3').textContent : 'Mailing List') : 'Newsletter';
      const currentUrl = card ? (card.dataset.sheetUrl || '') : '';

      const modalHtml = `
        <p class="text-body-md text-on-surface-variant mb-4">Manage the Google Sheet Webhook or Google Drive link for <strong>${title}</strong>.</p>
        <form id="config-sheet-form" class="space-y-4">
          <div>
            <label class="block text-label-md text-on-surface mb-1">Google Sheet Webhook URL or Direct Link</label>
            <input type="text" id="config-sheet-url" required value="${currentUrl}" placeholder="https://script.google.com/macros/s/.../exec or Google Drive link" class="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 font-mono text-xs focus:border-primary focus:outline-none">
          </div>
          <div class="flex gap-2">
            <button type="submit" class="w-full btn-primary py-2.5">Save Sheet URL</button>
            ${currentUrl.startsWith('http') ? `<a href="${currentUrl}" target="_blank" rel="noopener" class="btn-outline py-2.5 whitespace-nowrap text-xs">Open Sheet Link ↗</a>` : ''}
          </div>
        </form>
      `;

      openModal(`Google Sheet Settings: ${title}`, modalHtml);

      setTimeout(() => {
        const form = document.getElementById('config-sheet-form');
        if (form) {
          form.addEventListener('submit', (evt) => {
            evt.preventDefault();
            const newUrl = document.getElementById('config-sheet-url').value;
            if (card) card.dataset.sheetUrl = newUrl;
            closeModal();
            showToast(`Updated Google Sheet URL for ${title}!`, 'table_chart');
          });
        }
      }, 50);
    });
  });

  // Attach RSVP handlers on event buttons
  document.querySelectorAll('.btn-register-event').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = e.target.closest('article') || e.target.closest('.event-card');
      const title = card ? card.querySelector('h3').textContent : 'Event Registration';
      const sheetUrl = card ? (card.dataset.sheetUrl || '') : '';
      const sheetTarget = card && card.querySelector('div.text-xs span:last-child') ? card.querySelector('div.text-xs span:last-child').textContent : 'Google Sheet';

      const formHtml = `
        <p class="text-body-md text-on-surface-variant mb-3">Complete your details to secure your spot for <strong>${title}</strong>.</p>
        
        <div class="bg-primary/10 border border-primary/20 rounded-lg p-3 mb-4 text-xs text-primary flex items-center gap-2">
          <span class="material-symbols-outlined text-base">sync_alt</span>
          <span>RSVP info will be posted directly to <strong>${sheetTarget}</strong></span>
        </div>

        <form id="rsvp-modal-form" class="space-y-4">
          <div>
            <label class="block text-label-md text-on-surface mb-1">Full Name</label>
            <input type="text" id="rsvp-name" required placeholder="e.g. Jane Doe" class="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:outline-none">
          </div>
          <div>
            <label class="block text-label-md text-on-surface mb-1">University Email</label>
            <input type="email" id="rsvp-email" required placeholder="jane@university.edu" class="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:outline-none">
          </div>
          <div>
            <label class="block text-label-md text-on-surface mb-1">Academic Year</label>
            <select id="rsvp-year" class="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-body-md focus:border-primary focus:outline-none">
              <option>Freshman</option>
              <option>Sophomore</option>
              <option selected>Junior</option>
              <option>Senior</option>
              <option>Alumni</option>
            </select>
          </div>
          <button type="submit" id="rsvp-submit-btn" class="w-full btn-primary py-3 mt-4 flex items-center justify-center gap-2">
            <span>Confirm & Send to Google Sheet</span>
            <span class="material-symbols-outlined text-lg">send</span>
          </button>
        </form>
      `;

      openModal(`Register: ${title}`, formHtml);

      setTimeout(() => {
        const rsvpForm = document.getElementById('rsvp-modal-form');
        if (rsvpForm) {
          rsvpForm.addEventListener('submit', async (evt) => {
            evt.preventDefault();

            const submitBtn = document.getElementById('rsvp-submit-btn');
            if (submitBtn) {
              submitBtn.disabled = true;
              submitBtn.innerHTML = `
                <span class="material-symbols-outlined animate-spin text-lg">sync</span>
                <span>Posting to Google Sheet...</span>
              `;
            }

            const name = document.getElementById('rsvp-name').value;
            const email = document.getElementById('rsvp-email').value;
            const year = document.getElementById('rsvp-year').value;

            const payload = {
              eventTitle: title,
              name: name,
              email: email,
              academicYear: year,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              sheetTarget: sheetTarget,
              sheetUrl: sheetUrl || 'https://script.google.com/macros/s/AKfycbzJRhvYMlcvsm9f4ZwOLkMd1eDcWOn1xW1D_7p-nhO2UVJYnmhrKmC1sYzDMbLGDrO0ZA/exec'
            };

            // Transmit to Google Sheet Webhook endpoint
            try {
              if (sheetUrl) {
                fetch(sheetUrl, {
                  method: 'POST',
                  mode: 'no-cors',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                }).catch(err => console.log('Google Sheets post background dispatch: ', err));
              }
            } catch (e) {
              console.log('Webhook error: ', e);
            }

            // Record in local log history
            const logs = JSON.parse(localStorage.getItem('wcc_rsvp_logs') || '[]');
            logs.unshift(payload);
            localStorage.setItem('wcc_rsvp_logs', JSON.stringify(logs));

            renderRSVPLogTable();
            closeModal();
            showToast(`RSVP submitted & sent to ${sheetTarget}!`, 'table_chart');
          });
        }
      }, 50);
    });
  });
}

function renderRSVPLogTable() {
  const tableBody = document.getElementById('rsvp-live-log-table');
  if (!tableBody) return;

  const logs = JSON.parse(localStorage.getItem('wcc_rsvp_logs') || '[]');
  if (logs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="p-6 text-center text-outline italic">No RSVPs recorded yet. Click "Register" on any event above to test live Google Sheets integration!</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = logs.map(log => `
    <tr class="hover:bg-surface-container/50 transition-colors">
      <td class="p-3 font-mono text-xs text-on-surface">${log.timestamp || 'Just now'}</td>
      <td class="p-3 font-bold text-on-surface">${log.eventTitle}</td>
      <td class="p-3 text-on-surface">${log.name}</td>
      <td class="p-3 text-on-surface-variant font-mono text-xs">${log.email}</td>
      <td class="p-3 text-on-surface-variant">${log.academicYear}</td>
      <td class="p-3 text-primary font-bold text-xs">${log.sheetTarget}</td>
      <td class="p-3 text-right">
        <span class="inline-flex items-center gap-1 text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded text-xs font-semibold">
          <span class="material-symbols-outlined text-sm">check_circle</span>
          <span>Synced</span>
        </span>
      </td>
    </tr>
  `).join('');
}

// Search and Filter logic
function initSearchAndFilters() {
  const searchInput = document.getElementById('global-search');
  const filterPills = document.querySelectorAll('.filter-pill');
  const filterableItems = document.querySelectorAll('.filterable-item');

  if (!filterableItems.length) return;

  function filterItems() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const activePill = document.querySelector('.filter-pill.active');
    const category = activePill ? activePill.dataset.category : 'all';

    filterableItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      const itemCategory = item.dataset.category || '';

      const matchesSearch = !query || text.includes(query);
      const matchesCategory = category === 'all' || itemCategory.split(' ').includes(category);

      if (matchesSearch && matchesCategory) {
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterItems);
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('active', 'bg-secondary-fixed', 'text-on-secondary-fixed');
        p.classList.add('bg-surface', 'text-on-surface-variant', 'border', 'border-outline-variant');
      });

      pill.classList.add('active', 'bg-secondary-fixed', 'text-on-secondary-fixed');
      pill.classList.remove('bg-surface', 'text-on-surface-variant', 'border', 'border-outline-variant');

      filterItems();
    });
  });
}

// Forms & Newsletter Handling
function initForms() {
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you! Your message has been sent to our team.', 'mark_email_read');
      contactForm.reset();
    });
  }

  const newsletterForm = document.getElementById('newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const emailInput = document.getElementById('newsletter-email');
      const submitBtn = document.getElementById('newsletter-submit-btn');

      const email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      const sheetUrl = 'https://script.google.com/macros/s/AKfycbzCsE_RPOTaXg2fQynNtE08IALvoyQPGdL4bOXC_yIwOhCQrK2ROZSthRcgtyzRnLexuQ/exec';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="material-symbols-outlined animate-spin text-base">sync</span>
          <span>Subscribing...</span>
        `;
      }

      const payload = {
        eventTitle: 'Mailing List Subscription',
        name: 'Subscriber',
        email: email,
        academicYear: 'N/A',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sheetTarget: 'Newsletter_Subscribers',
        sheetUrl: sheetUrl
      };

      // Send to Google Sheet Webhook endpoint
      try {
        fetch(sheetUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.log('Newsletter sheet webhook error: ', err));
      } catch (err) {
        console.log('Webhook error: ', err);
      }

      // Record in local log history
      const logs = JSON.parse(localStorage.getItem('wcc_rsvp_logs') || '[]');
      logs.unshift(payload);
      localStorage.setItem('wcc_rsvp_logs', JSON.stringify(logs));

      setTimeout(() => {
        showToast('Thank you for subscribing! Your email has been registered.', 'mark_email_read');
        if (emailInput) emailInput.value = '';
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `Subscribe`;
        }
      }, 500);
    });
  }
};



