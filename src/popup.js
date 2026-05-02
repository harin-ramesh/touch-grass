const api = (typeof browser !== "undefined") ? browser : chrome;

const DEFAULTS = {
  exemptSites: [
    "localhost",
    "mail.google.com",
  ],
  defaultInterval: 5
};

const sitesEl = document.getElementById("sites");
const intervalEl = document.getElementById("interval");
const saveBtn = document.getElementById("save");
const statusEl = document.getElementById("status");

function load() {
  api.storage.local.get(DEFAULTS, ({ exemptSites, defaultInterval }) => {
    sitesEl.value = exemptSites.join("\n");
    intervalEl.value = defaultInterval;
  });
}

function save() {
  const exemptSites = sitesEl.value
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
  let defaultInterval = parseInt(intervalEl.value, 10);
  if (!defaultInterval || defaultInterval < 1) defaultInterval = 5;
  if (defaultInterval > 240) defaultInterval = 240;

  api.storage.local.set({ exemptSites, defaultInterval }, () => {
    statusEl.textContent = "Saved. Reload the tab to apply.";
    setTimeout(() => (statusEl.textContent = ""), 2500);
  });
}

saveBtn.addEventListener("click", save);
load();
