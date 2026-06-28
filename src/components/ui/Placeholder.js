// Zentrierter Platzhalter für noch nicht implementierte Bereiche / leere Zustände.
export function Placeholder({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
          <Icon className="h-6 w-6" />
        </div>
      )}
      <h2 className="text-base font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
