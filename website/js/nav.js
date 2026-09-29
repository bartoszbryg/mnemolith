import { getUser, isLoggedIn, signOut } from "./auth.js?v=2";

function initialsFor(user) {
  const source = user?.user_metadata?.full_name || user?.email || "R";
  const words = source.trim().split(/\s+/).filter(Boolean);
  return (words.length > 1 ? `${words[0][0]}${words.at(-1)[0]}` : source.slice(0, 2)).toUpperCase();
}

function truncate(value, length = 20) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

function escapeHTML(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character],
  );
}

export function highlightCurrentPage(activePage) {
  const current = activePage || window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav a[href]").forEach((link) => {
    const target = new URL(link.href, window.location.href).pathname.split("/").pop();
    link.classList.toggle("site-navigation-link--current", target === current);
  });
}

export async function initNav(options = {}) {
  const nav = document.querySelector(".site-navigation");
  if (!nav) return;
  const container = nav.querySelector(".site-navigation-inner");
  if (!container) return;
  if (container.querySelector("[data-auth-actions]")) {
    highlightCurrentPage(options.activePage);
    return;
  }
  const cta = [...container.querySelectorAll("a")].find((link) =>
    /download free|get started|download/i.test(link.textContent),
  );

  if (!isLoggedIn()) {
    const onLoginPage = window.location.pathname.endsWith("/login.html");
    if (!onLoginPage && !container.querySelector('a[href$="login.html"]')) {
      const signIn = document.createElement("a");
      signIn.href = "/login.html";
      signIn.textContent = "Sign in";
      signIn.className = "site-navigation-sign-in";
      container.insertBefore(signIn, cta || null);
    }
    highlightCurrentPage(options.activePage);
    return;
  }

  const user = await getUser();
  if (!user) return;
  const account = document.createElement("div");
  account.className = "site-navigation-account";
  account.innerHTML = `
    <button class="site-navigation-account-trigger" type="button" aria-expanded="false" aria-haspopup="true">
      <span class="site-navigation-avatar">${escapeHTML(initialsFor(user))}</span>
      <span>${escapeHTML(truncate(user.email || "Account"))}</span>
      <span aria-hidden="true">⌄</span>
    </button>
    <div class="site-navigation-account-menu" hidden>
      <a class="site-navigation-menu-item" href="/account.html">My account</a>
      <button class="site-navigation-menu-item" type="button">Sign out</button>
    </div>`;
  if (cta) cta.replaceWith(account);
  else container.append(account);

  const trigger = account.querySelector(".site-navigation-account-trigger");
  const menu = account.querySelector(".site-navigation-account-menu");
  trigger.addEventListener("click", () => {
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    menu.hidden = expanded;
  });
  account.querySelector(".site-navigation-account-menu button").addEventListener("click", signOut);
  document.addEventListener("click", (event) => {
    if (!account.contains(event.target)) {
      trigger.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }
  });
  highlightCurrentPage(options.activePage);
}
