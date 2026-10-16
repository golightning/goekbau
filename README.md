# goekbau.de

Relaunch der Website der GÖK Bauüberwachung Bahn GmbH. WordPress/Elementor wird durch eine React-Codebasis ersetzt (Next.js mit statischem Export und PHP-Formular-Endpoint auf IONOS Deploy Now).

Das Vorgehen ist spec-first mit [OpenSpec](https://github.com/Fission-AI/OpenSpec).

| Was | Wo |
|---|---|
| Ist-Analyse der WordPress-Seite | [research/wp-audit/AUDIT.md](research/wp-audit/AUDIT.md) |
| Aktuelle Change (Proposal, Specs, Design, Tasks) | [openspec/changes/relaunch-react-website/](openspec/changes/relaunch-react-website/) |
| Extrahierte Alt-Inhalte | [research/wp-audit/content/](research/wp-audit/content/) |

```bash
openspec view                                   # Dashboard
openspec show relaunch-react-website            # Change ansehen
openspec validate relaunch-react-website --strict
```

Umsetzung starten: `/opsx:apply relaunch-react-website` in Claude Code.

WordPress-Exporte (`.wpress`) gehören nach `_wp-export/`. Der Ordner ist gitignored, weil er Datenbank-Inhalte und Zugangsdaten enthält.
