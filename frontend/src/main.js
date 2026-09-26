
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

  window.toggleMenu = function() { mobileMenu.classList.toggle('open'); };
  window.closeMenu = function() { mobileMenu.classList.remove('open'); };

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

  const API_BASE = (document.querySelector('meta[name="api-base"]')?.content || '/api').replace(/\/$/,'');
  const analyticsId = import.meta.env.VITE_GA4_MEASUREMENT_ID || import.meta.env.VITE_GA4_ID;
  const siteUrl = import.meta.env.VITE_SITE_URL;
  if (siteUrl) { const canonical=document.querySelector('[data-canonical]'); if(canonical) canonical.href=siteUrl; }
  if (analyticsId) {
    const s=document.createElement('script'); s.async=true; s.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(analyticsId)}`; document.head.appendChild(s);
    window.dataLayer=window.dataLayer||[]; window.gtag=function(){window.dataLayer.push(arguments)}; window.gtag('js',new Date()); window.gtag('config',analyticsId,{anonymize_ip:true});
  }


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
      const response=await fetch(`${API_BASE}/v1/products?limit=24&meta=false`,{headers:{Accept:'application/json'},signal:controller.signal,credentials:'omit'});
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

  // Production enquiry workflow: validate in the browser, persist through the API, then show a reference.
  const form = document.getElementById('contactFormWrap');
  const submitBtn = form?.querySelector('.form-submit');
  function toast(title, message, type='success'){
    const stack=document.getElementById('toastStack'); if(!stack)return;
    const el=document.createElement('div'); el.className=`toast ${type}`;
    el.innerHTML=`<div class="toast-icon">${type==='error'?'⚠️':'✓'}</div><div class="toast-copy"><strong>${escapeHtml(title)}</strong>${escapeHtml(message)}</div>`;
    stack.appendChild(el); setTimeout(()=>el.remove(),5200);
  }
  function makeId(){return crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`}
  async function submitEnquiry(data){
    const existing=JSON.parse(sessionStorage.getItem('ma_enquiry_draft')||'null');
    const idempotencyKey=existing?.idempotencyKey||makeId();
    sessionStorage.setItem('ma_enquiry_draft',JSON.stringify({...data,idempotencyKey}));
    for(let attempt=0;attempt<4;attempt++){
      const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),12000);
      try{
        const res=await fetch(`${API_BASE}/v1/enquiries`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':idempotencyKey,Accept:'application/json'},body:JSON.stringify(data),signal:controller.signal,credentials:'omit'});
        const payload=await res.json().catch(()=>({}));
        if(res.status===409&&payload?.error?.code==='IDEMPOTENCY_IN_PROGRESS'&&attempt<3){await new Promise(r=>setTimeout(r,Math.max(1000,(payload.error.retryAfter||2)*1000)));continue;}
        if(!res.ok){const e=new Error(payload?.error?.message||`Request failed (${res.status})`);e.code=payload?.error?.code;e.status=res.status;throw e;}
        return payload;
      } finally { clearTimeout(timer); }
    }
    throw new Error('The request is still being processed. Please try again shortly.');
  }
  const friendlyMessages={firstName:'Please enter your name.',email:'Please enter a valid email address.',requirementType:'Please select a request type.',product:'Please select a product.',quantity:'Please enter an estimated quantity.',message:'Please provide additional requirements.'};
  form?.addEventListener('submit', async event=>{
    event.preventDefault();
    form.querySelectorAll('.field-error').forEach(x=>x.remove());
    const invalid=[...form.elements].filter(el=>el.willValidate&&!el.checkValidity());
    invalid.forEach(el=>{el.setAttribute('aria-invalid','true');const msg=document.createElement('small');msg.className='field-error';msg.textContent=friendlyMessages[el.name]||el.validationMessage;el.insertAdjacentElement('afterend',msg)});
    if(invalid.length){invalid[0].focus();return;}
    form.querySelectorAll('[aria-invalid]').forEach(el=>el.removeAttribute('aria-invalid'));
    const raw=Object.fromEntries(new FormData(form).entries());
    const payload={...raw,productName:raw.product}; delete payload.product;
    submitBtn?.classList.add('is-loading'); if(submitBtn){submitBtn.disabled=true;submitBtn.textContent='Sending…';}
    try{
      const result=await submitEnquiry(payload); sessionStorage.removeItem('ma_enquiry_draft'); form.style.display='none';
      const success=document.getElementById('formSuccess'); success.style.display='block';
      success.querySelector('.fs-title').textContent='✓ Enquiry Received';
      success.querySelector('.fs-body').innerHTML=`Thank you. We have received your requirements.<br><strong class="reference-line">Reference ID: ${escapeHtml(result?.data?.referenceId||'ENQ-RECORDED')}</strong><br>We'll review your requirements and contact you during our published working hours.`;
      toast('Request received','Your request is now in the Manavta operations queue.');
    }catch(error){
      const networkFailure=!navigator.onLine||error.name==='AbortError'||error instanceof TypeError;
      sessionStorage.setItem('ma_enquiry_draft',JSON.stringify({...raw,idempotencyKey:JSON.parse(sessionStorage.getItem('ma_enquiry_draft')||'{}')?.idempotencyKey||makeId()}));
      toast(networkFailure?'Cannot reach the enquiry service':'Could not submit',networkFailure?'Your draft remains in this browser. Please reconnect and try again.':(error.message||'Please check the form and try again.'),'error');
      if(submitBtn)submitBtn.textContent='Try again';
    }finally{submitBtn?.classList.remove('is-loading');if(submitBtn&&submitBtn.textContent!=='Try again')submitBtn.disabled=false;}
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
  document.getElementById('modalSampleBtn')?.addEventListener('click',()=>{prefillQuote(selectedProduct);setTimeout(()=>{const select=form?.elements.namedItem('requirementType');if(select)select.value='SAMPLE';},140);});
  refreshCards();
  loadPublicProducts();

  // Navigation + scroll polish.
  const progress=document.getElementById('scrollProgress');
  window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight; if(progress)progress.style.width=`${h>0?(scrollY/h)*100:0}%`},{passive:true});
  window.addEventListener('online',()=>document.getElementById('offlineBar')?.classList.remove('show'));
  window.addEventListener('offline',()=>document.getElementById('offlineBar')?.classList.add('show'));
  if(navigator.onLine===false)document.getElementById('offlineBar')?.classList.add('show');

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
