// Veselka home: small progressive enhancements. Everything works and is visible without this script.
const wide = window.matchMedia("(min-width: 60rem)");

// 1. Routes: the hovered, focused or tapped route lights its arc in the schema.
const routesBody = document.querySelector<HTMLElement>("[data-routes]");
if (routesBody) {
  const set = (key: string | null) => {
    if (key) routesBody.dataset.active = key;
    else delete routesBody.dataset.active;
  };
  routesBody.querySelectorAll<HTMLElement>("[data-route]").forEach((row) => {
    const key = row.dataset.route ?? null;
    row.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") set(key); });
    row.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") set(null); });
    row.addEventListener("focusin", () => set(key));
    row.addEventListener("focusout", (e) => { if (!row.contains(e.relatedTarget as Node)) set(null); });
    let touch = false;
    row.addEventListener("pointerdown", (e) => { touch = e.pointerType !== "mouse"; });
    row.addEventListener("click", () => { if (touch) set(routesBody.dataset.active === key ? null : key); });
  });
}

// 2. Tabs «Дітям / Дорослим» (WAI-ARIA tabs, arrows move between tabs).
document.querySelectorAll<HTMLElement>("[data-tabs]").forEach((root) => {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const show = (tab: HTMLButtonElement, focus = false) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute("aria-controls") ?? "");
      if (panel) panel.hidden = !on;
    });
    if (focus) tab.focus();
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => show(tab));
    tab.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (step) { e.preventDefault(); show(tabs[(i + step + tabs.length) % tabs.length], true); }
      if (e.key === "Home") { e.preventDefault(); show(tabs[0], true); }
      if (e.key === "End") { e.preventDefault(); show(tabs[tabs.length - 1], true); }
    });
  });
  const first = tabs.find((t) => t.getAttribute("aria-selected") === "true") ?? tabs[0];
  if (first) show(first);
});

// 3. Branches: an accordion on the phone, an always-open board on wide screens.
const branchList = document.querySelector<HTMLElement>("[data-branches]");
if (branchList) {
  const items = Array.from(branchList.querySelectorAll<HTMLDetailsElement>("details"));
  const apply = () => {
    items.forEach((d, i) => {
      const sum = d.querySelector("summary");
      if (wide.matches) { d.open = true; sum?.setAttribute("tabindex", "-1"); }
      else { d.open = i === 0; sum?.removeAttribute("tabindex"); }
    });
  };
  items.forEach((d) => d.querySelector("summary")?.addEventListener("click", (e) => { if (wide.matches) e.preventDefault(); }));
  apply();
  wide.addEventListener("change", apply);
}

// 4. Phone call bar: slides in once the first screen is scrolled past.
const bar = document.querySelector<HTMLElement>("[data-callbar]");
const hero = document.getElementById("hero");
if (bar && hero && "IntersectionObserver" in window) {
  bar.classList.add("is-armed");
  new IntersectionObserver(([e]) => bar.classList.toggle("is-shown", !e.isIntersecting), { threshold: 0 }).observe(hero);
}

// 5. Mobile menu closes after a section link is chosen.
const menu = document.querySelector<HTMLDetailsElement>("details.menu");
menu?.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", () => { menu.open = false; }));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && menu?.open) { menu.open = false; menu.querySelector("summary")?.focus(); }
});

// 6. FutureLink: a tap focuses it, so its note shows on touch screens too.
document.querySelectorAll<HTMLElement>(".future-link").forEach((el) => el.addEventListener("click", () => el.focus()));
