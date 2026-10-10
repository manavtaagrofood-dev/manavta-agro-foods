
(() => {
  'use strict';
  const pages = [...document.querySelectorAll('.page')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  const mobileMenu = document.getElementById('mobileMenu');
  const pageIds = ['home','about','products','exports','contact'];

  function updateUrl(id) {
    if (history.replaceState) history.replaceState(null, '', `#${id}`);
  }

  window.showPage = function(id, btn) { if(navigator.vibrate)navigator.vibrate(6);
    const page = document.getElementById(`page-${id}`);
    if (!page) return;
    pages.forEach(p => p.classList.toggle('active', p === page));
    navLinks.forEach(link => link.classList.remove('active'));
    const active = btn || navLinks.find(link => link.textContent.trim().toLowerCase().replace(/\s+/g,'-').includes(id));
    if (active) { active.classList.add('active'); active.setAttribute('aria-current','page'); }
    navLinks.filter(link => link !== active).forEach(link => link.removeAttribute('aria-current'));
    closeMenu();
    updateUrl(id);
    window.scrollTo({top:0, behavior:'smooth'});
    setTimeout(() => { initReveal(); initCounters(); }, 50);
  };

  window.toggleMenu = function() { const open=mobileMenu.classList.toggle('open'); document.querySelector('.hamburger')?.setAttribute('aria-expanded',String(open)); };
  window.closeMenu = function() { mobileMenu.classList.remove('open'); document.querySelector('.hamburger')?.setAttribute('aria-expanded','false'); };

  function routeFromHash() {
    const id = location.hash.replace('#','');
    if (pageIds.includes(id)) showPage(id);
  }
  window.addEventListener('hashchange', routeFromHash);

  window.addEventListener('scroll', () => {
    const nav = document.getElementById('nav');
    nav.classList.toggle('scrolled', window.scrollY > 50);
    nav.classList.toggle('top', window.scrollY <= 50);
    document.getElementById('back-top').classList.toggle('visible', window.scrollY > 300);
    document.getElementById('fab').classList.toggle('visible', window.scrollY > 300);
  }, {passive:true});

  function initReveal() {
    const els = document.querySelectorAll('.page.active .reveal, .page.active .reveal-left, .page.active .reveal-right');
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('visible')); return; }
    const obs = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    }), {threshold:.12});
    els.forEach(el => obs.observe(el));
  }

  const counted = new WeakSet();
  function animateCounter(el, target, duration=1400) {
    if (counted.has(el)) return;
    counted.add(el);
    let startTime;
    const suffix = el.closest('.hero-stat-num') ? '+' : '';
    const step = now => {
      startTime ||= now;
      const p = Math.min((now-startTime)/duration,1);
      const ease = 1-Math.pow(1-p,3);
      el.textContent = Math.floor(ease*target) + (p===1 ? suffix : '');
      if (p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function initCounters() {
    document.querySelectorAll('.page.active [data-count]').forEach(el => {
      if (!('IntersectionObserver' in window)) return animateCounter(el, Number(el.dataset.count));
      const obs = new IntersectionObserver(entries => entries.forEach(entry => {
        if (entry.isIntersecting) { animateCounter(entry.target, Number(entry.target.dataset.count)); obs.unobserve(entry.target); }
      }), {threshold:.3});
      obs.observe(el);
    });
  }
const API_BASE = (
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000'
).replace(/\/$/, '');
  const analyticsId = import.meta.env.VITE_GA4_MEASUREMENT_ID || import.meta.env.VITE_GA4_ID;
  const siteUrl = import.meta.env.VITE_SITE_URL;
  if (siteUrl) { const canonical=document.querySelector('[data-canonical]'); if(canonical) canonical.href=siteUrl; }

  // Privacy-first consent: optional analytics is not loaded until the visitor opts in.
  const CONSENT_KEY = 'ma_cookie_consent_v1';
  const consentBanner = document.getElementById('cookieConsent');
  const consentDialog = document.getElementById('cookieSettings');
  const analyticsToggle = document.getElementById('cookieAnalyticsToggle');
  let analyticsLoaded = false;
  function readConsent() {
    try { const value=JSON.parse(localStorage.getItem(CONSENT_KEY)||'null'); return value && value.version===1 ? value : null; }
    catch { return null; }
  }
  function loadAnalyticsIfConsented(consent) {
    if (!analyticsId || !consent?.analytics || analyticsLoaded) return;
    analyticsLoaded = true;
    const s=document.createElement('script'); s.async=true; s.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`; document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[]; window.gtag=function(){window.dataLayer.push(arguments)}; window.gtag('js',new Date()); window.gtag('config',analyticsId,{anonymize_ip:true});
  }
  function saveConsent(analytics) {
    const consent={version:1,necessary:true,analytics:Boolean(analytics),updatedAt:new Date().toISOString()};
    try { localStorage.setItem(CONSENT_KEY,JSON.stringify(consent)); } catch { /* consent remains session-only if storage is unavailable */ }
    if (consentBanner) consentBanner.hidden=true;
    if (consentDialog) { consentDialog.hidden=true; document.body.classList.remove('cookie-settings-open'); }
    loadAnalyticsIfConsented(consent);
    return consent;
  }
  function openCookieSettings() {
    if (!consentDialog) return;
    const current=readConsent(); if (analyticsToggle) analyticsToggle.checked=Boolean(current?.analytics);
    consentDialog.hidden=false; document.body.classList.add('cookie-settings-open');
    document.getElementById('cookieSettingsClose')?.focus();
  }
  document.getElementById('cookieAcceptAll')?.addEventListener('click',()=>saveConsent(true));
  document.getElementById('cookieEssentialOnly')?.addEventListener('click',()=>saveConsent(false));
  document.getElementById('cookieCustomize')?.addEventListener('click',openCookieSettings);
  document.getElementById('cookieSettingsClose')?.addEventListener('click',()=>{if(consentDialog)consentDialog.hidden=true;document.body.classList.remove('cookie-settings-open');});
  document.getElementById('cookieSavePreferences')?.addEventListener('click',()=>saveConsent(Boolean(analyticsToggle?.checked)));
  document.querySelectorAll('[data-open-cookie-settings]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();openCookieSettings();}));
  const storedConsent=readConsent();
  if (storedConsent) { if(consentBanner) consentBanner.hidden=true; loadAnalyticsIfConsented(storedConsent); }
  else if(consentBanner) consentBanner.hidden=false;


  // Product catalogue: API-backed with graceful static fallback.
  const productsGrid = document.querySelector('.products-grid');
  const search = document.getElementById('product-search');
  const count = document.getElementById('product-count');
  let activeFilter = 'all';
  let cards = [...document.querySelectorAll('.product-card[data-category]')];
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const productImage = (value, category='basmati') => value || ({sella:'images/sella.webp',organic:'images/organic.webp','non-basmati':'images/parboiled.webp',basmati:'images/Basmati.webp'}[category] || 'images/product-placeholder.svg');
  function renderProductCard(p, index){
    const specs=p.specifications||{};
    const category=escapeHtml(p.category||'rice');
    const name=escapeHtml(p.name);
    return `<div class="product-card reveal" data-category="${category}" data-product-id="${escapeHtml(p._id||'')}" data-product-name="${name}" style="transition-delay:${Math.min(index,6)*.08}s">
      <div class="product-card-img pc-${category}"><img src="${escapeHtml(productImage(p.image,category))}" alt="${name}" class="product-image" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='images/product-placeholder.svg'"></div>
      <div class="product-card-body"><div class="pc-category">${category}</div><div class="pc-name">${name}</div><div class="pc-desc">${escapeHtml(p.description)}</div>
      <div class="pc-specs"><div class="pc-spec"><span class="pc-spec-label">Grain Length</span><span class="pc-spec-value">${escapeHtml(specs.grainLength||'—')}</span></div><div class="pc-spec"><span class="pc-spec-label">Moisture</span><span class="pc-spec-value">${escapeHtml(specs.moisture||'—')}</span></div><div class="pc-spec"><span class="pc-spec-label">Broken</span><span class="pc-spec-value">${escapeHtml(specs.broken||'—')}</span></div></div>
      <button type="button" class="pc-btn">Request Quote <span>→</span></button></div></div>`;
  }
  function refreshCards(){ cards=[...document.querySelectorAll('.product-card[data-category]')]; applyProductFilter(); bindProductCards(); }
  function applyProductFilter(){
    const query=(search?.value||'').trim().toLowerCase(); let visible=0;
    cards.forEach(card=>{const cat=(card.dataset.category||'').toLowerCase(); const matchesCategory=activeFilter==='all'||cat.includes(activeFilter); const matchesSearch=!query||card.textContent.toLowerCase().includes(query); const show=matchesCategory&&matchesSearch; card.classList.toggle('is-hidden',!show); if(show)visible++;});
    if(count)count.textContent=`${visible} ${visible===1?'product':'products'}`;
  }
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter-btn[data-filter]').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-pressed','false')});btn.classList.add('active');btn.setAttribute('aria-pressed','true');activeFilter=btn.dataset.filter;applyProductFilter()}));
  search?.addEventListener('input',applyProductFilter);
  document.querySelectorAll('.filter-btn[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('active')?'true':'false'));

  async function loadPublicProducts(){
    if(!productsGrid) return;
    try{
      const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),7000);
      const response=await fetch(`${API_BASE}/api/v1/products?limit=24&meta=false`,{headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit'});
      clearTimeout(timer);
      if(!response.ok) throw new Error(`Catalogue unavailable (${response.status})`);
      const payload=await response.json(); const items=payload?.data?.items||[];
      if(!items.length) return;
      productsGrid.innerHTML=items.map(renderProductCard).join('');
      refreshCards();
    }catch(error){
      console.warn('Using static catalogue fallback:',error.message);
      refreshCards();
    }
  }

  // Email-based enquiry workflow: no backend email service is required.
  // Submitting opens the visitor's configured email app with a prepared message;
  // the visitor reviews it and presses Send. A website cannot silently send email via mailto.
  const form = document.getElementById('contactFormWrap');
  const submitBtn = form?.querySelector('.form-submit');
  function toast(title, message, type='success'){
    const stack=document.getElementById('toastStack'); if(!stack)return;
    const el=document.createElement('div'); el.className=`toast ${type}`;
    el.innerHTML=`<div class="toast-icon">${type==='error'?'⚠️':'✓'}</div><div class="toast-copy"><strong>${escapeHtml(title)}</strong>${escapeHtml(message)}</div>`;
    stack.appendChild(el); setTimeout(()=>el.remove(),6500);
  }
  const friendlyMessages = {
    firstName: 'Please enter your full name.',
    phone: 'Please enter your phone or WhatsApp number.',
    product: 'Please select a product.',
    quantity: 'Please enter a valid quantity in KG.',
    email: 'Please enter a valid email address.'
  };

  form?.addEventListener('submit', event => {
    event.preventDefault();

    form.querySelectorAll('.field-error').forEach(el => el.remove());

    const invalid = [...form.elements].filter(
      el => el.willValidate && !el.checkValidity()
    );

    invalid.forEach(el => {
      el.setAttribute('aria-invalid', 'true');
      const msg = document.createElement('small');
      msg.className = 'field-error';
      msg.textContent = friendlyMessages[el.name] || el.validationMessage;
      el.insertAdjacentElement('afterend', msg);
    });

    if (invalid.length) {
      invalid[0].focus();
      return;
    }

    form.querySelectorAll('[aria-invalid]').forEach(el => {
      el.removeAttribute('aria-invalid');
    });

    const data = Object.fromEntries(new FormData(form).entries());
    const subject = `Bulk Quote Enquiry — ${data.product}`;
    const body = [
      'MANAVTA AGRO FOODS — BULK QUOTE ENQUIRY',
      '',
      `Full Name: ${data.firstName}`,
      `Phone / WhatsApp: ${data.phone}`,
      `Product Interest: ${data.product}`,
      `Quantity (KG): ${data.quantity}`,
      `Email Address: ${data.email || 'Not provided'}`,
      '',
      `Source: ${data.sourcePage || 'website/contact'}`
    ].join('\n');

    // Save the visitor's draft in this browser in case they close their email app.
    try {
      sessionStorage.setItem('ma_enquiry_draft', JSON.stringify(data));
    } catch {}

    const mailto =
      `mailto:manavtaagrofood@gmail.com?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    toast(
      'Continue in your email app',
      'Review the prepared bulk quote enquiry and press Send. The website cannot confirm email delivery.'
    );

    // Open the visitor's configured email application.
    const link = document.createElement('a');
    link.href = mailto;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();

    if (submitBtn) {
      submitBtn.textContent = 'Open email app again';
      submitBtn.disabled = false;
    }
  });
  try{const draft=JSON.parse(sessionStorage.getItem('ma_enquiry_draft')||'null');if(draft&&form)Object.entries(draft).forEach(([key,value])=>{const field=form.elements.namedItem(key);if(field&&value)field.value=value;});}catch{}

  // Product quick-view modal + intelligent quote prefill.
  const modal=document.getElementById('quoteModal'), modalTitle=document.getElementById('quoteModalTitle'), modalSpecs=document.getElementById('quoteModalSpecs');
  let selectedProduct='';
  function openProductModal(card){
    selectedProduct=card.dataset.productName || card.querySelector('.pc-name')?.textContent.trim() || 'Rice product';
    modalTitle.textContent=selectedProduct;
    const category=card.querySelector('.pc-category')?.textContent.trim()||'';
    const specs=[...card.querySelectorAll('.pc-spec')].map(x=>({label:x.querySelector('.pc-spec-label')?.textContent,value:x.querySelector('.pc-spec-value')?.textContent}));
    modalSpecs.innerHTML=[{label:'Category',value:category},...specs].map(x=>`<div class="quote-mini"><small>${escapeHtml(x.label||'')}</small><strong>${escapeHtml(x.value||'—')}</strong></div>`).join('');
    modal.classList.add('open'); document.body.style.overflow='hidden'; document.getElementById('quoteClose')?.focus();
  }
  function closeProductModal(){modal?.classList.remove('open');document.body.style.overflow='';}
  function prefillQuote(name){
    closeProductModal(); showPage('contact');
    setTimeout(()=>{const select=form?.elements.namedItem('product'); if(select){const opt=[...select.options].find(o=>o.textContent.trim()===name); if(opt)select.value=opt.value;} form?.scrollIntoView({behavior:'smooth',block:'center'});},120);
  }
  function bindProductCards(){
    document.querySelectorAll('.product-card').forEach(card=>{
      if(card.dataset.bound==='1')return; card.dataset.bound='1'; card.addEventListener('click',e=>{if(e.target.closest('button,a'))return;openProductModal(card)}); card.setAttribute('tabindex','0'); card.setAttribute('role','button');
      card.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openProductModal(card)}});
      card.querySelector('.pc-btn')?.addEventListener('click',e=>{e.stopPropagation();prefillQuote(card.dataset.productName||card.querySelector('.pc-name')?.textContent.trim()||'')});
    });
  }
  document.getElementById('quoteClose')?.addEventListener('click',closeProductModal); document.getElementById('modalCloseBtn')?.addEventListener('click',closeProductModal); modal?.addEventListener('click',e=>{if(e.target===modal)closeProductModal()}); document.addEventListener('keydown',e=>{if(e.key==='Escape')closeProductModal()});
  document.getElementById('modalQuoteBtn')?.addEventListener('click',()=>prefillQuote(selectedProduct));
  document.getElementById('modalSampleBtn')?.addEventListener('click',()=>{prefillQuote(selectedProduct);setTimeout(()=>toast('Sample request','Please include your sample request when you contact Manavta Agro Foods. Availability requires confirmation.'),180);});
  refreshCards();
  loadPublicProducts();

  // Navigation + scroll polish.
  const progress=document.getElementById('scrollProgress');
  window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight; if(progress)progress.style.width=`${h>0?(scrollY/h)*100:0}%`},{passive:true});
  // navigator.onLine is only a connectivity hint; keep the notice hidden while online.
  const offlineBar=document.getElementById('offlineBar');
  const syncNetworkNotice=()=>{ if(!offlineBar)return; offlineBar.classList.toggle('show',navigator.onLine===false); };
  window.addEventListener('online',syncNetworkNotice);
  window.addEventListener('offline',syncNetworkNotice);
  syncNetworkNotice();

  // PWA installation.
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;setTimeout(()=>document.getElementById('installCard')?.classList.add('show'),3500)});
  document.getElementById('installBtn')?.addEventListener('click',async()=>{
    if(!deferredPrompt)return;
    deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; document.getElementById('installCard')?.classList.remove('show');
  });
  document.getElementById('dismissInstall')?.addEventListener('click',()=>document.getElementById('installCard')?.classList.remove('show'));
  window.addEventListener('appinstalled',()=>document.getElementById('installCard')?.classList.remove('show'));

  if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}));

  const glow = document.getElementById('cursor-glow');
  if (glow && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
    document.addEventListener('mousemove', e => {
      glow.style.transform = `translate(${e.clientX-210}px,${e.clientY-210}px)`;
    }, {passive:true});
  } else if (glow) glow.remove();


  routeFromHash();
  initReveal();
  initCounters();
})();
