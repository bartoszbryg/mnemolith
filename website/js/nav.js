import {
    getUser,
    isLoggedIn,
    signOut
} from "./auth.js";

function ensureStyles() {
    if (document.querySelector("#recallith-auth-nav-styles")) return;
    const style = document.createElement("style");
    style.id = "recallith-auth-nav-styles";
    style.textContent = `
    .nav .wrap>.wordmark+.links{margin-left:48px}
    .nav-sign-in{margin-left:auto;margin-right:16px;color:var(--muted);text-decoration:none}
    .nav-account{position:relative}.nav-account-trigger{display:flex;align-items:center;gap:9px;border:0;background:transparent;color:var(--text);font:inherit;cursor:pointer}
    .nav-avatar{display:grid;width:34px;height:34px;place-items:center;border-radius:50%;background:var(--accent);color:#111;font-size:12px;font-weight:700}
    .nav-account-menu{position:absolute;top:calc(100% + 12px);right:0;min-width:180px;padding:8px;border:1px solid var(--border);border-radius:var(--radius-md);background:#151515;box-shadow:0 18px 50px #000a}
    .nav-account-menu a,.nav-account-menu button{display:block;width:100%;padding:10px 12px;border:0;background:transparent;color:var(--text);font:inherit;text-align:left;text-decoration:none;cursor:pointer}
    .nav-account-menu a:hover,.nav-account-menu button:hover{background:#202020}.nav-account-menu[hidden]{display:none}`;
    document.head.append(style);
}

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
        (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "'": "&#39;",
            '"': "&quot;"
        })[character],
    );
}

export function highlightCurrentPage(activePage) {
    const current = activePage || window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("nav a[href]").forEach((link) => {
        const target = new URL(link.href, window.location.href).pathname.split("/").pop();
        link.classList.toggle("active", target === current);
    });
}

export async function initNav(options = {}) {
    ensureStyles();
    const nav = document.querySelector("header nav, nav");
    if (!nav) return;
    const container = nav.querySelector(".wrap") || nav;
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
            signIn.className = "nav-sign-in";
            container.insertBefore(signIn, cta || null);
        }
        highlightCurrentPage(options.activePage);
        return;
    }

    const user = await getUser();
    if (!user) return;
    const account = document.createElement("div");
    account.className = "nav-account";
    account.innerHTML = `
    <button class="nav-account-trigger" type="button" aria-expanded="false" aria-haspopup="true">
      <span class="nav-avatar">${escapeHTML(initialsFor(user))}</span>
      <span>${escapeHTML(truncate(user.email || "Account"))}</span>
      <span aria-hidden="true">⌄</span>
    </button>
    <div class="nav-account-menu" hidden>
      <a href="/account.html">My account</a>
      <button type="button">Sign out</button>
    </div>`;
    if (cta) cta.replaceWith(account);
    else container.append(account);

    const trigger = account.querySelector(".nav-account-trigger");
    const menu = account.querySelector(".nav-account-menu");
    trigger.addEventListener("click", () => {
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        trigger.setAttribute("aria-expanded", String(!expanded));
        menu.hidden = expanded;
    });
    account.querySelector(".nav-account-menu button").addEventListener("click", signOut);
    document.addEventListener("click", (event) => {
        if (!account.contains(event.target)) {
            trigger.setAttribute("aria-expanded", "false");
            menu.hidden = true;
        }
    });
    highlightCurrentPage(options.activePage);
}