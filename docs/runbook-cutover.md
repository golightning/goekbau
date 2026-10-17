# Runbook: Go-live / Cutover (Tasks 12.5–12.8)

Grundlage: design.md „Migration Plan“. Voraussetzungen: Tasks 12.1–12.4 erledigt (Hosting-Test, Deploy-Now-Workflow, Security-Abnahme, Staging-Abnahme durch GÖK) und **kein `⟦OFFEN⟧`-Platzhalter** mehr im Inhalt (`SITE_ENV=production pnpm assemble` bricht sonst ab).

## T−3 Tage: Vorbereitung

- [ ] Aktuelle DNS-Werte von `goekbau.de` und `www.goekbau.de` (A, AAAA, CNAME, **MX**, TXT) hier dokumentieren:

| Name       | Typ     | alter Wert | neuer Wert      |
| ---------- | ------- | ---------- | --------------- |
| goekbau.de | A       |            | (Deploy Now)    |
| goekbau.de | AAAA    |            | (Deploy Now)    |
| www        | CNAME/A |            | (Deploy Now)    |
| goekbau.de | MX      |            | **unverändert** |

- [ ] TTL der A/AAAA/CNAME-Einträge auf 300 s senken (mind. 24 h vor Cutover)
- [ ] Custom Domains `www.goekbau.de` und `goekbau.de` im Deploy-Now-Projekt hinterlegen
- [ ] Produktions-Secrets in Deploy Now gesetzt (siehe `.env.example`), `GOEKBAU_ENV=production`
- [ ] Letzter WordPress-Export (`.wpress`) gesichert und verschlüsselt abgelegt

## T: Umstellung

- [ ] DNS-Einträge A/AAAA/CNAME auf Deploy Now umstellen – **MX und Mail-TXT nicht anfassen**
- [ ] Nach Propagation prüfen:

```sh
curl -sI http://goekbau.de/kontakt/        # genau ein 301 → https://www.goekbau.de/kontakt/
curl -sI https://www.goekbau.de/stellenanzeige-3/   # 301 → /karriere/stellen/fachbauueberwacher-oberbau/
curl -sI https://www.goekbau.de/wp-login.php        # 410
curl -sI https://www.goekbau.de/ | grep -iE "strict-transport|content-security|x-robots"   # kein noindex!
```

- [ ] Redirect-Crawl gegen die alte Sitemap (`research/wp-audit/pages.json`): alle 12 URLs → 200 oder 301 auf existierendes Ziel
- [ ] Formular-Testsendung in Produktion (Kontakt + Bewerbung mit PDF) → Mail kommt an, `dmarc=pass`
- [ ] Mail-Empfang `info@goekbau.de` von extern unverändert
- [ ] Repository-Secrets `MONITOR_SITE_URL`, `MONITOR_TOKEN` setzen → Workflow „Mail-Monitor“ manuell starten → grün

## Rollback (bis zur Abschaltung möglich)

DNS-Einträge auf die alten Werte oben zurücksetzen (TTL 300 s → wirksam in Minuten). WordPress läuft bis zur Abschaltung unverändert weiter.

## T+0 bis T+7

- [ ] Google Search Console: Domain-Property, `https://www.goekbau.de/sitemap.xml` einreichen
- [ ] Nach 7 Tagen Abdeckung prüfen: keine neuen 404 für alte URLs
- [ ] Spam-Statistik (`/api/stats.php`, Monitor-Token) ansehen, Sperrwortliste bei Bedarf ergänzen

## T+30: Abschaltung WordPress

- [ ] Kein Rollback nötig gewesen
- [ ] WordPress-Backup verschlüsselt archivieren (Ablageort hier eintragen)
- [ ] 248 gespeicherte Einsendungen und 18 Bewerbungsdateien nach Entscheidung von GÖK übergeben oder löschen (DSGVO); Löschprotokoll
- [ ] Backup des Plugins „Backup Migration“ aus dem Webspace entfernen
- [ ] WordPress-Installation und Datenbank löschen, Lizenzen Elementor Pro und Unlimited Elements kündigen
