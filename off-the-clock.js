/*
 * Off the clock: the list on the left is a set of tabs. Choosing one shows its
 * panel (title and text in the middle, picture on the right) and hides the rest.
 * Click or tap a name; with the keyboard, the arrow keys, Home and End move
 * between names. Without this script every panel shows, one after another.
 * The piano's keys press down under a mouse (CSS), a finger or a pen (below).
 */
(() => {
  const root = document.querySelector("[data-otc]");
  if (!root) return;
  const tabs = Array.from(root.querySelectorAll('[role="tab"]'));
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls")));

  function show(i, focus) {
    tabs.forEach((t, k) => {
      const on = k === i;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      panels[k].classList.toggle("is-active", on);
    });
    if (focus) tabs[i].focus();
  }

  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => show(i));
    t.addEventListener("keydown", (e) => {
      let next = null;
      if (e.key in step) next = (i + step[e.key] + tabs.length) % tabs.length;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      show(next, true);
    });
  });

  show(Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true")));

  // Piano keys press down under the pointer. Mouse hover is CSS (:hover); this
  // adds touch and pen, and lets a finger slide along the keys like a glissando.
  root.querySelectorAll(".piano .key").forEach((key) => {
    const press = (on) => key.classList.toggle("is-down", on);
    key.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") return;
      if (key.hasPointerCapture(e.pointerId)) key.releasePointerCapture(e.pointerId);
      press(true);
    });
    key.addEventListener("pointerenter", (e) => { if (e.pointerType !== "mouse" && e.buttons) press(true); });
    ["pointerleave", "pointerup", "pointercancel"].forEach((type) => key.addEventListener(type, () => press(false)));
  });
})();
