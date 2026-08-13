import {
    createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://gavpnmyqqefbsjwymmop.supabase.co";
const SUPABASE_KEY = "sb_publishable_ptoxdGmsvyyZdkJcKYOTOA_C3BNqM6z";
const STORAGE_KEY = "sb-gavpnmyqqefbsjwymmop-auth-token";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function getSession() {
    const {
        data,
        error
    } = await supabase.auth.getSession();
    return error ? null : data.session;
}

export async function refreshSession() {
    const {
        data,
        error
    } = await supabase.auth.refreshSession();
    return error ? null : data.session;
}

export async function getUser() {
    const {
        data,
        error
    } = await supabase.auth.getUser();
    return error ? null : data.user;
}

export function signInWithEmail(email, password) {
    return supabase.auth.signInWithPassword({
        email,
        password
    });
}

export function signUpWithEmail(email, password, fullName) {
    return supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName
            }
        },
    });
}

export function signInWithGoogle() {
    return supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${window.location.origin}/auth/callback.html`
        },
    });
}

export async function signOut() {
    await supabase.auth.signOut();
    window.location.assign("/index.html");
}

export function onAuthChange(callback) {
    const {
        data
    } = supabase.auth.onAuthStateChange(callback);
    return () => data.subscription.unsubscribe();
}

export function isLoggedIn() {
    try {
        const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
        const expiresAt = Number(stored?.expires_at || 0) * 1000;
        return Boolean(stored?.access_token && expiresAt > Date.now());
    } catch {
        return false;
    }
}

export async function getSubscription() {
    try {
        const session = await getSession();
        if (!session?.user?.id || !session.access_token) return null;
        const query = new URLSearchParams({
            user_id: `eq.${session.user.id}`,
            select: "plan,status,current_period_end",
            limit: "1",
        });
        const response = await fetch(`${SUPABASE_URL}/rest/v1/subscriptions?${query}`, {
            headers: {
                apikey: SUPABASE_KEY,
                Authorization: `Bearer ${session.access_token}`,
            },
        });
        if (!response.ok) return null;
        const rows = await response.json();
        return rows[0] || null;
    } catch {
        return null;
    }
}

export async function getUserPlan() {
    const subscription = await getSubscription();
    return subscription?.plan === "pro" && subscription?.status === "active" ? "pro" : "free";
}

export function requireAuth(redirectTo = "/account.html") {
    if (!isLoggedIn()) {
        window.location.replace(`/login.html?next=${encodeURIComponent(redirectTo)}`);
        return false;
    }
    return true;
}