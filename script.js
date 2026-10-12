/* Panelium. Ванильный JS: плиты и пакет слоёв, меню, якоря, язык, лента, форма. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, W = window;
  root.classList.add("js");
  var ASSET_V = ((doc.currentScript && doc.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";
  var REDUCED = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var easeOut = function (x) { return 1 - Math.pow(1 - x, 3); };
  var smooth = function (x) { x = clamp(x); return x * x * (3 - 2 * x); };
  var LANG = "ru";
  /* телефон: меньше слоёв, высота окна не прыгает от адресной строки */
  var MOBILE = W.matchMedia("(max-width:760px)").matches;
  var TOUCH = W.matchMedia("(pointer:coarse)").matches;
  var VW = W.innerWidth, VH = W.innerHeight;

  /* ---------- WhatsApp: текст собирается в момент клика (фаза захвата на window, совместимо с LeadBot) ---------- */
  var WA_NUM = "77781111023";
  var WA = {
    ru: {
      "default": "Здравствуйте! Пишу с сайта Panelium. Интересуют HPL панели.",
      hero: "Здравствуйте! Пишу с сайта Panelium. Интересуют HPL панели: ",
      fasad: "Здравствуйте! Нужны HPL панели для фасада. Площадь и объект: ",
      stol: "Здравствуйте! Нужна HPL столешница. Размеры и декор: ",
      pereg: "Здравствуйте! Нужен HPL для перегородок. Объект и размеры: ",
      steny: "Здравствуйте! Интересуют HPL панели для интерьера. Помещение и площадь: ",
      fartuk: "Здравствуйте! Интересует кухонный фартук из HPL. Размеры: ",
      mebel: "Здравствуйте! Интересует уличная мебель из HPL. Что нужно: ",
      dekor: "Здравствуйте! Хочу подобрать декор HPL. Для чего и какой цвет: ",
      kontakty: "Здравствуйте! Пишу с сайта Panelium. Хочу рассчитать: ",
      sticky: "Здравствуйте! Пишу с сайта Panelium. Интересуют HPL панели: "
    }
  };
  var FORM_LABELS = { ru: { head: "Заявка с сайта Panelium", name: "Имя", phone: "Телефон", msg: "Что нужно" } };
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var dict = WA[LANG] || WA.ru;
    var text = dict[key] || WA.ru[key] || WA.ru["default"];
    a.setAttribute("href", "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(text));
  }, true);

  /* ---------- fitText для ключевого слова героя ---------- */
  var h1 = doc.getElementById("h1");
  function fitText() {
    if (!h1) return;
    var l1 = h1.querySelector(".l1");
    var avail = h1.clientWidth;
    if (!avail || !l1) return;
    h1.style.removeProperty("--fs");
    var fs = parseFloat(getComputedStyle(l1).fontSize);
    var guard = 0;
    while (guard++ < 30 && l1.scrollWidth > avail + 1 && fs > 22) {
      fs *= 0.95; h1.style.setProperty("--fs", fs + "px");
    }
  }

  /* ---------- Меню ---------- */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  var behind = [doc.getElementById("main"), doc.querySelector(".foot"), doc.getElementById("sticky")];
  function setMenu(open, returnFocus) {
    if (!menu || !burger) return;
    var was = doc.body.classList.contains("menu-open");
    if (open === was) return;
    doc.body.classList.toggle("menu-open", open);
    behind.forEach(function (el) { if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add("open"); });
      setTimeout(function () { var first = menu.querySelector("a"); if (first) first.focus({ preventScroll: true }); }, 60);
    } else {
      menu.classList.remove("open");
      setTimeout(function () { if (!doc.body.classList.contains("menu-open")) menu.hidden = true; }, 320);
      if (returnFocus) burger.focus({ preventScroll: true });
    }
  }
  if (burger) burger.addEventListener("click", function () { var o = doc.body.classList.contains("menu-open"); setMenu(!o, o); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) setMenu(false, true); });

  /* ---------- Якоря ---------- */
  var HDR = function () { return parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 70; };
  function targetTop(el) {
    var r = el.getBoundingClientRect().top + W.pageYOffset;
    if (el.classList.contains("pw") || el.classList.contains("anchor")) return r;
    if (el.classList.contains("sec")) return r - HDR();
    return r - HDR() - 14;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    setMenu(false);
    var top = Math.max(0, targetTop(el));
    if (instant || REDUCED) { root.style.scrollBehavior = "auto"; W.scrollTo(0, top); root.style.scrollBehavior = ""; }
    else W.scrollTo({ top: top, behavior: "smooth" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (goTo(id)) {
      e.preventDefault();
      try { history.pushState(null, "", "#" + id); } catch (err) {}
      var t = doc.getElementById(id);
      if (t && t.classList.contains("anchor")) t = t.parentNode;
      if (t) { if (!t.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) t.setAttribute("tabindex", "-1"); try { t.focus({ preventScroll: true }); } catch (err2) {} }
    }
  });

  /* ---------- Пакет слоёв: кадр делится на горизонтальные слои, пресс сжимает их в лист ---------- */
  function layerize(ph) {
    var n = parseInt(ph.getAttribute("data-layers"), 10) || 7;
    if (MOBILE) n = Math.min(n, 5);
    var pic = ph.querySelector("picture");
    if (!pic || REDUCED) return;
    var isHero = !!ph.closest(".pl-hero");
    ph.style.setProperty("--n", n);
    for (var i = 0; i < n; i++) {
      var ly = doc.createElement("div");
      ly.className = "ly";
      ly.style.setProperty("--i", i);
      var c = pic.cloneNode(true);
      var img = c.querySelector("img");
      if (img) {
        if (i > 0) img.removeAttribute("fetchpriority");
        if (isHero) img.removeAttribute("loading");
      }
      ly.appendChild(c);
      ph.appendChild(ly);
    }
    ph.classList.add("layered");
  }
  [].forEach.call(doc.querySelectorAll(".ph[data-layers]"), layerize);

  /* ---------- Плиты ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var sticky = doc.getElementById("sticky"), kont = doc.getElementById("kontakty");
  var hdr = doc.getElementById("hdr");
  var cue = doc.getElementById("cue");
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0, ticking = false;

  /* чтение размеров пакетом, потом запись; open и g догоняют цель плавно (lerp), поэтому скролл пальцем не дёргает слои */
  var st = pws.map(function () { return { open: -1, g: -1, out: {} }; });
  var lastTs = 0;
  function put(pw, s, k, v) { if (s.out[k] !== v) { s.out[k] = v; pw.style.setProperty(k, v); } }
  function update(ts) {
    ticking = false;
    var now = typeof ts === "number" ? ts : performance.now();
    var dt = lastTs ? Math.min(64, now - lastTs) : 16.7; lastTs = now;
    var k = 1 - Math.pow(1 - 0.2, dt / 16.7);
    var H = VH;
    var pageY = W.pageYOffset;
    var kontTop = kont ? kont.getBoundingClientRect().top : null;
    var rects = [], nxtTops = [], i;
    for (i = 0; i < pws.length; i++) {
      rects.push(pws[i].getBoundingClientRect());
      var nx = pws[i].nextElementSibling;
      nxtTops.push(nx ? nx.getBoundingClientRect().top : null);
    }
    var moving = false;
    for (i = 0; i < pws.length; i++) {
      var pw = pws[i], r = rects[i], s = st[i];
      var enter = clamp(1 - r.top / H);
      var stay = r.height > H ? clamp(-r.top / (r.height - H)) : 0;
      var exit = nxtTops[i] !== null ? clamp(1 - nxtTops[i] / H) : 0;
      var isHero = pw.classList.contains("pw-hero");
      var open, g;
      if (isHero) {
        open = REDUCED ? 1 : easeOut(INTRO);
        var stayX = clamp((stay - 0.5) / 0.5);
        g = (1 - open) * 0.09 * H + stayX * stayX * 0.12 * H;
      } else {
        open = REDUCED ? 1 : smooth((enter - 0.3) / 0.55);
        g = (1 - open) * 0.1 * H;
      }
      var near = r.bottom > -H * 0.5 && r.top < H * 1.5;
      if (s.open < 0 || REDUCED || !near) { s.open = open; s.g = g; }
      else {
        if (!isHero) s.open += (open - s.open) * k; else s.open = open;
        s.g += (g - s.g) * k;
        if (Math.abs(open - s.open) > 0.002 || Math.abs(g - s.g) > 0.3) moving = true;
        else { s.open = open; s.g = g; }
      }
      pw.classList.toggle("near", near);
      put(pw, s, "--enter", enter.toFixed(4));
      put(pw, s, "--stay", stay.toFixed(4));
      put(pw, s, "--exit", exit.toFixed(4));
      put(pw, s, "--open", s.open.toFixed(4));
      put(pw, s, "--g", s.g.toFixed(1));
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1);
      if (!s.txts) s.txts = pw.querySelectorAll(".txt");
      var on = isHero ? INTRO > 0.25 : enter > 0.68;
      if (s.on !== on) { s.on = on; for (var t = 0; t < s.txts.length; t++) s.txts[t].classList.toggle("on", on); }
    }
    if (sticky) {
      var show = pageY > H * 0.55;
      if (kontTop !== null && kontTop < H * 0.5) show = false;
      sticky.classList.toggle("show", show);
    }
    if (hdr) hdr.classList.toggle("scrolled", pageY > 12);
    if (cue) cue.classList.toggle("off", pageY > H * 0.15);
    if (moving) onScroll();
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () {
    /* на телефоне смена только высоты - это адресная строка: раскладку не пересчитываем */
    if (W.innerWidth !== VW) { VW = W.innerWidth; VH = W.innerHeight; fitText(); updateRails(); }
    else if (!TOUCH) VH = W.innerHeight;
    onScroll();
  });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart) / 1300);
    update(ts);
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Ленты со стрелками ---------- */
  var rails = [].slice.call(doc.querySelectorAll(".rail"));
  function railStep(rail) {
    var card = rail.firstElementChild; if (!card) return 300;
    var cs = getComputedStyle(rail);
    var gap = parseFloat(cs.columnGap || cs.gap) || 16;
    return card.getBoundingClientRect().width + gap;
  }
  function updateRail(rail) {
    var btns = doc.querySelectorAll('.arr[data-for="' + rail.id + '"]');
    var max = rail.scrollWidth - rail.clientWidth;
    var none = max <= 1;
    [].forEach.call(btns, function (b) {
      b.hidden = none;
      var dir = +b.getAttribute("data-dir");
      b.disabled = dir < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= max - 2;
    });
  }
  function updateRails() { rails.forEach(updateRail); }
  rails.forEach(function (rail) {
    rail.addEventListener("scroll", function () { updateRail(rail); }, { passive: true });
    rail.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); rail.scrollBy({ left: railStep(rail), behavior: REDUCED ? "auto" : "smooth" }); }
      if (e.key === "ArrowLeft") { e.preventDefault(); rail.scrollBy({ left: -railStep(rail), behavior: REDUCED ? "auto" : "smooth" }); }
    });
  });
  [].forEach.call(doc.querySelectorAll(".arr[data-for]"), function (b) {
    b.addEventListener("click", function () {
      var rail = doc.getElementById(b.getAttribute("data-for")); if (!rail) return;
      rail.scrollBy({ left: railStep(rail) * (+b.getAttribute("data-dir")), behavior: REDUCED ? "auto" : "smooth" });
    });
  });

  /* ---------- Язык: RU в разметке, KZ подгружается отдельным файлом ---------- */
  var I18N = { ru: {} };
  var RU = I18N.ru;
  var iEls = [].slice.call(doc.querySelectorAll("[data-i]"));
  var phEls = [].slice.call(doc.querySelectorAll("[data-i-ph]"));
  var ariaEls = [].slice.call(doc.querySelectorAll("[data-i-aria]"));
  var altEls = [].slice.call(doc.querySelectorAll("[data-i-alt]"));
  var metaDesc = doc.querySelector('meta[name="description"]');
  iEls.forEach(function (el) { RU[el.getAttribute("data-i")] = el.textContent; });
  phEls.forEach(function (el) { RU[el.getAttribute("data-i-ph")] = el.getAttribute("placeholder"); });
  ariaEls.forEach(function (el) { RU[el.getAttribute("data-i-aria")] = el.getAttribute("aria-label"); });
  altEls.forEach(function (el) { RU[el.getAttribute("data-i-alt")] = el.getAttribute("alt"); });
  RU["meta.title"] = doc.title;
  RU["meta.desc"] = metaDesc ? metaDesc.getAttribute("content") : "";
  function t(key) { var d = I18N[LANG] || RU; return d[key] != null ? d[key] : RU[key]; }
  function applyLang(lang) {
    if (!I18N[lang]) lang = "ru";
    LANG = lang;
    iEls.forEach(function (el) { var v = t(el.getAttribute("data-i")); if (v != null) el.textContent = v; });
    phEls.forEach(function (el) { var v = t(el.getAttribute("data-i-ph")); if (v != null) el.setAttribute("placeholder", v); });
    ariaEls.forEach(function (el) { var v = t(el.getAttribute("data-i-aria")); if (v != null) el.setAttribute("aria-label", v); });
    altEls.forEach(function (el) { var v = t(el.getAttribute("data-i-alt")); if (v != null) el.setAttribute("alt", v); });
    doc.title = t("meta.title");
    if (metaDesc) metaDesc.setAttribute("content", t("meta.desc"));
    root.setAttribute("lang", lang);
    [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("panelium-lang", lang); } catch (e) {}
    fitText();
    updateRails();
  }
  function loadLang(lang, done) {
    if (I18N[lang] || lang !== "kk") return done();
    var s = doc.createElement("script");
    s.src = "assets/lang/kk.js" + (ASSET_V ? "?v=" + ASSET_V : "");
    s.onload = function () {
      if (W.SITE_KK) {
        I18N.kk = W.SITE_KK;
        if (W.SITE_KK_WA) WA.kk = W.SITE_KK_WA;
        if (W.SITE_KK_FORM) FORM_LABELS.kk = W.SITE_KK_FORM;
      }
      done();
    };
    s.onerror = function () { done(); };
    doc.head.appendChild(s);
  }
  function setLang(lang) { loadLang(lang, function () { applyLang(lang); }); }
  [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  (function initLang() {
    var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
    var saved = null; try { saved = localStorage.getItem("panelium-lang"); } catch (e) {}
    var lang = forced || saved || "ru";
    if (lang !== "ru") setLang(lang);
  })();

  /* ---------- Проявление секций ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) el.classList.add("in"); }); }, 1500);
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Форма -> WhatsApp ---------- */
  var form = doc.getElementById("form"), thanks = doc.getElementById("thanks"), ferr = doc.getElementById("ferr");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website && f.website.value) { form.hidden = true; if (thanks) thanks.hidden = false; return; }
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      var badName = !name, badPhone = phone.replace(/\D/g, "").length < 10;
      f.name.classList.toggle("bad", badName); f.phone.classList.toggle("bad", badPhone);
      f.name.setAttribute("aria-invalid", badName ? "true" : "false"); f.phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badName || badPhone) { if (ferr) ferr.hidden = false; (badName ? f.name : f.phone).focus(); return; }
      if (ferr) ferr.hidden = true;
      var L = FORM_LABELS[LANG] || FORM_LABELS.ru;
      var lines = [L.head, L.name + ": " + name, L.phone + ": " + phone];
      if (f.message.value.trim()) lines.push(L.msg + ": " + f.message.value.trim());
      var url = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(lines.join("\n"));
      W.open(url, "_blank", "noopener");
      if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
      form.reset();
    });
  }

  /* ---------- Декоры: вкладки, «показать все», переход из плит на нужную вкладку ---------- */
  var dkSec = doc.getElementById("dekory");
  if (dkSec) {
    var dkTabs = [].slice.call(dkSec.querySelectorAll("[data-dk]"));
    var dkMore = dkSec.querySelector(".dk-more");
    var dkOpen = false;
    RU["dk.less"] = "Свернуть";
    var setDk = function (key, focus) {
      dkTabs.forEach(function (b) {
        var on = b.getAttribute("data-dk") === key;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-selected", on ? "true" : "false");
        b.tabIndex = on ? 0 : -1;
        var pn = doc.getElementById(b.getAttribute("aria-controls"));
        if (pn) pn.hidden = !on;
        if (on && focus) b.focus();
      });
    };
    dkTabs.forEach(function (b, i) {
      b.addEventListener("click", function () { setDk(b.getAttribute("data-dk")); });
      b.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        var n = dkTabs[(i + (e.key === "ArrowRight" ? 1 : dkTabs.length - 1)) % dkTabs.length];
        setDk(n.getAttribute("data-dk"), true);
      });
    });
    if (dkMore) dkMore.addEventListener("click", function () {
      dkOpen = !dkOpen;
      [].forEach.call(dkSec.querySelectorAll(".dk-panel"), function (pn) { pn.classList.toggle("open", dkOpen); });
      dkMore.setAttribute("aria-expanded", dkOpen ? "true" : "false");
      var sp = dkMore.querySelector("span"); var k = dkOpen ? "dk.less" : "dk.more";
      sp.setAttribute("data-i", k); sp.textContent = (I18N[LANG] && I18N[LANG][k]) || RU[k] || sp.textContent;
      if (!dkOpen) goTo("dekory");
    });
    doc.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[data-tab]") : null;
      if (a) setDk(a.getAttribute("data-tab"));
    }, true);
  }

  var year = doc.getElementById("year"); if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Старт ---------- */
  function start() {
    fitText();
    if (location.hash.length > 1) {
      var id = location.hash.slice(1);
      goTo(id, true);
      setTimeout(function () { goTo(id, true); update(); }, 60);
      setTimeout(function () { goTo(id, true); update(); }, 500);
    }
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
    updateRails();
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitText(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  update();
})();
