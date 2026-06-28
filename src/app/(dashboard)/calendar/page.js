import { Calendar } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Placeholder } from "@/components/ui/Placeholder";

export default function CalendarPage() {
  return (
    <>
      <Header title="Kalender" description="Termine und Events" />
      <Placeholder
        icon={Calendar}
        title="Kalender in Arbeit"
        description="Die Monats- und Wochenansicht mit Events folgt in einem der nächsten Schritte."
      />
    </>
  );
}
