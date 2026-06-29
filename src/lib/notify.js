// Server-seitiger Helfer zum Erstellen einer Benachrichtigung.
// Bekommt den (Server-)Supabase-Client übergeben, damit er in Actions nutzbar ist.
// „Best effort": Fehler (z. B. Tabelle fehlt noch) brechen die Hauptaktion nicht ab.
export async function createNotification(supabase, notification) {
  if (!notification?.user_id) return;
  try {
    await supabase.from("notifications").insert(notification);
  } catch {
    // bewusst ignoriert
  }
}
