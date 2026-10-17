# Runbook: E-Mail-Infrastruktur goekbau.de (Task 8.7)

Ziel laut `email-security`: SPF, DKIM und DMARC für `goekbau.de`; Formular-Mails bestehen `spf=pass dkim=pass dmarc=pass`. Ausgeführt wird das bei IONOS durch jemanden mit Zugang zur Domain-Verwaltung. Werte vor dem Eintragen mit der aktuellen IONOS-Hilfe abgleichen.

## 1. Absender-Postfach anlegen

- IONOS → E-Mail → neues Postfach `website@goekbau.de` (nur Versand, kein Weiterleiten)
- Starkes Passwort erzeugen und nur als Deploy-Now-Secret `GOEKBAU_SMTP_PASS` hinterlegen
- SMTP: `smtp.ionos.de`, Port 587, STARTTLS (`GOEKBAU_SMTP_SECURE=tls`)

## 2. SPF

DNS → TXT-Eintrag für `goekbau.de` (es darf nur **einen** SPF-Eintrag geben – vorhandenen ergänzen, nicht doppeln):

```
v=spf1 include:_spf-eu.ionos.com -all
```

`-all` erst setzen, wenn sicher ist, dass kein anderer Dienst im Namen der Domain versendet (Newsletter, CRM, Kopierer). Bis dahin `~all`.

## 3. DKIM

IONOS → Domain → E-Mail-Einstellungen → DKIM aktivieren. IONOS legt den Selektor-Eintrag selbst an. Prüfen:

```
dig +short TXT <selector>._domainkey.goekbau.de
```

## 4. DMARC

TXT-Eintrag `_dmarc.goekbau.de`, Start mit Quarantäne und Berichten an die Agentur:

```
v=DMARC1; p=quarantine; rua=mailto:dmarc@golightning.ai; adkim=s; aspf=s; pct=100
```

**Termin:** 30 Tage nach Aktivierung Berichte auswerten. Gibt es keine Fehlzustellungen legitimer Absender → `p=reject`.

## 5. Virenschutz der Empfangspostfächer

IONOS → E-Mail → Postfach `info@` und `deniz.goek@` → Virenschutz/Spamschutz: aktiv (Schicht 7 aus design.md D11). Screenshot oder Notiz hier ablegen:

| Postfach              | Virenschutz aktiv | geprüft am | von |
| --------------------- | ----------------- | ---------- | --- |
| info@goekbau.de       |                   |            |     |
| deniz.goek@goekbau.de |                   |            |     |

## 6. Nachweis

```
dig +short TXT goekbau.de | grep spf1
dig +short TXT _dmarc.goekbau.de
```

Dann über das Formular auf Staging eine Testanfrage senden (Task 7.5). In der empfangenen Mail unter „Original anzeigen“ muss stehen: `spf=pass`, `dkim=pass`, `dmarc=pass`.

## Hinweis zum Ist-Zustand (WordPress)

Laut Mail-Log scheitert der Versand der WordPress-Formulare seit mindestens 02/2026 jeden Monat (deaktivierter Google-OAuth-Client, SMTP-Authentifizierung). Dieser Runbook-Schritt behebt mit dem neuen Absender-Postfach auch die Ursache auf Infrastruktur-Seite.
