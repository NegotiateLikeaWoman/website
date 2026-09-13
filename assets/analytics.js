/* =====================================================================
   Shared analytics, cookie consent, attribution and click tracking.

   Include on any page with:
       <script src="/assets/analytics.js" defer></script>

   What this does, in order:

     1. Cookie consent. Google Analytics loads only after the visitor
        accepts. The choice is kept in localStorage under the same key
        the programme page uses, so answering the banner once covers
        the whole site.

     2. Attribution. Captures utm_* parameters on arrival and remembers
        them for 30 days. An untagged visit from another site keeps the
        referring hostname instead, so it isn't lost as "direct".

     3. Link decoration. Appends that attribution to outbound links that
        land on a platform with its own reporting — Luma, Ticket Tailor,
        Tally, Brevo, the booking calendar. So a registration on Luma can
        be traced back to the LinkedIn post that started it, inside Luma's
        own dashboard, with no dependency on GA.

     4. Click tracking. Fires GA4 events for outbound clicks, WhatsApp
        and email links. Every call is guarded, so nothing breaks if the
        visitor declined cookies and GA never loaded.

   A "Cookie settings" link can reopen the banner with:
       <a href="#" onclick="cookiePrefs();return false">Cookie settings</a>

   The programme page (/closing-the-gap/) carries its own inline copy of
   all of this and does not load this file. Changing this file does not
   affect that page.

   NOTE: GA4 hides custom event parameters unless they are registered as
   custom dimensions. For click_outbound to be readable, create custom
   dimensions for 'link_url' and 'location' in Admin → Custom definitions.
   It is not retrospective.
   ===================================================================== */
(function () {
  var GA_ID = 'G-9HWKQJCLPP';
  var KEY   = 'ctg-analytics-consent';
  var PRIVACY = 'https://www.negotiationwhisperer.co/privacy_policy';

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  window.loadAnalytics = function () {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    var t = document.createElement('script');
    t.async = true;
    t.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(t);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  };

  var STYLE =
    '#cookiebar{position:fixed;left:0;right:0;bottom:0;z-index:99;' +
    'background:#1a1f2b;color:#f2ede7;padding:1.1rem 1.6rem;' +
    'font-family:system-ui,-apple-system,sans-serif;font-size:0.85rem;line-height:1.5;' +
    'display:none;align-items:center;gap:1.2rem;flex-wrap:wrap;justify-content:center}' +
    '#cookiebar a{color:#f2ede7}' +
    '#cookiebar button{font-family:inherit;font-size:0.85rem;padding:0.55rem 1.2rem;' +
    'cursor:pointer;border:1px solid #f2ede7;background:none;color:#f2ede7}' +
    '#cookiebar button.yes{background:#f2ede7;color:#1a1f2b;border-color:#f2ede7}' +
    '@media(max-width:520px){#cookiebar{padding:1rem;font-size:0.8rem}' +
    '#cookiebar button{flex:1}}';

  function build() {
    if (document.getElementById('cookiebar')) return;
    var s = document.createElement('style');
    s.textContent = STYLE;
    document.head.appendChild(s);

    var bar = document.createElement('div');
    bar.id = 'cookiebar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', 'Cookie choices');
    bar.innerHTML =
      '<span>We’d like to use analytics cookies to understand how this page is used. ' +
      'Nothing is set unless you agree. <a href="' + PRIVACY + '">Privacy notice</a>.</span>' +
      '<span style="display:flex;gap:0.6rem">' +
      '<button class="yes" type="button">Accept</button>' +
      '<button type="button">Decline</button></span>';
    document.body.appendChild(bar);

    var btns = bar.querySelectorAll('button');
    btns[0].addEventListener('click', function () { choose('yes'); });
    btns[1].addEventListener('click', function () { choose('no'); });
  }

  function show(on) {
    var bar = document.getElementById('cookiebar');
    if (bar) bar.style.display = on ? 'flex' : 'none';
  }

  function choose(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    show(false);
    if (v === 'yes') window.loadAnalytics();
  }

  window.cookiePrefs = function () { build(); show(true); };

  /* ------------------------------------------------------------------
     Attribution — where this visitor came from, remembered for 30 days.
     A tagged link always wins: last non-direct click.
     ------------------------------------------------------------------ */
  var ATTR_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'ref'];
  var STORE     = 'ctg-attrib';
  var MAXAGE    = 30 * 24 * 60 * 60 * 1000;

  // Used when we know nothing else — records that the click came off the site.
  var FALLBACK = { utm_source: 'nlaw-site', utm_medium: 'website' };

  // Attribution is only written to storage once the visitor has accepted.
  // Without consent it still works, but only for the current page view —
  // nothing is kept on the device. Keeps the 30-day memory lawful under PECR.
  function consented() {
    try { return localStorage.getItem(KEY) === 'yes'; } catch (e) { return false; }
  }

  function remember(data) {
    if (!consented()) return;
    try { localStorage.setItem(STORE, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
  }

  function attribution() {
    var qs = new URLSearchParams(location.search);
    var fresh = {};
    ATTR_KEYS.forEach(function (k) { var v = qs.get(k); if (v) fresh[k] = v; });

    var saved = {};
    if (consented()) {
      try {
        var raw = JSON.parse(localStorage.getItem(STORE) || 'null');
        if (raw && (Date.now() - raw.ts) < MAXAGE) saved = raw.data || {};
      } catch (e) {}
    }

    if (Object.keys(fresh).length) {
      saved = fresh;
      remember(saved);
    } else if (!Object.keys(saved).length && document.referrer &&
               document.referrer.indexOf(location.hostname) === -1) {
      try {
        saved = { utm_source: new URL(document.referrer).hostname, utm_medium: 'referral' };
        remember(saved);
      } catch (e) {}
    }
    return saved;
  }

  /* ------------------------------------------------------------------
     Decoration — pass attribution on to platforms that report on it.
     Anything already present in the link wins; we never overwrite a tag
     that was written deliberately.
     ------------------------------------------------------------------ */
  var DESTINATIONS =
    /luma\.com|lu\.ma|tickettailor\.com|tally\.so|typeform|systeme\.io|sibforms|brevo|calendar\.app\.google/i;

  function decorate(root) {
    var attrib = window.__attrib || {};
    var params = Object.keys(attrib).length ? attrib : FALLBACK;

    (root || document).querySelectorAll('a[href], iframe[src]').forEach(function (el) {
      var attr = el.tagName === 'IFRAME' ? 'src' : 'href';
      var h = el.getAttribute(attr);
      if (!h || !/^https?:/i.test(h) || !DESTINATIONS.test(h)) return;
      try {
        var u = new URL(h);
        Object.keys(params).forEach(function (k) {
          if (params[k] && !u.searchParams.get(k)) u.searchParams.set(k, params[k]);
        });
        el.setAttribute(attr, u.toString());
      } catch (e) {}
    });
  }

  /* ------------------------------------------------------------------
     Click tracking. Delegated from the document so it covers links that
     are rendered after load — the events list builds itself from JS.
     ------------------------------------------------------------------ */
  function ev(name, params) {
    if (typeof window.gtag === 'function' && window.__gaLoaded) {
      window.gtag('event', name, params || {});
    }
  }

  function slug(s) {
    return String(s).trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
  }

  // Names the place a click happened, so the GA report says which event or
  // section it was rather than just counting clicks. Walks up from the link
  // looking for a kicker, then a heading, then an id.
  function where(el) {
    var n = el;
    while (n && n.tagName && n.tagName !== 'BODY') {
      var k = n.querySelector && n.querySelector('.kicker');
      if (k && k.textContent.trim()) return slug(k.textContent);
      var h = n.querySelector && n.querySelector('h1, h2, h3');
      if (h && h.textContent.trim()) return slug(h.textContent);
      if (n.id) return slug(n.id);
      n = n.parentElement;
    }
    return 'unknown';
  }

  function trackClicks() {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!a) return;
      var href = a.getAttribute('href') || '';
      var loc  = where(a);

      if (/wa\.me|whatsapp/i.test(href))      ev('click_whatsapp', { location: loc });
      else if (/^mailto:/i.test(href))        ev('click_email',    { location: loc });
      else if (/^https?:/i.test(href) && href.indexOf(location.hostname) === -1)
        ev('click_outbound', { location: loc, link_url: href });

      // Registering for an event is the outcome that matters on this site.
      if (/luma\.com|lu\.ma|tickettailor\.com/i.test(href))
        ev('begin_registration', { location: loc, link_url: href });
    }, true);
  }

  function start() {
    window.__attrib = attribution();

    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    if (v === 'yes') { window.loadAnalytics(); }
    else { build(); if (v !== 'no') show(true); }

    decorate();
    trackClicks();

    // The events list, and any embedded form, render after this runs.
    if (window.MutationObserver) {
      new MutationObserver(function () { decorate(); })
        .observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
