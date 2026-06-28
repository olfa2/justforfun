import { Bell } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Placeholder } from "@/components/ui/Placeholder";

export default function NotificationsPage() {
  return (
    <>
      <Header title="Benachrichtigungen" description="Aktivitäten und Hinweise" />
      <Placeholder
        icon={Bell}
        title="Keine Benachrichtigungen"
        description="Hier erscheinen künftig Aktivitäten aus deinen Projekten."
      />
    </>
  );
}
