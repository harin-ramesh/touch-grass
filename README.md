# Touch Grass 🌱

A Firefox extension that gently asks **"Are you doom scrolling?"** while you're on the web, and lets you choose when to be checked on next.

It runs on **every site by default** — you give it a list of sites to leave alone (work tools, dev hosts, anything you want untouched).

---

## Install (temporary, for development)

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Click **Load Temporary Add-on…**
3. Pick `src/manifest.json`.
4. The 🌱 icon appears in your toolbar — click it to configure.

> Temporary add-ons are unloaded when Firefox restarts. For a persistent install, sign the extension via [addons.mozilla.org](https://addons.mozilla.org) or use Firefox Developer Edition / Nightly with `xpinstall.signatures.required` set to `false` in `about:config`.

---

## Configure

Click the toolbar icon to open the popup.

- **Exempt sites** — one hostname per line. Matches the host *and* any subdomain, e.g. `google.com` covers `mail.google.com` and `docs.google.com`.
- **Default interval (minutes)** — how often a fresh page should check on you. Defaults to `5`.

After saving, **reload the tab** for the new settings to take effect on already-open pages.

### Defaults

| Setting | Value |
|---|---|
| Exempt sites | `localhost`, `mail.google.com` |
| Default interval | `5` minutes |

---

