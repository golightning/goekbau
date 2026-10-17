# goekbau.de

Relaunch der Website der GÖK Bauüberwachung Bahn GmbH. WordPress/Elementor wird durch eine React-Codebasis ersetzt (Next.js mit statischem Export und PHP-Formular-Endpoint auf IONOS Deploy Now).

## Lokal starten

**Voraussetzungen:** Node.js 22, [Docker Desktop](https://www.docker.com/products/docker-desktop/) (läuft), Git. PHP und Composer sind **nicht** nötig – sie laufen in Docker.

```bash
corepack enable pnpm   # einmalig: pnpm in der Version aus package.json
pnpm bootstrap         # einmalig: Abhängigkeiten, Playwright-Browser, PHP-Pakete
pnpm local             # bauen und starten
```

Danach:

| Was                      | Wo                                |
| ------------------------ | --------------------------------- |
| Website                  | http://localhost:8080             |
| Formular-Mails (Mailpit) | http://localhost:8025             |
| Komponenten-Übersicht    | http://localhost:8080/styleguide/ |

`pnpm local` baut die Seite statisch und startet sie wie in Produktion: Apache + PHP 8.3 mit `.htaccess`, CSP, Weiterleitungen und Formular-Endpoint. Alle Mails landen in Mailpit, nichts geht nach außen. Stoppen mit `pnpm local:down`.

### Entwickeln mit Live-Reload

```bash
pnpm local   # einmal starten – liefert den PHP-Endpoint für die Formulare
pnpm dev     # http://localhost:3000, Änderungen an Code und content/ sofort sichtbar
```

Der Dev-Server reicht `/api/*` an den laufenden Docker-Nachbau weiter. CSP, Weiterleitungen und Server-Header gibt es nur im Nachbau (Port 8080) – vor einem Commit dort prüfen.

### Testen

| Befehl            | Prüft                                                                   |
| ----------------- | ----------------------------------------------------------------------- |
| `pnpm check`      | alles unten nacheinander (braucht laufendes `pnpm local`)               |
| `pnpm lint`       | ESLint inkl. Farb-Tokens                                                |
| `pnpm typecheck`  | Inhalte (Velite) und TypeScript                                         |
| `pnpm test`       | Unit-Tests (Vitest)                                                     |
| `pnpm php:test`   | Formular-Endpoint und Sicherheitsschichten (PHPUnit, in Docker)         |
| `pnpm e2e`        | Ende-zu-Ende gegen http://localhost:8080 (Playwright, inkl. axe, Mails) |
| `pnpm lighthouse` | Performance-Budget (braucht Google Chrome)                              |

Nach Änderungen an Code oder Inhalten vor `pnpm e2e` neu bauen: `pnpm local`.

### Inhalte ändern

Texte, Stellen, Team, Projekte usw. liegen in `content/` – Anleitung: [docs/content.md](docs/content.md).

## Projekt-Dokumentation

Das Vorgehen ist spec-first mit [OpenSpec](https://github.com/Fission-AI/OpenSpec).

| Was                                              | Wo                                                                                                 |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Ist-Analyse der WordPress-Seite                  | [research/wp-audit/AUDIT.md](research/wp-audit/AUDIT.md)                                           |
| Migration der Inhalte                            | [research/wp-audit/MIGRATION.md](research/wp-audit/MIGRATION.md)                                   |
| Aktuelle Change (Proposal, Specs, Design, Tasks) | [openspec/changes/relaunch-react-website/](openspec/changes/relaunch-react-website/)               |
| Deploy-Now-Spike: Einrichtung und Prüfstand      | [docs/adr/0001-deploy-now.md](docs/adr/0001-deploy-now.md)                                         |
| Runbooks E-Mail-DNS und Go-live                  | [docs/runbook-email.md](docs/runbook-email.md), [docs/runbook-cutover.md](docs/runbook-cutover.md) |

```bash
openspec view                                   # Dashboard
openspec validate relaunch-react-website --strict
```

WordPress-Exporte (`.wpress`) gehören nach `_wp-export/`. Der Ordner ist gitignored, weil er Datenbank-Inhalte und Zugangsdaten enthält.
