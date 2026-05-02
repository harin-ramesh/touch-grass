(() => {
  const DEFAULTS = {
    exemptSites: [
      "localhost",
      "mail.google.com"
    ],
    defaultInterval: 5
  };

  const api = (typeof browser !== "undefined") ? browser : chrome;

  function hostMatches(hostname, sites) {
    hostname = hostname.toLowerCase();
    return sites.some(s => {
      s = s.trim().toLowerCase();
      if (!s) return false;
      return hostname === s || hostname.endsWith("." + s);
    });
  }

  function loadSettings() {
    return new Promise(resolve => {
      api.storage.local.get(DEFAULTS, resolve);
    });
  }

  let intervalMs = 5 * 60 * 1000;
  let elapsed = 0;
  let lastTick = Date.now();
  let promptOpen = false;
  let tickHandle = null;

  function startTimer(minutes) {
    intervalMs = minutes * 60 * 1000;
    elapsed = 0;
    lastTick = Date.now();
    if (tickHandle) clearInterval(tickHandle);
    tickHandle = setInterval(tick, 1000);
  }

  function tick() {
    if (promptOpen) {
      lastTick = Date.now();
      return;
    }
    if (document.visibilityState === "visible") {
      const now = Date.now();
      elapsed += now - lastTick;
      lastTick = now;
      if (elapsed >= intervalMs) {
        showPrompt();
      }
    } else {
      lastTick = Date.now();
    }
  }

  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else node.setAttribute(k, v);
    }
    for (const c of children) {
      if (c) node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function showPrompt() {
    if (promptOpen) return;
    promptOpen = true;

    const overlay = el("div", { id: "dscheck-overlay" });
    const modal = el("div", { id: "dscheck-modal" });

    const title = el("h2", { class: "dscheck-title", text: "Time to touch grass?" });
    const sub = el("p", { class: "dscheck-sub", text: "Are you doom scrolling?" });

    const choiceRow = el("div", { class: "dscheck-row" });
    const yesBtn = el("button", { class: "dscheck-btn dscheck-yes", text: "Yes, I am 😬" });
    const noBtn = el("button", { class: "dscheck-btn dscheck-no", text: "No, on purpose" });
    choiceRow.append(yesBtn, noBtn);

    const nextLabel = el("p", { class: "dscheck-sub dscheck-next-label", text: "Check again in:" });

    const presetRow = el("div", { class: "dscheck-presets" });
    const presets = [5, 10, 15, 30, 60];
    const currentMins = Math.round(intervalMs / 60000);
    const matchesPreset = presets.includes(currentMins);
    let selectedMins = currentMins;

    const customInput = el("input", {
      type: "number",
      min: "1",
      max: "240",
      placeholder: "custom",
      class: "dscheck-preset dscheck-custom"
    });
    if (!matchesPreset) {
      customInput.value = String(currentMins);
      customInput.classList.add("dscheck-active");
    }

    const presetBtns = [];
    presets.forEach(m => {
      const b = el("button", {
        class: "dscheck-preset" + (matchesPreset && m === currentMins ? " dscheck-active" : ""),
        text: m === 60 ? "1h" : m + "m"
      });
      b.dataset.mins = m;
      b.addEventListener("click", () => {
        selectedMins = m;
        customInput.value = "";
        customInput.classList.remove("dscheck-active");
        presetBtns.forEach(x => x.classList.toggle("dscheck-active", Number(x.dataset.mins) === m));
      });
      presetRow.appendChild(b);
      presetBtns.push(b);
    });
    presetRow.appendChild(customInput);

    customInput.addEventListener("input", () => {
      if (customInput.value) {
        presetBtns.forEach(x => x.classList.remove("dscheck-active"));
        customInput.classList.add("dscheck-active");
      } else {
        customInput.classList.remove("dscheck-active");
      }
    });

    modal.append(title, sub, choiceRow, nextLabel, presetRow);
    overlay.appendChild(modal);
    document.documentElement.appendChild(overlay);

    function chosenMinutes() {
      const custom = parseInt(customInput.value, 10);
      if (custom && custom >= 1) return Math.min(custom, 240);
      return selectedMins;
    }

    function close() {
      promptOpen = false;
      overlay.remove();
      startTimer(chosenMinutes());
    }

    yesBtn.addEventListener("click", close);
    noBtn.addEventListener("click", close);
    customInput.addEventListener("keydown", e => {
      if (e.key === "Enter") close();
    });
  }

  async function init() {
    const { exemptSites, defaultInterval } = await loadSettings();
    if (hostMatches(location.hostname, exemptSites)) return;
    startTimer(Number(defaultInterval) || 5);

    document.addEventListener("visibilitychange", () => {
      lastTick = Date.now();
    });
  }

  init();
})();
