/* Mongolia River Outfitters — plain JS, no dependencies */
(function () {
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* mobile menu */
  var burger = $('.burger'), menu = $('#menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var o = menu.classList.toggle('open');
      burger.setAttribute('aria-expanded', o);
    });
  }
  /* "More" dropdown */
  var more = $('button.more'), drop = $('#more-drop');
  if (more && drop) {
    var close = function () { drop.classList.remove('open'); more.setAttribute('aria-expanded', 'false'); };
    more.addEventListener('click', function (e) {
      e.stopPropagation();
      var o = drop.classList.toggle('open');
      more.setAttribute('aria-expanded', o);
    });
    document.addEventListener('click', function (e) { if (!drop.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  /* sticky tabs highlight on trip pages */
  var tabs = $$('.tabs a');
  if (tabs.length && 'IntersectionObserver' in window) {
    var map = {};
    tabs.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          tabs.forEach(function (t) { t.classList.remove('on'); });
          var a = map[e.target.id]; if (a) a.classList.add('on');
        }
      });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* testimonials pager (3 at a time) */
  var qs = $$('.quotes .q');
  if (qs.length) {
    var per = 3, page = 0, cnt = $('#q-count'), prev = $('#q-prev'), next = $('#q-next');
    var draw = function () {
      var w = window.innerWidth < 860 ? 1 : per;
      qs.forEach(function (q, i) { q.hidden = !(i >= page * w && i < page * w + w); });
      var a = page * w + 1, b = Math.min(qs.length, page * w + w);
      cnt.textContent = (a === b ? a : a + '–' + b) + ' of ' + qs.length + ' reviews';
      prev.disabled = page === 0; next.disabled = b >= qs.length;
      prev.style.opacity = prev.disabled ? .45 : 1; next.style.opacity = next.disabled ? .45 : 1;
    };
    prev.addEventListener('click', function () { page = Math.max(0, page - 1); draw(); });
    next.addEventListener('click', function () { page++; draw(); });
    window.addEventListener('resize', function () { page = 0; draw(); });
    draw();
  }

  /* filter chips (shop / news / gallery) */
  $$('[data-filter-group]').forEach(function (g) {
    var items = $$('[data-cat]', document.getElementById(g.getAttribute('data-filter-group')));
    $$('.chip', g).forEach(function (c) {
      c.addEventListener('click', function () {
        $$('.chip', g).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        c.setAttribute('aria-pressed', 'true');
        var f = c.getAttribute('data-f');
        items.forEach(function (it) {
          var cats = it.getAttribute('data-cat').split(' ');
          it.hidden = !(f === 'all' || cats.indexOf(f) > -1);
        });
      });
    });
  });

  /* load more (news) — no more posts yet */
  var lm = $('#load-more');
  if (lm) lm.addEventListener('click', function () { lm.textContent = 'That is all for now'; lm.disabled = true; lm.style.opacity = .6; });

  /* team modal */
  $$('.person').forEach(function (p) {
    p.addEventListener('click', function () {
      var d = $('#person-modal');
      $('#pm-role', d).textContent = p.getAttribute('data-role');
      $('#pm-name', d).textContent = p.getAttribute('data-name');
      $('#pm-bio', d).textContent = p.getAttribute('data-bio');
      d.showModal();
    });
  });
  $$('dialog.modal').forEach(function (d) {
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    var x = $('.x', d); if (x) x.addEventListener('click', function () { d.close(); });
  });

  /* gallery lightbox */
  var lb = $('#lightbox');
  if (lb) {
    var btns = $$('.masonry button'), cur = 0;
    var vis = function () { return btns.filter(function (b) { return !b.hidden; }); };
    var show = function (i) {
      var v = vis(); if (!v.length) return;
      cur = (i + v.length) % v.length;
      var b = v[cur];
      $('#lb-img', lb).src = b.getAttribute('data-src');
      $('#lb-img', lb).alt = b.getAttribute('data-alt');
      $('#lb-e', lb).textContent = b.getAttribute('data-e');
      $('#lb-t', lb).textContent = b.getAttribute('data-t');
      $('#lb-d', lb).textContent = b.getAttribute('data-d');
      $('#lb-n', lb).textContent = (cur + 1) + ' / ' + v.length;
    };
    btns.forEach(function (b) { b.addEventListener('click', function () { var v = vis(); show(v.indexOf(b)); lb.showModal(); }); });
    $('#lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
    $('#lb-next', lb).addEventListener('click', function () { show(cur + 1); });
    $('#lb-x', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });
  }

  /* contact: preselect trip from ?trip=slug */
  var tsel = $('#t');
  if (tsel) {
    var q = new URLSearchParams(location.search).get('trip');
    if (q) $$('option', tsel).forEach(function (o) {
      var slug = o.textContent.toLowerCase().replace(/[^a-z]+/g, '-');
      if (slug.indexOf(q) === 0) tsel.value = o.value;
    });
  }

  /* forms: no backend yet — open the visitor's email app with the details filled in */
  $$('form[data-mail]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.checkValidity()) { f.reportValidity(); return; }
      var lines = [];
      $$('input,select,textarea', f).forEach(function (el) {
        if (!el.name || !el.value) return;
        var l = el.getAttribute('data-label') || el.name;
        lines.push(l + ': ' + el.value);
      });
      var subj = f.getAttribute('data-subject') || 'Enquiry';
      location.href = 'mailto:' + f.getAttribute('data-mail') + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(lines.join('\n'));
      var ok = $('.ok', f); if (ok) ok.classList.add('show');
    });
  });
})();

/* Enquire dialog: mailto alone fails when no mail app is set up, so offer Gmail, mail app, WhatsApp and copy */
(function () {
  var MAIL = 'info@mongoliarivers.com';
  var d = document.createElement('dialog');
  d.className = 'modal enq';
  d.innerHTML = '<div class="enq-in"><button class="x" type="button" aria-label="Close">×</button>' +
    '<p class="eyebrow">Enquire</p><h3 class="h3">How would you like to reach us?</h3>' +
    '<p class="small enq-sub">We reply within 48 hours with availability and pricing.</p>' +
    '<div class="enq-btns"><a class="btn btn-red" data-g target="_blank" rel="noopener">Write in Gmail</a>' +
    '<a class="btn btn-line" data-m>Open your mail app</a>' +
    '<a class="btn btn-line" href="https://wa.me/97699069762" target="_blank" rel="noopener">WhatsApp</a></div>' +
    '<p class="enq-copy">Or email <b>' + MAIL + '</b> <button type="button" class="lnk" data-c>Copy</button></p></div>';
  document.body.appendChild(d);
  d.querySelector('.x').onclick = function () { d.close(); };
  d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="mailto:' + MAIL + '"]');
    if (!a || a.closest('dialog.enq')) return;
    e.preventDefault();
    var q = (a.getAttribute('href').split('subject=')[1] || 'Trip%20enquiry');
    d.querySelector('[data-g]').href = 'https://mail.google.com/mail/?view=cm&to=' + MAIL + '&su=' + q;
    d.querySelector('[data-m]').href = 'mailto:' + MAIL + '?subject=' + q;
    d.showModal();
  });
  d.querySelector('[data-c]').onclick = function () {
    var b = this;
    (navigator.clipboard ? navigator.clipboard.writeText(MAIL) : Promise.reject()).then(function () { b.textContent = 'Copied'; }, function () { b.textContent = MAIL; });
  };
})();
