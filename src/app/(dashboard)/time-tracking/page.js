import { Clock } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Placeholder } from "@/components/ui/Placeholder";

export default function TimeTrackingPage() {
  return (
    <>
      <Header title="Zeiterfassung" description="Timer und Zeiteinträge" />
      <Placeholder
        icon={Clock}
        title="Zeiterfassung in Arbeit"
        description="Timer starten/stoppen und die Übersicht deiner Zeiteinträge folgen bald."
      />
    </>
  );
}
