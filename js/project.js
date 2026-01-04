// tilt.js (vanilla)
(function(){
  const cards = document.querySelectorAll('.card');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function bind(card){
    const surface = card.querySelector('.card__surface');
    let frame = null;
    let tx = 0, ty = 0; // target rotations
    const max = 12; // degrees

    function update(){
      surface.style.transform = `rotateX(${tx}deg) rotateY(${ty}deg) translateZ(8px)`;
      surface.style.boxShadow = `0 ${Math.abs(tx)+6}px ${18 + Math.abs(ty)}px rgba(16,24,40,0.12)`;
      frame = null;
    }

    function schedule(){
      if(frame) return;
      frame = requestAnimationFrame(update);
    }

    function onMove(e){
      if(reduce) return;
      const r = card.getBoundingClientRect();
      const cx = r.left + r.width/2;
      const cy = r.top + r.height/2;
      const px = (e.clientX - cx) / (r.width/2); // -1 .. 1
      const py = (e.clientY - cy) / (r.height/2); // -1 .. 1
      // invert X rotation (pointer up -> rotateX positive)
      tx = Math.max(-max, Math.min(max, -py * max));
      ty = Math.max(-max, Math.min(max, px * max));
      schedule();
    }

    function reset(){
      tx = 0; ty = 0;
      if(frame) cancelAnimationFrame(frame);
      surface.style.transform = '';
      surface.style.boxShadow = '';
      frame = null;
    }

    // Pointer events
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', reset);

    // Keyboard: tilt slightly on focus; reset on blur
    card.addEventListener('focus', () => {
      if(reduce) return;
      tx = -6; ty = 0;
      schedule();
    }, true);
    card.addEventListener('blur', reset, true);
  }

  cards.forEach(bind);
})();

// faqs
   // JS: animate to/from scrollHeight and toggle aria + hidden
document.querySelectorAll('.faq-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const expanded = btn.getAttribute('aria-expanded') === 'true';

    if (!expanded) {
      // opening
      panel.hidden = false;
      const height = panel.scrollHeight;
      panel.style.height = '0px';
      // trigger a frame so transition runs
      requestAnimationFrame(() => panel.style.height = height + 'px');
      panel.style.opacity = '1';
      btn.setAttribute('aria-expanded', 'true');

      // remove explicit height after transition to allow dynamic content
      panel.addEventListener('transitionend', function te(e) {
        if (e.propertyName === 'height') {
          panel.style.height = 'auto';
          panel.removeEventListener('transitionend', te);
        }
      });
    } else {
      // closing
      const height = panel.scrollHeight;
      panel.style.height = height + 'px';
      // next frame -> collapse
      requestAnimationFrame(() => {
        panel.style.height = '0px';
        panel.style.opacity = '0';
      });
      btn.setAttribute('aria-expanded', 'false');
      panel.addEventListener('transitionend', function te(e) {
        if (e.propertyName === 'height') {
          panel.hidden = true;
          panel.removeEventListener('transitionend', te);
          panel.style.height = '';
        }
      });
    }
  });
});

// hidden desc
  // main.js
const grid = document.getElementById('grid');
const templates = document.querySelectorAll('template[id^="tpl-"]');

function openModalFromSlug(slug, push = true) {
  const tpl = document.getElementById(`tpl-${slug}`);
  if (!tpl) return;
  // create backdrop + clone detail
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'presentation');

  const fragment = tpl.content.cloneNode(true);
  const detail = fragment.querySelector('.project-detail');
  backdrop.appendChild(detail);
  document.body.appendChild(backdrop);

  // mark open to trigger CSS
  requestAnimationFrame(() => backdrop.setAttribute('open', ''));

  // accessibility: focus first focusable, trap focus
  const focusable = detail.querySelectorAll('a,button,[tabindex]:not([tabindex="-1"])');
  const first = focusable[0] || detail;
  first.focus();

  function close() {
    backdrop.remove();
    if (push) history.pushState({}, '', '/');
  }

  detail.querySelector('.close').addEventListener('click', close);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  window.addEventListener('keydown', function esc(e) { if (e.key === 'Escape') { close(); window.removeEventListener('keydown', esc); }});

  // simple focus trap
  detail.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const nodes = Array.from(focusable);
    const idx = nodes.indexOf(document.activeElement);
    if (e.shiftKey && idx === 0) { e.preventDefault(); nodes[nodes.length - 1].focus(); }
    else if (!e.shiftKey && idx === nodes.length - 1) { e.preventDefault(); nodes[0].focus(); }
  });

  if (push) history.pushState({modal: slug}, '', `#${slug}`);
}

grid.addEventListener('click', (e) => {
  const card = e.target.closest('.project-card');
  if (!card) return;
  const slug = card.dataset.slug;
  openModalFromSlug(slug);
});

// deep-link on load
if (location.hash) {
  const slug = location.hash.replace('#','');
  openModalFromSlug(slug, false);
}

// close on back/forward
window.addEventListener('popstate', () => {
  const openBackdrop = document.querySelector('.modal-backdrop');
  if (openBackdrop && !location.hash) openBackdrop.remove();
});

