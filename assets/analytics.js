/* =====================================================================
   Shared analytics + cookie consent.

   Include on any page with:
       <script src="/assets/analytics.js" defer></script>

   Google Analytics loads only after the visitor accepts. The choice is
   kept in localStorage under the same key the programme page uses, so
   answering the banner once covers the whole site.

   A "Cookie settings" link can reopen the banner with:
       <a href="#" onclick="cookiePrefs();return false">Cookie settings</a>

   The programme page (/closing-the-gap/) carries its own inline copy of
   this logic and does not load this file.
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

  function start() {
    var v = null;
    try { v = localStorage.getItem(KEY); } catch (e) {}
    if (v === 'yes') { window.loadAnalytics(); return; }
    build();
    if (v !== 'no') show(true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
