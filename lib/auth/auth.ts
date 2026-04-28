import { createClient } from "../supabase/client";

const supabase = createClient();

export async function getUser() {
    const { data, error } = await supabase.auth.getClaims();

    if (error) {
        console.error(error);
        return null;
    }

    return data?.claims ?? null;
}

// Login methods
export async function loginWithEmail(email: string, password: string) {

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// Logout
export async function logout() {

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Logout error:', error);
        throw new Error(error.message);
    };
}
