from pathlib import Path

path = Path("index.html")
content = path.read_text(encoding="utf-8")

css_anchor = """      animation: coreFloat 5s ease-in-out infinite;
    }

    .heart-core span {"""

css_insert = """      animation: coreFloat 5s ease-in-out infinite;
      appearance: none;
      padding: 0;
      cursor: pointer;
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: filter .2s ease, box-shadow .2s ease;
    }

    .heart-core:hover {
      filter: brightness(1.08) saturate(1.12);
      box-shadow: 0 38px 90px rgba(0,0,0,.34),0 0 100px rgba(255,79,154,.24),inset 0 1px 0 rgba(255,255,255,.24);
    }

    .heart-core:focus-visible {
      outline: 3px solid rgba(255,255,255,.92);
      outline-offset: 7px;
    }

    .heart-core.is-popping {
      filter: brightness(1.2) saturate(1.24);
    }

    .heart-burst-layer {
      position: fixed;
      inset: 0;
      z-index: 40;
      overflow: hidden;
      pointer-events: none;
    }

    .burst-heart {
      position: fixed;
      left: 0;
      top: 0;
      display: block;
      line-height: 1;
      font-size: var(--size);
      opacity: 0;
      transform-origin: center;
      filter: drop-shadow(0 8px 14px rgba(255,42,120,.24));
      will-change: transform, opacity;
      animation: heartBurst var(--duration) cubic-bezier(.18,.78,.2,1) var(--delay) forwards;
    }

    .heart-core span {"""

keyframe_anchor = """    @keyframes orbit { from { transform: rotate(0deg) translateX(152px) rotate(0deg); } to { transform: rotate(360deg) translateX(152px) rotate(-360deg); } }

    @media (max-width: 760px) {"""

keyframe_insert = """    @keyframes orbit { from { transform: rotate(0deg) translateX(152px) rotate(0deg); } to { transform: rotate(360deg) translateX(152px) rotate(-360deg); } }
    @keyframes heartBurst {
      0% {
        opacity: 0;
        transform: translate(-50%,-50%) scale(.3) rotate(0deg);
      }
      12% {
        opacity: 1;
      }
      70% {
        opacity: .95;
      }
      100% {
        opacity: 0;
        transform: translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(var(--scale)) rotate(var(--rot));
      }
    }

    @media (max-width: 760px) {"""

body_anchor = """  <div class="orb orb-b" aria-hidden="true"></div>

  <div class="shell">"""

body_insert = """  <div class="orb orb-b" aria-hidden="true"></div>
  <div class="heart-burst-layer" id="heartBurstLayer" aria-hidden="true"></div>

  <div class="shell">"""

js_anchor = """      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (!reduceMotion) {"""

js_insert = """      const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const heartCore = document.getElementById('heartCore');
      const burstLayer = document.getElementById('heartBurstLayer');

      function burstHearts() {
        const rect = heartCore.getBoundingClientRect();
        const originX = rect.left + rect.width / 2;
        const originY = rect.top + rect.height / 2;
        const emojis = ['❤️','💗','💖','💕'];
        const count = reduceMotion ? 8 : (innerWidth < 520 ? 28 : 42);
        const fragment = document.createDocumentFragment();

        heartCore.classList.remove('is-popping');
        void heartCore.offsetWidth;
        heartCore.classList.add('is-popping');
        setTimeout(() => heartCore.classList.remove('is-popping'), 380);

        for (let i = 0; i < count; i++) {
          const heart = document.createElement('span');
          const angle = Math.random() * Math.PI * 2;
          const distance = (innerWidth < 520 ? 90 : 125) + Math.random() * (innerWidth < 520 ? 125 : 210);
          const lift = Math.random() * 85;
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance - lift;

          heart.className = 'burst-heart';
          heart.textContent = emojis[Math.floor(Math.random() * emojis.length)];
          heart.style.left = originX + 'px';
          heart.style.top = originY + 'px';
          heart.style.setProperty('--tx', tx.toFixed(1) + 'px');
          heart.style.setProperty('--ty', ty.toFixed(1) + 'px');
          heart.style.setProperty('--rot', ((Math.random() * 180) - 90).toFixed(1) + 'deg');
          heart.style.setProperty('--size', (14 + Math.random() * 24).toFixed(1) + 'px');
          heart.style.setProperty('--scale', (.72 + Math.random() * .8).toFixed(2));
          heart.style.setProperty('--duration', (reduceMotion ? 180 : 850 + Math.random() * 650).toFixed(0) + 'ms');
          heart.style.setProperty('--delay', (reduceMotion ? 0 : Math.random() * 110).toFixed(0) + 'ms');
          heart.addEventListener('animationend', () => heart.remove(), { once: true });
          fragment.appendChild(heart);
        }

        burstLayer.appendChild(fragment);

        const overflow = burstLayer.childElementCount - 160;
        if (overflow > 0) {
          Array.from(burstLayer.children).slice(0, overflow).forEach((heart) => heart.remove());
        }
      }

      heartCore.addEventListener('click', burstHearts);

      if (!reduceMotion) {"""

replacements = [
    (css_anchor, css_insert, "CSS блока сердца"),
    (keyframe_anchor, keyframe_insert, "анимации heartBurst"),
    (body_anchor, body_insert, "слоя сердечек"),
    ('          <div class="visual" aria-hidden="true">', '          <div class="visual">', "visual"),
    ('            <div class="heart-core"><span>❤️</span></div>',
     '            <button class="heart-core" id="heartCore" type="button" aria-label="Запустить эффект множества сердец" title="Нажми на сердце"><span aria-hidden="true">❤️</span></button>',
     "кнопки-сердца"),
    (js_anchor, js_insert, "JavaScript эффекта"),
]

for old, new, label in replacements:
    if old not in content:
        raise SystemExit(f"Не найден ожидаемый фрагмент для: {label}. Файл, вероятно, уже изменён.")
    content = content.replace(old, new, 1)

path.write_text(content, encoding="utf-8")
print("Готово: index.html обновлён. Клик по центральному сердцу запускает эффект множества сердец.")
