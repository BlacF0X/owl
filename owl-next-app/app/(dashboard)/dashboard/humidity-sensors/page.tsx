import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Capteurs d\'humidité | Dashboard OwL',
  description: 'Surveillance en temps réel de l\'humidité intérieure',
};

export default function HumiditySensorsPage() {
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Dashboard Qualité de l&apos;air - Système OwL
        </h1>
        <p className="text-sm text-muted-foreground">
          Surveillance en temps réel de l&apos;humidité intérieure
        </p>
      </div>

      {/* Temporary placeholder content */}
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto max-w-md space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              className="h-8 w-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold">Dashboard d&apos;humidité</h2>
          <p className="text-sm text-muted-foreground">
            Les composants seront ajoutés progressivement pour afficher les données des capteurs d&apos;humidité.
          </p>
        </div>
      </div>
    </div>
  );
}