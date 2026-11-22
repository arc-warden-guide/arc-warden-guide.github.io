/* =========================================================
   ARC WARDEN — interactions
   ========================================================= */

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* -------------------------------------------------------
     Tabs
     ------------------------------------------------------- */

  const tabButtons = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  const validTabs = tabButtons.map((tab) => tab.dataset.tab);

  function setTab(name, options = {}) {
    if (!validTabs.includes(name)) return;

    tabButtons.forEach((tab) => {
      const isActive = tab.dataset.tab === name;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.panel === name;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });

    if (options.focus) {
      const activeTab = tabButtons.find((tab) => tab.dataset.tab === name);
      activeTab?.focus({ preventScroll: true });
    }

    if (options.updateHash !== false) {
      history.replaceState(null, "", `#${name}`);
    }

    if (options.scroll !== false) {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    if (name !== "overview") {
      pauseHeroVideo();
    }
  }

  tabButtons.forEach((tab) => {
    tab.addEventListener("click", () => {
      setTab(tab.dataset.tab);
    });

    tab.addEventListener("keydown", (event) => {
      const index = tabButtons.indexOf(tab);
      let nextIndex = null;

      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabButtons.length;
      if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabButtons.length) % tabButtons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = tabButtons.length - 1;

      if (nextIndex !== null) {
        event.preventDefault();
        setTab(tabButtons[nextIndex].dataset.tab, { focus: true });
      }
    });
  });

  document.querySelectorAll("[data-goto]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setTab(link.dataset.goto);
    });
  });

  const initialTab = window.location.hash.replace("#", "");
  if (validTabs.includes(initialTab) && initialTab !== "overview") {
    setTab(initialTab, { scroll: false, updateHash: false });
  }

  window.addEventListener("popstate", () => {
    const name = window.location.hash.replace("#", "");
    if (validTabs.includes(name)) {
      setTab(name, { scroll: false, updateHash: false });
    }
  });

  /* -------------------------------------------------------
     Ability drawer
     ------------------------------------------------------- */

  const abilities = {
    flux: {
      name: "Flux",
      key: "Q · Активная",
      sub: "Кайт и добивание",
      icon: "images/ability_flux.png",
      cast: "casts/flux.mp4",
      desc:
        "Окутывает одинокую вражескую цель вихрем нестабильной энергии: замедляет её и наносит урон со временем. Если рядом с целью находится другой вражеский юнит, урон и замедление временно отключаются.",
      stats: [
        { label: "Кулдаун", value: "16 сек" },
        { label: "Мана", value: "75" },
        { label: "Дальность", value: "625 / 700 / 775 / 850" },
        { label: "Тип", value: "Магия · враг" },
      ],
      extra: [
        {
          type: "scepter",
          title: "Aghanim's Scepter",
          text: "Flux начинает сайленсить одинокую цель, наносит больше урона и длится дольше. Отличный апгрейд против мобильных героев.",
        },
        {
          type: "tip",
          title: "Совет",
          text: "Лови отстающих и не давай врагам группироваться. Если рядом с целью стоят союзники или крипы, сначала убери окружение.",
        },
      ],
    },
    magnetic: {
      name: "Magnetic Field",
      key: "W · Активная",
      sub: "Атакспид и уклонение",
      icon: "images/ability_magnetic.png",
      cast: "casts/magnetic.mp4",
      desc:
        "Создаёт круглое поле магнитной энергии. Союзники внутри получают бонус к скорости атаки и уклоняются от атак, приходящих снаружи поля. Поле также притягивает руны, а руны внутри активируются автоматически.",
      stats: [
        { label: "Кулдаун", value: "20 / 19 / 18 / 17 сек" },
        { label: "Мана", value: "60 / 70 / 80 / 90" },
        { label: "Дальность", value: "900" },
        { label: "Эффект", value: "Бафф союзников" },
      ],
      extra: [
        {
          type: "facet",
          title: "Работа с рунами",
          text: "Magnetic Field притягивает руны, а руны внутри поля активируются автоматически. Это бесплатная страховка от вражеского контроля рун.",
        },
        {
          type: "tip",
          title: "Совет",
          text: "Ставь поле на себя, союзника или строение. Уклонение работает только от атак снаружи — магия и заклинания проходят сквозь него.",
        },
      ],
    },
    spark: {
      name: "Spark Wraith",
      key: "E · Активная",
      sub: "Разведка и магия",
      icon: "images/ability_spark.png",
      cast: "casts/spark.mp4",
      desc:
        "Призывает Spark Wraith, который медленно материализуется и патрулирует указанную зону. Когда враг входит в радиус, дух сливается с ним, наносит магический урон и замедляет. Духа нельзя развеять.",
      stats: [
        { label: "Кулдаун", value: "4 сек" },
        { label: "Мана", value: "80" },
        { label: "Дальность", value: "2000" },
        { label: "Тип", value: "Магия · зона" },
      ],
      extra: [
        {
          type: "tip",
          title: "Совет",
          text: "Ставь духов на руны, в лес и на пути отступления. Дух не развеивается, поэтому заранее перекрывай подходы к важным точкам.",
        },
        {
          type: "tip",
          title: "Контроль зоны",
          text: "Spark Wraith отлично работает вместе с задержками союзников: Disruptor, Faceless Void и другие герои не дают цели выйти из зоны.",
        },
      ],
    },
    tempest: {
      name: "Tempest Double",
      key: "R · Ультимейт",
      sub: "Второе тело",
      icon: "images/ability_tempest.png",
      cast: "casts/tempest.mp4",
      desc:
        "Кратковременно собирает свои частицы в единую форму и создаёт идеальную электрическую копию. Копия использует все текущие предметы и заклинания, кроме расходников и предметов, выпадающих после смерти. У копии отдельные кулдауны. Со временем двойник слабеет: становится медленнее и менее точным.",
      stats: [
        { label: "Кулдаун", value: "60 / 55 / 50 сек" },
        { label: "Мана", value: "0" },
        { label: "Дальность", value: "700" },
        { label: "Тип", value: "Ультимейт · призыв" },
      ],
      extra: [
        {
          type: "shard",
          title: "Aghanim's Shard",
          text: "При создании двойник получает бонусы Arcane, Invisibility и Haste рун. Не срабатывает с Runic Infusion, но сильно повышает мобильность копии.",
        },
        {
          type: "tip",
          title: "Совет",
          text: "Создавай двойника до драки и используй предметы на обоих телах. Копия не может использовать Refresher Orb и сам Tempest Double.",
        },
      ],
    },
    runic: {
      name: "Runic Infusion",
      key: "Innate · Врождённая",
      sub: "Постоянный рост",
      icon: "images/rune.webp",
      cast: null,
      desc:
        "Врождённая способность. Каждая Power Rune, активированная Arc Warden или его Tempest Double, навсегда даёт дополнительные атрибуты. Поэтому контроль рун — важная часть игры за Зета.",
      stats: [
        { label: "Тип", value: "Врождённая" },
        { label: "Эффект", value: "+ атрибуты" },
        { label: "Источник", value: "Power Rune" },
        { label: "Накопление", value: "Постоянно" },
      ],
      extra: [
        {
          type: "tip",
          title: "Совет",
          text: "Забирай руны сам и отправляй за ними двойника. С Aghanim's Shard копия дополнительно получает баффы Arcane, Invisibility и Haste рун.",
        },
        {
          type: "tip",
          title: "Почему это важно",
          text: "Постоянные атрибуты усиливают оба тела. Чем дольше игра, тем больше рун ты успеваешь собрать — это один из скрытых источников силы Arc Warden.",
        },
      ],
    },
  };

  const drawer = document.getElementById("abilityDrawer");
  const backdrop = document.getElementById("drawerBackdrop");
  const drawerClose = document.getElementById("drawerClose");
  const drawerIcon = document.getElementById("drawerIcon");
  const drawerKey = document.getElementById("drawerKey");
  const drawerTitle = document.getElementById("drawerTitle");
  const drawerSub = document.getElementById("drawerSub");
  const drawerDesc = document.getElementById("drawerDesc");
  const drawerStats = document.getElementById("drawerStats");
  const drawerExtra = document.getElementById("drawerExtra");
  const drawerCast = document.getElementById("drawerCast");
  const drawerCastNote = document.getElementById("drawerCastNote");

  let lastFocusedElement = null;

  function buildCastContent(data) {
    if (data.cast) {
      return `
        <video autoplay loop muted playsinline preload="auto">
          <source src="${data.cast}" type="video/mp4">
        </video>
      `;
    }

    if (data.name === "Runic Infusion") {
      return `<img class="cast-rune" src="images/rune.webp" alt="Руна силы">`;
    }

    return `
      <div class="cast-placeholder">
        Кадр каста для <b>${data.name}</b> не добавлен.<br>
        Положи видео в папку <b>casts</b>.
      </div>
    `;
  }

  function openAbility(key) {
    const data = abilities[key];
    if (!data || !drawer) return;

    lastFocusedElement = document.activeElement;

    drawerIcon.src = data.icon;
    drawerIcon.alt = data.name;
    drawerKey.textContent = data.key;
    drawerTitle.textContent = data.name;
    drawerSub.textContent = data.sub;
    drawerDesc.textContent = data.desc;

    drawerStats.innerHTML = data.stats
      .map(
        (stat) => `
          <div class="drawer-stat">
            <span>${stat.label}</span>
            <b>${stat.value}</b>
          </div>
        `
      )
      .join("");

    drawerExtra.innerHTML = (data.extra || [])
      .map(
        (box) => `
          <div class="drawer-extra-box ${box.type === "tip" ? "tip" : ""}">
            <strong>${box.title}</strong>
            <p>${box.text}</p>
          </div>
        `
      )
      .join("");

    drawerCast.innerHTML = buildCastContent(data);
    drawerCastNote.textContent = data.cast ? "Видео каста" : "Иллюстрация способности";

    if (data.cast) {
      const fallback = document.createElement("img");
      fallback.className = "cast-fallback";
      fallback.src = data.icon;
      fallback.alt = "";
      drawerCast.prepend(fallback);
    }

    const video = drawerCast.querySelector("video");
    if (video) {
      video.play().catch(() => {});
      video.addEventListener("error", () => {
        drawerCast.innerHTML = `
          <div class="cast-placeholder">
            Не удалось загрузить видео для <b>${data.name}</b>.<br>
            Проверь файл в папке <b>casts</b>.
          </div>
        `;
      });
    }

    drawer.classList.add("open");
    backdrop.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    backdrop.setAttribute("aria-hidden", "false");
    document.body.classList.add("drawer-open");

    window.setTimeout(() => drawerClose?.focus(), 80);
  }

  function closeAbility() {
    if (!drawer) return;

    drawer.classList.remove("open");
    backdrop.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    backdrop.setAttribute("aria-hidden", "true");
    document.body.classList.remove("drawer-open");

    drawerCast.innerHTML = "";
    drawerCastNote.textContent = "Видео каста";

    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  document.querySelectorAll("[data-ability]").forEach((card) => {
    card.addEventListener("click", () => openAbility(card.dataset.ability));

    card.addEventListener("pointermove", (event) => {
      if (!finePointer) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      card.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
  });

  drawerClose?.addEventListener("click", closeAbility);
  backdrop?.addEventListener("click", closeAbility);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer?.classList.contains("open")) {
      closeAbility();
    }
  });

  // Простой focus trap внутри открытой панели
  drawer?.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;

    const focusable = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  /* -------------------------------------------------------
     Hero video + tilt
     ------------------------------------------------------- */

  const heroVisual = document.getElementById("heroVisual");
  const heroVideo = document.getElementById("heroVideo");
  const holoCard = heroVisual?.querySelector(".holo-card");

  function playHeroVideo() {
    if (!heroVideo) return;
    heroVideo.play().catch(() => {});
  }

  function pauseHeroVideo() {
    if (!heroVideo) return;
    heroVideo.pause();
  }

  if (heroVideo) {
    heroVideo.addEventListener("mouseenter", playHeroVideo);

    if (finePointer) {
      heroVisual?.addEventListener("pointerenter", playHeroVideo);
      heroVisual?.addEventListener("pointerleave", pauseHeroVideo);
    }

    heroVisual?.addEventListener("click", (event) => {
      if (event.target.closest("button, a")) return;
      if (heroVideo.paused) {
        playHeroVideo();
      } else {
        pauseHeroVideo();
      }
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseHeroVideo();
    });
  }

  if (holoCard && heroVisual && finePointer && !prefersReducedMotion) {
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      holoCard.style.setProperty("--rx", `${(-y * 7).toFixed(2)}deg`);
      holoCard.style.setProperty("--ry", `${(x * 9).toFixed(2)}deg`);
    });

    heroVisual.addEventListener("pointerleave", () => {
      holoCard.style.setProperty("--rx", "0deg");
      holoCard.style.setProperty("--ry", "0deg");
    });
  }

  /* -------------------------------------------------------
     Particles
     ------------------------------------------------------- */

  const canvas = document.getElementById("particles");

  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles = [];
    let frameId = null;

    const colors = [
      "rgba(95, 243, 255,",
      "rgba(139, 92, 246,",
      "rgba(209, 139, 255,",
    ];

    function resizeCanvas() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(24, Math.min(70, Math.round((width * height) / 26000)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        r: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.45 + 0.12,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    function drawParticles() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        ctx.beginPath();
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const distance = Math.hypot(dx, dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(95, 243, 255, ${0.055 * (1 - distance / 120)})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }

      frameId = requestAnimationFrame(drawParticles);
    }

    function startParticles() {
      if (frameId !== null) return;
      drawParticles();
    }

    function stopParticles() {
      if (frameId === null) return;
      cancelAnimationFrame(frameId);
      frameId = null;
    }

    resizeCanvas();
    startParticles();

    let resizeTimer = null;
    window.addEventListener("resize", () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resizeCanvas, 150);
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopParticles();
      } else {
        startParticles();
      }
    });
  } else if (canvas) {
    canvas.style.display = "none";
  }

  /* -------------------------------------------------------
     FAQ: keep only one answer open at a time
     ------------------------------------------------------- */

  const faqItems = Array.from(document.querySelectorAll(".faq-item"));
  faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      faqItems.forEach((other) => {
        if (other !== item) other.open = false;
      });
    });
  });
})();
