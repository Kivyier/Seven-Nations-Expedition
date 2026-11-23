/* ==========================================================================
   Seven Nations Expedition: Shared Interactive Script (main.js)
   ========================================================================== */

(function () {
  'use strict';

  /* ========================================================================
     1. SHARED DATA & CONFIGURATION
     ======================================================================== */
  const PACKAGES = {
    mond: {
      nation: 'Mondstadt',
      slug: 'mondstadt',
      code: 'MOND-01',
      name: 'The City of Freedom Expedition',
      base: 12500,
      peak: 15600,
      katheryneNote: '“Mondstadt’s winds are gentle—3D2N starting at ₱12,500 per person.”',
      directorTip: 'Start your morning walk around Cider Lake before 8 AM while the windmills catch the east breeze.',
      packingTips: [
        'Light windbreaker for Cider Lake breeze',
        'Comfortable walking shoes for cobblestone streets',
        'Reusable water bottle & daypack',
        'Valid ID / Adventurers’ Guild pass'
      ]
    },
    liyue: {
      nation: 'Liyue',
      slug: 'liyue',
      code: 'LIYU-02',
      name: 'The Harbor of Stone and Commerce',
      base: 15000,
      peak: 18800,
      katheryneNote: '“Liyue Harbor awaits! A 4D3N culinary route starts at ₱15,000.”',
      directorTip: 'Save your appetite for Chihu Rock at dusk—street vendors serve fresh Mora Meat right off the grill.',
      packingTips: [
        'Sturdy hiking shoes for stone staircases',
        'Light breathable clothing for harbor walks',
        'Camera for Wangshu & harbor views',
        'Valid ID & digital booking voucher'
      ]
    },
    inazuma: {
      nation: 'Inazuma',
      slug: 'inazuma',
      code: 'INAZ-03',
      name: 'The Realm of Eternal Thunder',
      base: 18000,
      peak: 22500,
      katheryneNote: '“Crossing the storm to Inazuma? Our 4D3N cultural tour is ₱18,000.”',
      directorTip: 'Carry a compact umbrella even on sunny mornings; Narukami Island weather shifts fast.',
      packingTips: [
        'Compact umbrella (frequent coastal showers)',
        'Modest attire for Grand Narukami Shrine',
        'Portable power bank',
        'Valid ID & ferry boarding pass'
      ]
    },
    sumeru: {
      nation: 'Sumeru',
      slug: 'sumeru',
      code: 'SUME-04',
      name: 'The City of Wisdom & Rainforest Retreat',
      base: 14000,
      peak: 17500,
      katheryneNote: '“Wisdom lies in Sumeru’s rainforests—3D3N adventures begin at ₱14,000.”',
      directorTip: 'Wear breathable cotton and waterproof boots—rainforest canopy trails stay misty until noon.',
      packingTips: [
        'Insect repellent & rain poncho for rainforest',
        'Breathable cotton clothing & sun hat',
        'Waterproof pouch for electronics',
        'Valid ID & Akademiya visitor pass'
      ]
    },
    fontaine: {
      nation: 'Fontaine',
      slug: 'fontaine',
      code: 'FONT-05',
      name: 'The Capital of Justice, Steam, and Aquanics',
      base: 20000,
      peak: 25000,
      katheryneNote: '“Ah, Fontaine! Expect 5D4N of clockwork elegance from ₱20,000.”',
      directorTip: 'Book an evening seat at Opera Epiclese; the aquabus ride back under the lamps is unforgettable.',
      packingTips: [
        'Smart-casual outfit for Opera Epiclese',
        'Light raincoat or compact umbrella',
        'Comfortable shoes for Court of Fontaine',
        'Valid ID & aquabus pass'
      ]
    },
    natlan: {
      nation: 'Natlan',
      slug: 'natlan',
      code: 'NATL-06',
      name: 'The Land of Ash, Hot Springs, and Valor',
      base: 16500,
      peak: 20600,
      katheryneNote: '“Pack for hot springs and valor—Natlan’s 4D3N expedition is ₱16,500.”',
      directorTip: 'Pack quick-dry swimwear and hydration gear—thermal springs feel best right after canyon hikes.',
      packingTips: [
        'Swimwear & quick-dry towel for hot springs',
        'High-SPF sunscreen & sunglasses',
        'Trail sneakers for volcanic canyon walks',
        'Valid ID & hydration flask'
      ]
    },
    snezhnaya: {
      nation: 'Snezhnaya',
      slug: 'snezhnaya',
      code: 'SNEZ-07',
      name: 'The Eternal White Tundra',
      base: 22000,
      peak: 27500,
      katheryneNote: '“Bundle up for the tundra! Snezhnaya’s 5D4N winter tour is ₱22,000.”',
      directorTip: 'Layer thermal wool underneath your coat; aurora sightings peak past midnight near the palace.',
      packingTips: [
        'Heavy insulated winter coat & thermal layers',
        'Waterproof snow boots & wool socks',
        'Insulated gloves, scarf & beanie',
        'Valid ID & cold-weather skin balm'
      ]
    }
  };

  const PACKAGE_LIST = Object.values(PACKAGES);

  const DEPARTURES = [
    { label: 'Nov 7, 2026',  iso: '2026-11-07', season: 'Regular', slots: 12 },
    { label: 'Nov 21, 2026', iso: '2026-11-21', season: 'Regular', slots: 5  },
    { label: 'Dec 19, 2026', iso: '2026-12-19', season: 'Peak',    slots: 2  }
  ];

  const CHILD_RATE    = 0.75;
  const DEPOSIT       = 5000;
  const MAX_TRAVELERS = 20;
  const MAX_FILE_MB   = 5;
  const STORAGE_KEY   = 'sne_saved_pkgs';


  /* ========================================================================
     2. DOM & FORMATTING HELPERS
     ======================================================================== */
  const $  = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const peso          = (amount) => '₱' + Math.round(amount).toLocaleString('en-PH');
  const plural        = (n, word, many) => n + ' ' + (n === 1 ? word : (many || word + 's'));
  const toInt         = (value) => (/^\d+$/.test(String(value).trim()) ? parseInt(value, 10) : NaN);
  const makeReference = () => 'BT-' + (2100 + Math.floor(Math.random() * 900));

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value;
      else node.setAttribute(key, value);
    });
    children.forEach((child) => node.append(child));
    return node;
  }

  function summaryList(rows) {
    const dl = el('dl', { class: 'modal-list' });
    rows.forEach(([label, value]) => {
      dl.append(el('dt', { text: label }), el('dd', { text: value }));
    });
    return dl;
  }


  /* ========================================================================
     3. UI COMPONENTS (MODAL & FORM VALIDATION)
     ======================================================================== */
  const Modal = (function () {
    let dialog, titleEl, bodyEl;
    let opener     = null;
    let afterClose = null;

    function build() {
      dialog  = el('dialog', { class: 'modal', 'aria-labelledby': 'modalTitle' });
      titleEl = el('h2', { id: 'modalTitle' });
      bodyEl  = el('div', { class: 'modal-body' });

      const closeX   = el('button', { type: 'button', class: 'modal-x', 'aria-label': 'Close dialog', text: '×' });
      const closeBtn = el('button', { type: 'button', class: 'btn', text: 'Close' });
      const actions  = el('div', { class: 'modal-actions' }, [closeBtn]);
      const box      = el('div', { class: 'modal-box' }, [closeX, titleEl, bodyEl, actions]);

      dialog.append(box);
      document.body.append(dialog);

      closeX.addEventListener('click', close);
      closeBtn.addEventListener('click', close);
      dialog.addEventListener('click', (event) => {
        if (event.target === dialog) close();
      });

      dialog.addEventListener('close', () => {
        document.body.classList.remove('modal-open');
        if (opener && typeof opener.focus === 'function') opener.focus();
        if (afterClose) {
          const run = afterClose;
          afterClose = null;
          run();
        }
      });
    }

    function open({ title, body, onClose }) {
      if (!dialog) build();
      opener = document.activeElement;
      afterClose = onClose || null;
      titleEl.textContent = title;
      bodyEl.replaceChildren(...(Array.isArray(body) ? body : [body]));
      document.body.classList.add('modal-open');

      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');

      dialog.querySelector('.modal-x').focus();
    }

    function close() {
      if (!dialog) return;
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
        dialog.dispatchEvent(new Event('close'));
      }
    }

    return { open, close };
  })();

  const checks = {
    required: (label) => (value) => (value ? '' : 'Please enter ' + label + '.'),

    fullName: (value) => {
      if (!value) return 'Please enter your full name.';
      if (!/^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ.'\- ]*$/.test(value)) {
        return 'Use letters only (no numbers or symbols).';
      }
      if (value.split(/\s+/).length < 2) return 'Enter your first and last name.';
      return '';
    },

    email: (value) => {
      if (!value) return 'Please enter your email address.';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)
        ? ''
        : 'Enter a valid email, like you@example.com.';
    },

    phone: (value) => {
      if (!value) return 'Please enter a contact number.';
      const digits = value.replace(/[\s\-().]/g, '');
      return /^\+?\d{7,15}$/.test(digits)
        ? ''
        : 'Enter a valid number, like 0917 123 4567.';
    }
  };

  function createValidator(form, rules, onValid) {
    form.noValidate = true;

    const read = (field) => (field.type === 'file' ? field.files : field.value.trim());

    function setError(field, message) {
      const errorId = field.id + '-error';
      let note = document.getElementById(errorId);

      if (!message) {
        if (note) note.remove();
        field.removeAttribute('aria-invalid');
        field.removeAttribute('aria-describedby');
        return;
      }

      if (!note) {
        note = el('p', { class: 'field-error', id: errorId });
        field.insertAdjacentElement('afterend', note);
      }

      note.textContent = message;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', errorId);
    }

    function runRule(rule) {
      const field   = $(rule.field, form);
      const message = rule.check(read(field), field) || '';
      setError(field, message);
      return message;
    }

    const recheck = (rule) => {
      if ($(rule.field, form).dataset.touched) runRule(rule);
    };

    rules.forEach((rule) => {
      const field = $(rule.field, form);

      field.addEventListener('blur',   () => { field.dataset.touched = '1'; runRule(rule); });
      field.addEventListener('change', () => { field.dataset.touched = '1'; runRule(rule); });
      field.addEventListener('input',  () => { if (field.dataset.touched) runRule(rule); });

      (rule.deps || []).forEach((selector) => {
        $$(selector, form).forEach((dep) => {
          dep.addEventListener('input',  () => recheck(rule));
          dep.addEventListener('change', () => recheck(rule));
        });
      });
    });

    function showSummary(problems) {
      let box = $('.form-alert', form);
      if (!problems.length) {
        if (box) box.remove();
        return;
      }

      if (!box) {
        box = el('div', { class: 'form-alert', role: 'alert', tabindex: '-1' });
        const submit = $('[type="submit"]', form);
        submit.parentNode.insertBefore(box, submit);
      }

      const list = el('ul', {}, problems.map(({ field, message }) => {
        const label = $('label[for="' + field.id + '"]', form);
        const name  = label ? label.textContent.replace(/\s*\(.*\)\s*$/, '') : field.id;
        return el('li', { text: name + ': ' + message });
      }));

      box.replaceChildren(
        el('p', {
          text: problems.length === 1
            ? 'Please fix 1 field before continuing.'
            : 'Please fix ' + problems.length + ' fields before continuing.'
        }),
        list
      );
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      const problems = [];
      rules.forEach((rule) => {
        const field = $(rule.field, form);
        field.dataset.touched = '1';
        const message = runRule(rule);
        if (message) problems.push({ field, message });
      });

      showSummary(problems);

      if (problems.length) {
        problems[0].field.focus();
        return;
      }
      onValid();
    });

    function reset() {
      form.reset();
      rules.forEach((rule) => {
        const field = $(rule.field, form);
        delete field.dataset.touched;
        setError(field, '');
      });
      showSummary([]);
    }

    return { reset };
  }


  /* ========================================================================
     4. GLOBAL NAVIGATION: FLOATING SCROLL COMPASS
     ======================================================================== */
  function initScrollCompass() {
    const heroEl = $('.hero') || $('.region-hero');
    if (!heroEl) return;

    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const currentKey  = currentPath.replace('.html', '').toLowerCase();

    const wrap  = el('div', { class: 'floating-compass-wrap', id: 'floatingCompass' });
    const panel = el('div', { class: 'floating-compass-panel', hidden: '' });

    const closeBtn = el('button', {
      type: 'button',
      class: 'linkbtn',
      style: 'color:#f2b33d; padding:0; font-size:.82rem;',
      text: 'Hide ✕'
    });

    const head = el('div', { class: 'floating-compass-head' }, [
      el('strong', { text: 'Teyvat Compass' }),
      closeBtn
    ]);

    const nav = el('nav', { class: 'hero-compass', 'aria-label': 'Quick jump to Teyvat regions' });
    nav.append(
      el('span', { class: 'compass-orbit', 'aria-hidden': 'true' }),
      el('span', { class: 'compass-name', 'aria-hidden': 'true', text: 'TEYVAT' })
    );

    PACKAGE_LIST.forEach((pkg) => {
      const link = el('a', {
        class: `compass-node compass-${pkg.slug}`,
        href: `${pkg.slug}.html`,
        'aria-label': `Explore ${pkg.nation}`
      }, [
        el('span', { class: 'compass-dot' }),
        el('span', { class: 'compass-label', text: pkg.nation })
      ]);

      if (currentKey === pkg.slug) {
        link.setAttribute('aria-current', 'page');
      }
      nav.append(link);
    });

    const needle = el('span', { class: 'compass-needle', 'aria-hidden': 'true' });
    needle.innerHTML = `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <polygon points="10,100 100,92 190,100 100,108" fill="none" stroke="#E6B254" stroke-width="2" opacity=".8"/>
        <polygon points="30,100 100,97 170,100 100,103" fill="#E6B254" opacity=".9"/>
        <polygon points="100,20 104,100 100,180 96,100" fill="#FFEAA7" opacity=".7"/>
        <polygon points="100,10 115,100 100,190 85,100" fill="#E6B254"/>
        <polygon points="100,40 106,100 100,160 94,100" fill="#F4D03F"/>
      </svg>
    `;
    nav.append(needle);

    panel.append(
      head,
      el('p', {
        style: 'font-size:.78rem; color:#d6ebe7; margin-bottom:.25rem;',
        text: 'Select a node to jump directly to that nation.'
      }),
      nav
    );

    const iconSpan = el('span', { class: 'floating-compass-icon', 'aria-hidden': 'true' });
    iconSpan.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor"/>
      </svg>
    `;

    const toggleBtn = el('button', {
      type: 'button',
      class: 'floating-compass-btn',
      'aria-expanded': 'false',
      'aria-label': 'Toggle Teyvat navigation compass'
    }, [
      iconSpan,
      el('span', { text: 'Teyvat Compass' })
    ]);

    const setOpen = (open) => {
      panel.hidden = !open;
      toggleBtn.setAttribute('aria-expanded', String(open));
    };

    toggleBtn.addEventListener('click', () => setOpen(panel.hidden));
    closeBtn.addEventListener('click', () => setOpen(false));

    wrap.append(panel, toggleBtn);
    document.body.append(wrap);

    const checkScroll = () => {
      const triggerY = Math.max(240, heroEl.offsetHeight * 0.65);
      const show     = window.scrollY > triggerY;
      wrap.classList.toggle('is-visible', show);
      if (!show) setOpen(false);
    };

    window.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
  }


  /* ========================================================================
     5. LANDING PAGE: PACKAGES, SAVED HEARTS & BOOKING PREVIEWS
     ======================================================================== */
  function initSavedPersistence() {
    const checkboxes = $$('.pkg .toggle');
    const savedLabel = $('label[for="onlysaved"]');
    if (!checkboxes.length) return;

    const savedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    const updateBadge = () => {
      const count = checkboxes.filter((cb) => cb.checked).length;
      if (savedLabel) {
        savedLabel.textContent = count ? `♥ Saved only (${count})` : '♥ Saved only';
      }
    };

    checkboxes.forEach((cb) => {
      if (savedIds.includes(cb.id)) cb.checked = true;

      cb.addEventListener('change', () => {
        const current = checkboxes.filter((c) => c.checked).map((c) => c.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        updateBadge();
      });
    });

    updateBadge();
  }

  function initPackageCollapse() {
    const toggleListBtn = $('#toggleAllPkgs');
    const pkgListWrap   = $('#pkgListWrap');
    const collapsedBox  = $('#pkgCollapsedBox');
    const expandFromBox = $('#expandFromBox');
    const searchBtn     = $('#filter .btn');
    if (!toggleListBtn || !pkgListWrap) return;

    function setCollapsed(collapse) {
      pkgListWrap.hidden = collapse;
      if (collapsedBox) collapsedBox.hidden = !collapse;
      toggleListBtn.textContent = collapse ? 'Show all 7 packages' : 'Collapse list';
      toggleListBtn.setAttribute('aria-expanded', String(!collapse));
    }

    toggleListBtn.addEventListener('click', () => setCollapsed(!pkgListWrap.hidden));
    if (expandFromBox) expandFromBox.addEventListener('click', () => setCollapsed(false));
    if (searchBtn)     searchBtn.addEventListener('click', () => setCollapsed(false));
  }

  function initPackageFilter() {
    const form  = $('#filter');
    const cards = $$('.pkg');
    if (!form || !cards.length) return;

    const savedOnly  = $('#onlysaved');
    const status     = $('#pkgStatus');
    const clearBtn   = $('#pkgClear');
    const emptyBox   = $('#pkgEmpty');
    const emptyText  = $('#pkgEmptyText');
    const emptyReset = $('#pkgEmptyReset');
    const availability = $('#filterAvailability');
    const filterFields = [
      { key: 'nation', control: $('#dest') },
      { key: 'bud',    control: $('#bud') },
      { key: 'dur',    control: $('#dur') },
      { key: 'style',  control: $('#style') }
    ];

    const lastDeparture = DEPARTURES[DEPARTURES.length - 1].iso;

    function readFilters() {
      return {
        nation: $('#dest').value,
        date:   $('#date').value,
        bud:    $('#bud').value,
        dur:    $('#dur').value,
        style:  $('#style').value,
        saved:  savedOnly.checked
      };
    }

    function matches(card, f) {
      if (f.nation && card.dataset.nation !== f.nation) return false;
      if (f.bud    && card.dataset.bud    !== f.bud)    return false;
      if (f.dur    && card.dataset.dur    !== f.dur)    return false;
      if (f.style  && card.dataset.style  !== f.style)  return false;
      if (f.date   && lastDeparture < f.date)           return false;
      if (f.saved  && !$('.toggle:checked', card))      return false;
      return true;
    }

    function syncOptionAvailability() {
      let selectionsChanged = true;

      while (selectionsChanged) {
        selectionsChanged = false;
        const f = readFilters();

        filterFields.forEach(({ key, control }) => {
          $$('option', control).forEach((option) => {
            if (!option.value) {
              option.disabled = false;
              return;
            }

            const candidate = { ...f, [key]: option.value };
            option.disabled = !cards.some((card) => matches(card, candidate));
          });

          if (control.value && control.selectedOptions[0].disabled) {
            control.value = '';
            selectionsChanged = true;
          }
        });
      }

      if (availability) {
        const disabledOptions = filterFields.reduce(
          (count, { control }) => count + $$('option:disabled', control).length,
          0
        );
        availability.textContent = disabledOptions
          ? `${disabledOptions} incompatible filter option${disabledOptions === 1 ? '' : 's'} ${disabledOptions === 1 ? 'is' : 'are'} unavailable for the current selection.`
          : 'All filter options are available for the current selection.';
      }
    }

    function apply() {
      syncOptionAvailability();
      const f = readFilters();
      let shown = 0;

      cards.forEach((card) => {
        const visible = matches(card, f);
        card.hidden = !visible;
        if (visible) shown++;
      });

      const active = Boolean(f.nation || f.date || f.bud || f.dur || f.style || f.saved);

      status.textContent = active
        ? `Showing ${shown} of ${cards.length} packages.`
        : `Showing all ${cards.length} packages.`;
      clearBtn.hidden = !active;
      emptyBox.hidden = shown !== 0;

      if (shown === 0) {
        if (f.saved && !$('.pkg .toggle:checked')) {
          emptyText.textContent = 'You haven’t saved any packages yet. Tap the ♥ on a package to save it.';
        } else if (f.date && lastDeparture < f.date) {
          emptyText.textContent = 'There are no departures on or after that date. The last scheduled departure is ' +
                                  DEPARTURES[DEPARTURES.length - 1].label + '.';
        } else {
          emptyText.textContent = 'Try a different destination, budget, duration or style.';
        }
      }
    }

    const resetAll = () => {
      form.reset();
      savedOnly.checked = false;
      apply();
    };

    form.addEventListener('input', apply);
    form.addEventListener('change', apply);
    savedOnly.addEventListener('change', apply);
    cards.forEach((card) => {
      const heart = $('.toggle', card);
      if (heart) heart.addEventListener('change', apply);
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      apply();
    });
    $('.btn', form).addEventListener('click', apply);
    clearBtn.addEventListener('click', resetAll);
    if (emptyReset) emptyReset.addEventListener('click', resetAll);

    apply();
  }

  function initBookingDocPreviews() {
    const table = $('#bookings table');
    if (!table) return;

    table.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-doc], a.btn');
      if (!trigger) return;
      event.preventDefault();

      const row        = trigger.closest('tr');
      const cells      = $$('td', row);
      const refText    = cells[0]?.textContent.trim() || 'Booking';
      const dateText   = cells[1]?.textContent.trim() || '';
      const statusText = cells[3]?.textContent.trim() || '';

      Modal.open({
        title: trigger.textContent.trim(),
        body: [
          el('p', { text: 'Digital travel document preview for your Seven Nations Expedition reservation.' }),
          summaryList([
            ['Booking Ref',    refText],
            ['Departure Date', dateText],
            ['Status',         statusText],
            ['Issued By',      'Seven Nations Expedition · Mondstadt Office']
          ]),
          el('p', { class: 'notice sm', text: 'Prototype: PDF file generation is simulated in this frontend demo.' })
        ]
      });
    });
  }


  /* ========================================================================
     6. LANDING PAGE: INQUIRY FORM & INTERACTIVE FAQ / KATHERYNE
     ======================================================================== */
  function initInquiryForm() {
    const form = $('#inquiry');
    if (!form) return;

    let validator;

    const rules = [
      { field: '#iname',  check: checks.fullName },
      { field: '#iemail', check: checks.email },
      { field: '#idest',  check: (value) => (value ? '' : 'Choose the nation you want to ask about.') },
      {
        field: '#imsg',
        check: (value) => {
          if (!value) return 'Tell us a little about your trip or question.';
          if (value.length < 10) return 'Please write at least 10 characters.';
          if (value.length > 1000) return `Please keep it under 1,000 characters (now ${value.length}).`;
          return '';
        }
      }
    ];

    validator = createValidator(form, rules, () => {
      const firstName = $('#iname').value.trim().split(/\s+/)[0];

      Modal.open({
        title: `Thank you, ${firstName}!`,
        body: [
          el('p', { text: 'Your inquiry passed all checks. In the live site the agency would now reply by email with details for your chosen package.' }),
          summaryList([
            ['Name',        $('#iname').value.trim()],
            ['Email',       $('#iemail').value.trim()],
            ['Destination', $('#idest').value],
            ['Message',     $('#imsg').value.trim()]
          ]),
          el('p', { class: 'notice sm', text: 'Prototype: nothing was sent or saved.' })
        ],
        onClose: () => validator.reset()
      });
    });
  }

  function initFaqAndKatheryne() {
    const faqSection = $('#faq');
    if (!faqSection) return;

    const quoteEl   = $('.katheryne-quote', faqSection);
    const faqList   = $('.faqlist', faqSection);
    const items     = $$('details', faqList);
    const destField = $('#idest');
    const msgField  = $('#imsg');
    const heroDest  = $('#dest');

    const setKatheryneLine = (text) => {
      if (quoteEl) quoteEl.textContent = text;
    };

    if (destField) {
      destField.addEventListener('change', () => {
        const matched = PACKAGE_LIST.find((p) => p.nation === destField.value);
        setKatheryneLine(
          matched ? matched.katheryneNote : '“Ad astra abyssosque! Where shall we chart your next commission?”'
        );
      });

      if (heroDest) {
        heroDest.addEventListener('change', () => {
          if (heroDest.value && !destField.value) {
            destField.value = heroDest.value;
            destField.dispatchEvent(new Event('change'));
          }
        });
      }
    }

    items.forEach((detail) => {
      detail.addEventListener('toggle', () => {
        if (!detail.open) return;
        items.forEach((other) => {
          if (other !== detail) other.open = false;
        });
        setKatheryneLine('“A wise traveler always checks the guild’s terms first!”');
      });
    });

    if (faqList && items.length) {
      const searchInput = el('input', {
        type: 'search',
        id: 'faqSearch',
        placeholder: 'Search FAQ (e.g., refund, inclusions, code)...',
        'aria-label': 'Search frequently asked questions',
        style: 'margin-bottom: .85rem;'
      });
      const noMatch = el('p', {
        class: 'lead',
        hidden: '',
        style: 'font-size: .9rem; margin-top: .5rem;'
      });
      const askLink = el('button', {
        type: 'button',
        class: 'linkbtn',
        text: 'Ask this in the inquiry form →'
      });

      noMatch.append('No matching FAQ found. ', askLink);
      faqList.parentNode.insertBefore(searchInput, faqList);
      faqList.after(noMatch);

      searchInput.addEventListener('input', () => {
        const term = searchInput.value.trim().toLowerCase();
        let visibleCount = 0;

        items.forEach((detail) => {
          const match = !term || detail.textContent.toLowerCase().includes(term);
          detail.hidden = !match;
          if (match) {
            visibleCount++;
            if (term) detail.open = true;
          }
        });

        noMatch.hidden = visibleCount > 0;
        if (visibleCount === 0) {
          setKatheryneLine('“Hmm, that isn’t in our handbook—send us a direct inquiry!”');
        }
      });

      askLink.addEventListener('click', () => {
        if (!msgField) return;
        msgField.value = searchInput.value.trim();
        msgField.dispatchEvent(new Event('input'));
        msgField.focus();
      });
    }

    if (msgField) {
      const counter = el('small', {
        style: 'display:block; text-align:right; color:#b8d5d0; margin-top:.25rem; font-size:.78rem;',
        text: '0 / 1000 characters'
      });
      msgField.insertAdjacentElement('afterend', counter);

      msgField.addEventListener('input', () => {
        const len = msgField.value.length;
        counter.textContent = `${len} / 1000 characters`;
        counter.style.color = len > 900 ? '#ffb4ab' : '#b8d5d0';
      });
    }
  }


  /* ========================================================================
     7. REGION PAGES: SPOTS DECK, TRIP BUNDLE, LIGHTBOX & WIDGETS
     ======================================================================== */
  function initSpotsDeck() {
    const list = $('.spots');
    if (!list) return;

    const cards = $$('.spot', list);
    if (cards.length < 2) return;

    const wrap = el('div', { class: 'spots-deck-wrap' });
    list.parentNode.insertBefore(wrap, list);
    wrap.append(list);

    let activeIndex = 0;

    const dotsWrap = el('div', { class: 'spots-dots', role: 'tablist', 'aria-label': 'Featured stop slides' });
    const dots = cards.map((card, i) => {
      const title = ($('h4', card) || {}).textContent || `Stop ${i + 1}`;
      const dot = el('button', {
        type: 'button',
        class: 'spots-dot',
        'aria-label': `Show ${title}`
      });
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.append(dot);
      return dot;
    });

    const prevBtn = el('button', { type: 'button', class: 'btn sm alt', text: '← Prev' });
    const nextBtn = el('button', { type: 'button', class: 'btn sm', text: 'Next stop →' });
    const nav     = el('div', { class: 'spots-nav' }, [
      dotsWrap,
      el('div', { class: 'spots-btns' }, [prevBtn, nextBtn])
    ]);
    wrap.append(nav);

    function render() {
      const total = cards.length;
      cards.forEach((card, i) => {
        const offset = (i - activeIndex + total) % total;
        card.dataset.pos = offset <= 3 ? String(offset) : 'hidden';
        card.setAttribute('aria-hidden', offset === 0 ? 'false' : 'true');
      });

      dots.forEach((dot, i) => {
        if (i === activeIndex) dot.setAttribute('aria-current', 'true');
        else dot.removeAttribute('aria-current');
      });
    }

    function goTo(index) {
      const total = cards.length;
      activeIndex = (index + total) % total;
      render();
    }

    cards.forEach((card, i) => {
      card.addEventListener('click', () => {
        if (i !== activeIndex) goTo(i);
      });
    });

    prevBtn.addEventListener('click', () => goTo(activeIndex - 1));
    nextBtn.addEventListener('click', () => goTo(activeIndex + 1));

    render();
  }

  function initTripBundleAndFoods() {
    const foodsBox = $('.morephotos');
    const incBox   = $('.inc');
    const itinDays = $$('main details:not(.morephotos)');

    if (foodsBox && incBox && itinDays.length) {
      const masterWrap = el('details', { class: 'trip-bundle', open: '' });
      const summaryBar = el('summary', { class: 'trip-bundle-head' }, [
        el('div', {}, [
          el('strong', { text: 'Trip Details: Foods, Itinerary & Inclusions' }),
          el('small', {
            style: 'display:block; color:var(--mute); font-weight:400; margin-top:.15rem;',
            text: `Includes ${$$('.food-item', foodsBox).length} regional dishes, ${itinDays.length}-day itinerary, and package inclusions`
          })
        ]),
        el('span', { class: 'btn sm alt bundle-toggle-label', text: 'Hide details' })
      ]);

      const bundleBody = el('div', { class: 'trip-bundle-body' });
      foodsBox.parentNode.insertBefore(masterWrap, foodsBox);
      masterWrap.append(summaryBar, bundleBody);
      bundleBody.append(foodsBox);

      const possibleItinH = itinDays[0].previousElementSibling;
      if (possibleItinH && /^H[2-4]$/.test(possibleItinH.tagName)) {
        bundleBody.append(possibleItinH);
      }
      itinDays.forEach((day) => bundleBody.append(day));
      bundleBody.append(incBox);

      const badge = $('.bundle-toggle-label', summaryBar);
      masterWrap.addEventListener('toggle', () => {
        badge.textContent = masterWrap.open ? 'Hide details' : 'Open details';
      });
    }

    // Foods Lightbox Modal
    $$('.morephotos .food-item').forEach((item) => {
      const thumb   = $('.th', item);
      const caption = ($('figcaption', item) || {}).textContent || 'Local Specialty';
      if (!thumb) return;

      thumb.style.cursor = 'zoom-in';
      thumb.setAttribute('role', 'button');
      thumb.setAttribute('tabindex', '0');
      thumb.setAttribute('aria-label', `Preview ${caption}`);

      const openFood = () => {
        const bg = thumb.style.getPropertyValue('--img');
        const preview = el('div', {
          style: `height: 280px; border-radius: 6px; margin-bottom: .75rem; background: ${bg} center / cover no-repeat, #0e5a6b;`
        });
        Modal.open({
          title: caption,
          body: [
            preview,
            el('p', { text: 'Featured regional dish included in local culinary stops during your expedition.' })
          ]
        });
      };

      thumb.addEventListener('click', openFood);
      thumb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openFood();
        }
      });
    });

    // Itinerary Expand / Collapse All
    const allDetails = $$('main details:not(.morephotos):not(.trip-bundle)');
    if (allDetails.length > 1) {
      allDetails.forEach((d) => d.classList.add('itin-day'));

      const itinHeading = allDetails[0].previousElementSibling;
      if (itinHeading && /^H[2-4]$/.test(itinHeading.tagName)) {
        const headerBar = el('div', { class: 'bar', style: 'margin: 1.25rem 0 .6rem;' });
        const toggleAll = el('button', { type: 'button', class: 'linkbtn', text: 'Expand all days' });
        itinHeading.style.margin = '0';
        itinHeading.parentNode.insertBefore(headerBar, itinHeading);
        headerBar.append(itinHeading, toggleAll);

        toggleAll.addEventListener('click', () => {
          const shouldOpen = allDetails.some((d) => !d.open);
          allDetails.forEach((d) => { d.open = shouldOpen; });
          toggleAll.textContent = shouldOpen ? 'Collapse all' : 'Expand all days';
        });
      }
    }
  }

  function initDeparturesAndSidebarWidgets() {
    const depSelect = $('#dep');
    if (!depSelect) return;

    const depTable = $$('main table').find((t) => /Season/i.test(t.textContent));
    if (!depTable) return;

    depTable.classList.add('dep-table');
    const rows = $$('tbody tr', depTable);

    const syncActiveRow = () => {
      const selectedDate = depSelect.value;
      rows.forEach((row) => {
        const dateCell = $('td', row);
        const isMatch  = dateCell && dateCell.textContent.trim() === selectedDate;
        row.classList.toggle('is-selected', isMatch);
      });
    };

    const tableWrap     = depTable.closest('.scroll') || depTable;
    const currentNation = ($('#pk') && $('#pk').selectedOptions[0]?.textContent.split('–')[0].trim()) || 'Fontaine';
    const currentPkg    = PACKAGE_LIST.find((p) => currentNation.includes(p.nation)) || PACKAGES.fontaine;

    const checklistCard = el('div', { class: 'card mt region-filler-card' }, [
      el('h3', { text: `${currentPkg.nation} Packing Checklist` }),
      el('p', {
        class: 'lead',
        style: 'font-size:.88rem; margin-bottom:.6rem;',
        text: 'Tap items to check off what you already have ready:'
      }),
      el('ul', { class: 'pack-list' }, currentPkg.packingTips.map((item, idx) => {
        const cbId = 'pack-' + idx;
        return el('li', { class: 'check' }, [
          el('input', { type: 'checkbox', id: cbId }),
          el('label', { for: cbId, text: item })
        ]);
      }))
    ]);

    const otherRegions = PACKAGE_LIST.filter((p) => p.nation !== currentPkg.nation);
    const switcherCard = el('div', { class: 'card mt region-filler-card' }, [
      el('h3', { text: 'Compare other nations' }),
      el('p', {
        class: 'lead',
        style: 'font-size:.88rem; margin-bottom:.75rem;',
        text: 'Switch directly to another Teyvat expedition:'
      }),
      el('div', { class: 'region-links-grid' }, otherRegions.map((p) =>
        el('a', { class: 'region-mini-link', href: `${p.slug}.html` }, [
          el('strong', { text: p.nation }),
          el('span', { text: peso(p.base) })
        ])
      ))
    ]);

    tableWrap.after(checklistCard, switcherCard);

    rows.forEach((row) => {
      const cells = $$('td', row);
      if (cells.length < 4) return;
      const dateText  = cells[0].textContent.trim();
      const slotMatch = cells[3].textContent.trim().match(/^(\d+)\s+of\s+\d+/);

      if (slotMatch && Number(slotMatch[1]) <= 5) {
        cells[3].innerHTML = `<span class="st wait">${cells[3].textContent.trim()} · Low</span>`;
      }

      row.title = `Click to select ${dateText} in the booking form`;
      row.addEventListener('click', () => {
        depSelect.value = dateText;
        depSelect.dispatchEvent(new Event('change', { bubbles: true }));
        syncActiveRow();
        depSelect.focus();
      });
    });

    depSelect.addEventListener('change', syncActiveRow);
    syncActiveRow();
  }


  /* ========================================================================
     8. REGION PAGES: BOOKING SIDEBAR STACK, MODAL & CALCULATOR
     ======================================================================== */
  function initBookingForm() {
    const form = $('#bookForm');
    if (!form) return;

    // 1. Setup Sticky Sidebar Stack & Modal Popup for #bookForm
    const initialPkg = PACKAGES[$('#pk')?.value] || PACKAGES.natlan;

    const parentCard = form.closest('.card');
    if (parentCard && parentCard !== form) {
      parentCard.classList.remove('card');
    }

    const bookModal = el('dialog', { class: 'modal booking-modal', 'aria-labelledby': 'bookModalTitle' });
    const bookModalClose = el('button', {
      type: 'button',
      class: 'modal-x',
      'aria-label': 'Close booking form',
      text: '×'
    });
    const bookModalBox = el('div', { class: 'modal-box' }, [bookModalClose]);
    bookModal.append(bookModalBox);
    document.body.append(bookModal);

    // Card 1: Quick-Booking Launcher
    const promoCard = el('div', { class: 'card book-launcher-card' }, [
      el('p', { class: 'about-kicker', text: 'Reserve your slots' }),
      el('h2', { text: `Ready for ${initialPkg.nation}?` }),
      el('p', {
        class: 'lead',
        style: 'font-size:.92rem;',
        text: 'Select your departure date, group size, add-ons, and payment plan in one quick step.'
      }),
      el('div', { class: 'launcher-price-box' }, [
        el('span', { class: 'launcher-price-label', text: 'Starting rate' }),
        el('div', { class: 'price' }, [
          document.createTextNode(`${peso(initialPkg.base)} `),
          el('small', { text: '/ person' })
        ])
      ]),
      el('ul', { class: 'launcher-perks' }, [
        el('li', { text: '✓ Live departure slots & instant quote' }),
        el('li', { text: '✓ Pay in full, ₱5,000 deposit, or split in 3' }),
        el('li', { text: '✓ GCash, Maya, Card, or bank proof accepted' })
      ]),
      el('button', {
        type: 'button',
        class: 'btn block',
        id: 'openBookingModalBtn',
        text: 'Book this trip →'
      }),
      el('a', {
        href: 'index.html#inquiry',
        class: 'btn alt block',
        style: 'margin-top:.55rem;',
        text: 'Have questions? Send an inquiry'
      })
    ]);

    // Card 2: Director's Field Note
    const directorTipCard = el('div', { class: 'card side-advisory', style: 'margin-top:0;' }, [
      el('strong', { text: '✦ Director’s Field Note' }),
      el('p', { text: initialPkg.directorTip })
    ]);

    // Card 3: Quick Trip Snapshot
    const snapshotCard = el('div', { class: 'card region-filler-card' }, [
      el('h3', { text: 'Trip Snapshot' }),
      el('dl', { class: 'snapshot-list' }, [
        el('div', {}, [el('dt', { text: 'Package Code' }), el('dd', { text: initialPkg.code })]),
        el('div', {}, [el('dt', { text: 'Group Limit' }),  el('dd', { text: 'Up to 20 travelers' })]),
        el('div', {}, [el('dt', { text: 'Confirmation' }), el('dd', { text: 'Instant slot hold' })]),
        el('div', {}, [el('dt', { text: 'Support' }),      el('dd', { text: '24/7 Guild Assistance' })])
      ])
    ]);

    const sidebarStack = el('div', { class: 'book-sidebar-stack' }, [
      promoCard,
      directorTipCard,
      snapshotCard
    ]);

    form.parentNode.insertBefore(sidebarStack, form);
    bookModalBox.append(form);

    const openBookingModal = () => {
      document.body.classList.add('modal-open');
      if (typeof bookModal.showModal === 'function') bookModal.showModal();
      else bookModal.setAttribute('open', '');
      $('#pk')?.focus();
    };

    const closeBookingModal = () => {
      if (typeof bookModal.close === 'function') bookModal.close();
      else bookModal.removeAttribute('open');
      document.body.classList.remove('modal-open');
      $('#openBookingModalBtn')?.focus();
    };

    $('#openBookingModalBtn').addEventListener('click', openBookingModal);
    bookModalClose.addEventListener('click', closeBookingModal);
    bookModal.addEventListener('click', (e) => {
      if (e.target === bookModal) closeBookingModal();
    });
    bookModal.addEventListener('close', () => {
      document.body.classList.remove('modal-open');
    });

    $$('a[href="#bookForm"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        openBookingModal();
      });
    });

    // 2. Calculator & Validation Logic
    const pkSelect   = $('#pk');
    const depSelect  = $('#dep');
    const tierSelect = $('#tier');
    const addons     = $$('.check input[type="checkbox"]', form);
    const summary    = $('.sum', form);

    $$('option', depSelect).forEach((option) => {
      const dep = DEPARTURES.find((d) => d.label === option.value);
      if (dep) {
        option.textContent = `${dep.label} · ${dep.slots} left`;
      }
    });

    function readState() {
      const pkg        = PACKAGES[pkSelect.value];
      const dep        = DEPARTURES.find((d) => d.label === depSelect.value) || DEPARTURES[0];
      const adults     = toInt($('#ad').value);
      const children   = toInt($('#ch').value);
      const infants    = toInt($('#in').value);
      const tierOption = tierSelect.options[tierSelect.selectedIndex];

      const chosenAddons = addons
        .filter((box) => box.checked)
        .map((box) => ({
          label: $('label[for="' + box.id + '"]', form).textContent.replace(/\s*\(.*\)\s*$/, ''),
          price: Number(box.dataset.price)
        }));

      return {
        pkg,
        dep,
        adults:    isNaN(adults)   ? 0 : adults,
        children:  isNaN(children) ? 0 : children,
        infants:   isNaN(infants)  ? 0 : infants,
        tierName:  tierOption.text.replace(/\s*\(.*\)\s*$/, ''),
        tierPrice: Number(tierSelect.value),
        addons:    chosenAddons,
        plan:      ($('input[name="plan"]:checked', form) || {}).value || 'full',
        method:    ($('input[name="m"]:checked', form) || {}).value || 'gcash'
      };
    }

    function quote(s) {
      const season      = s.dep.season === 'Peak' ? s.pkg.peak : s.pkg.base;
      const adultFare   = season + s.tierPrice;
      const childFare   = Math.round(adultFare * CHILD_RATE);
      const addonsTotal = s.addons.reduce((sum, a) => sum + a.price, 0);
      const total       = s.adults * adultFare + s.children * childFare + addonsTotal;

      let dueNow = total;
      if (s.plan === 'deposit') dueNow = Math.min(DEPOSIT, total);
      if (s.plan === 'split')   dueNow = Math.ceil(total / 3);

      return { adultFare, childFare, addonsTotal, total, dueNow, balance: total - dueNow };
    }

    function renderSummary() {
      const s = readState();
      const q = quote(s);

      $('h3', summary).textContent =
        `Price summary: ${s.pkg.nation}, ${plural(s.adults, 'adult')}` +
        (s.children ? ` + ${plural(s.children, 'child', 'children')}` : '');

      const row = (label, value, extraClass) =>
        el('div', { class: 'row' + (extraClass ? ' ' + extraClass : '') }, [
          el('span', { text: label }),
          el('span', { text: value })
        ]);

      const notes = [];
      if (s.tierPrice) notes.push(s.tierName);
      if (s.dep.season === 'Peak') notes.push('peak');

      const tierNote = notes.length ? ` (${notes.join(', ')})` : '';
      const rows = [
        row(`${plural(s.adults, 'adult')} × ${peso(q.adultFare)}${tierNote}`, peso(s.adults * q.adultFare))
      ];

      if (s.children) rows.push(row(`${plural(s.children, 'child', 'children')} × ${peso(q.childFare)}`, peso(s.children * q.childFare)));
      if (s.infants)  rows.push(row(`${plural(s.infants, 'infant')} (free)`, peso(0)));

      if (s.addons.length) s.addons.forEach((a) => rows.push(row(a.label, peso(a.price))));
      else rows.push(row('Add-ons', peso(0)));

      rows.push(row('Total', peso(q.total), 'tot'));

      $$('.row', summary).forEach((old) => old.remove());
      summary.append(...rows);
    }

    form.addEventListener('input', renderSummary);
    form.addEventListener('change', renderSummary);

    let validator;

    const rules = [
      {
        field: '#dep',
        deps: ['#ad', '#ch', '#pk'],
        check: () => {
          const s = readState();
          const seatsNeeded = s.adults + s.children;
          if (seatsNeeded > s.dep.slots) {
            return `Only ${plural(s.dep.slots, 'seat')} left on ${s.dep.label}, but you need ${seatsNeeded}. Pick another date or reduce travelers.`;
          }
          return '';
        }
      },
      {
        field: '#ad',
        check: (value) => {
          const n = toInt(value);
          if (isNaN(n))          return 'Enter the number of adults (at least 1).';
          if (n < 1)             return 'At least 1 adult must travel.';
          if (n > MAX_TRAVELERS) return `A booking can have up to ${MAX_TRAVELERS} adults. Send an inquiry for larger groups.`;
          return '';
        }
      },
      {
        field: '#ch',
        deps: ['#ad'],
        check: (value) => {
          const n = toInt(value);
          if (isNaN(n))          return 'Enter 0 if no children are travelling.';
          if (n > MAX_TRAVELERS) return 'That is more than a departure can hold.';
          return '';
        }
      },
      {
        field: '#in',
        deps: ['#ad'],
        check: (value) => {
          const n = toInt(value);
          if (isNaN(n)) return 'Enter 0 if no infants are travelling.';
          if (n > toInt($('#ad').value)) return 'Each infant must travel with an adult (infants cannot exceed adults).';
          return '';
        }
      },
      { field: '#gn', check: checks.fullName },
      {
        field: '#pp',
        check: (value) => {
          if (!value) return 'Please enter your ID or passport number.';
          return /^[A-Za-z0-9][A-Za-z0-9 \-]{4,19}$/.test(value)
            ? ''
            : 'Use 5–20 letters or numbers (dashes allowed).';
        }
      },
      {
        field: '#ec',
        check: (value) => {
          if (!value) return 'Please enter an emergency contact name.';
          return value.length >= 2 && /^[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ.'\- ]*$/.test(value)
            ? ''
            : 'Use letters only.';
        }
      },
      { field: '#ep', check: checks.phone },
      {
        field: '#diet',
        check: (value) => (value.length > 200 ? 'Please keep dietary notes under 200 characters.' : '')
      },
      {
        field: '#proof',
        deps: ['input[name="m"]'],
        check: (files) => {
          const needsProof = ($('input[name="m"]:checked', form) || {}).value === 'proof';
          if (!files.length) return needsProof ? 'Upload your proof of payment (image or PDF).' : '';
          const file   = files[0];
          const okType = /^image\//.test(file.type) || file.type === 'application/pdf' || /\.(pdf|jpe?g|png|webp|heic)$/i.test(file.name);
          if (!okType) return 'Upload an image (JPG, PNG) or a PDF.';
          if (file.size > MAX_FILE_MB * 1024 * 1024) return `File is too large. The limit is ${MAX_FILE_MB} MB.`;
          return '';
        }
      }
    ];

    validator = createValidator(form, rules, () => {
      const s = readState();
      const q = quote(s);

      const travelers = [plural(s.adults, 'adult')];
      if (s.children) travelers.push(plural(s.children, 'child', 'children'));
      if (s.infants)  travelers.push(plural(s.infants, 'infant'));

      const planNames   = { full: 'Pay in full', deposit: `${peso(DEPOSIT)} deposit`, split: 'Split in 3' };
      const methodNames = { gcash: 'GCash', maya: 'Maya', card: 'Card', proof: 'Upload proof' };

      closeBookingModal();

      Modal.open({
        title: 'Reservation received',
        body: [
          el('p', { text: `Thank you, ${$('#gn').value.trim().split(/\s+/)[0]}. Your details passed every check. Here is your booking summary.` }),
          summaryList([
            ['Reference',         makeReference()],
            ['Package',           `${s.pkg.nation}: ${s.pkg.name} (${s.pkg.code})`],
            ['Departure',         s.dep.label + (s.dep.season === 'Peak' ? ' (peak)' : '')],
            ['Tier',              s.tierName],
            ['Travelers',         travelers.join(', ')],
            ['Add-ons',           s.addons.length ? s.addons.map((a) => a.label).join(', ') : 'None'],
            ['Total',             peso(q.total)],
            ['Payment',           `${planNames[s.plan]} via ${methodNames[s.method]}`],
            ['Due now',           peso(q.dueNow)],
            ['Balance',           peso(q.balance)],
            ['Lead guest',        $('#gn').value.trim()],
            ['Emergency contact', `${$('#ec').value.trim()}, ${$('#ep').value.trim()}`]
          ]),
          el('p', { class: 'notice sm', text: 'Prototype: no reservation was saved and no payment was taken.' })
        ],
        onClose: () => {
          validator.reset();
          renderSummary();
        }
      });
    });

    renderSummary();
  }


  /* ========================================================================
     9. START-UP INITIALIZATION
     ======================================================================== */
  // Global
  initScrollCompass();

  // Landing Page (index.html)
  initSavedPersistence();
  initPackageCollapse();
  initPackageFilter();
  initBookingDocPreviews();
  initInquiryForm();
  initFaqAndKatheryne();

  // Region Pages
  initSpotsDeck();
  initTripBundleAndFoods();
  initDeparturesAndSidebarWidgets();
  initBookingForm();

})();
