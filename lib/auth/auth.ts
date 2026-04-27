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
        console.error('Login error:', error);
        throw new Error(error.message);
    }

    return data;
}

export async function loginWithGoogle() {

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        }
    })

    if (error) {
        console.error('Google login error:', error);
        throw new Error(error.message);
    }

    return data;
};

// Logout
export async function logout() {

    const { error } = await supabase.auth.signOut();

    if (error) {
        console.error('Logout error:', error);
        throw new Error(error.message);
    };
}

// Signup
export async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password
    })

    if (error) {
        console.error('Signup error:', error);
        throw new Error(error.message);
    }

    return data;
}

