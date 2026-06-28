import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabase-Client für den Server (Server Components, Route Handlers, Actions).
// `cookies()` ist in Next.js 15/16 asynchron -> deshalb await.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Aufruf aus einer Server Component – kann ignoriert werden,
            // da die Session über die Middleware aktualisiert wird.
          }
        },
      },
    }
  );
}
