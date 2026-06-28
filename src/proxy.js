import { updateSession } from "@/lib/supabase/middleware";

// In Next.js 16 heißt die frühere "middleware" jetzt "proxy".
// Läuft bei jedem passenden Request: aktualisiert die Session und schützt Routen.
export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Alle Pfade außer:
     * - _next/static, _next/image (Build-Assets)
     * - favicon.ico und statische Bilddateien
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
