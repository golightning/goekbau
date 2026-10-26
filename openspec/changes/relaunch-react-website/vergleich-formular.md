# Formularverarbeitung: PHP-Endpunkt oder externer Dienst

Stand 26.10.2026, Anlass: PHP2Shell (CVE-2026-109618, CVE-2026-109619) und der mögliche Umzug von Deploy Now auf den bestehenden IONOS-Webspace. Entscheidung offen; das Formular bleibt bis dahin unverändert.

## Befund am bestehenden Hosting (von außen geprüft, ohne Kundenkonto)

- `www.goekbau.de` und `goekbau.de` zeigen auf 217.160.0.208, eine Adresse aus dem IONOS-Netz. Server: Apache, `X-Powered-By: PHP/8.0.30`. Das spricht für verwaltetes IONOS-Webhosting und gegen einen eigenen Server. Belegt ist es erst durch einen Blick ins Kundenkonto: Gibt es dort unter „Hosting“ die Kachel „PHP“ mit umstellbarer Version, ist das Paket verwaltet.
- IONOS (Hilfe-Artikel 29647): Für Versionen, die im Konto umstellbar sind, hat IONOS die Sicherheitsupdates eingespielt, ausdrücklich auch für Versionen ohne offizielle Unterstützung durch das PHP-Projekt. Ausgenommen ist selbst betriebenes PHP (VPS, Dedicated Server). Die Versionsangabe 8.0.30 sagt daher nichts über den Patchstand aus.
- Unabhängig vom Patch: Angriffe gab es ab dem 17.10., vier Tage vor den Updates. IONOS empfiehlt, die Logs (SIGSEGV, gehäufte „Allowed memory size exhausted“, ungewöhnliche multipart/form-data-Anfragen) und den Webspace (unbekannte .php-Dateien, unbekannte WordPress-Admins) zu prüfen. Das geht nur mit Zugang zum Konto.
- PHP 8.0 wird vom PHP-Projekt nicht mehr gepflegt. Für den Rest der WordPress-Laufzeit ist eine Umstellung auf 8.3 oder 8.4 im Konto ratsam, sofern WordPress und die Plugins das vertragen.
- E-Mail: Die MX-Einträge zeigen auf Microsoft 365. SPF erlaubt IONOS und Microsoft 365. Es gibt keinen DMARC-Eintrag und keinen DKIM-Eintrag für Microsoft 365 (`selector1._domainkey`). Für die Zustellung ist das wichtiger als die Wahl zwischen PHP und externem Dienst (siehe unten).
- Subdomains: Unter den gängigen Namen (www, mail, webmail, alt, old, dev, test, staging, stage, wp, blog, shop, ftp, neu, new, beta) löst nur `www` auf. Die Zertifikatsdatenbank crt.sh war während der Prüfung nicht erreichbar; die Abfrage wird vor dem Abschalten von WordPress wiederholt. Unterverzeichnisse lassen sich nur per SFTP prüfen.

## Vergleich

| | PHP-Endpunkt auf verwaltetem Webspace (heutiger Plan) | Statische Seite plus externer Formulardienst |
| --- | --- | --- |
| **Kosten** | Keine zusätzlichen; im Hosting-Paket enthalten | Laufende Gebühr; Datei-Uploads (Lebenslauf) sind bei solchen Diensten meist nur in bezahlten Tarifen enthalten. Preise je Anbieter vor einer Entscheidung prüfen |
| **Wartung** | PHP-Laufzeit patcht IONOS (siehe PHP2Shell). Bei uns: Composer-Abhängigkeiten (PHPMailer, ALTCHA) aktuell halten, 98 PHP-Tests, Secrets in einer Konfigurationsdatei im gesperrten Verzeichnis `_app` (besser außerhalb des Document Roots, falls das Paket das erlaubt) | Kein Code auf dem eigenen Server. Bei uns: Formular-Frontend anpassen, Konto, Schlüssel und Spam-Einstellungen beim Dienst pflegen; Abhängigkeit von dessen API und Preismodell |
| **Datenschutz** | Daten (inkl. Lebensläufe) bleiben bei IONOS und im eigenen Postfach; kein weiterer Auftragsverarbeiter. Dateien werden nach dem Versand gelöscht | Weiterer Auftragsverarbeiter mit AV-Vertrag, Datenschutzerklärung anpassen. Serverstandort EU/Drittland je Anbieter klären; bei Bewerbungsunterlagen besonders heikel |
| **Zustellung** | Versand per SMTP über ein Postfach der Domain (`website@goekbau.de`). SPF erlaubt IONOS bereits; DKIM und DMARC fehlen noch. Offen: Postfach bei IONOS oder Microsoft 365 | Der Dienst versendet über eigene Server, oft mit eigener Absenderdomain und Antwort-an. Ohne DKIM/DMARC für goekbau.de landen solche Mails eher im Spam oder lassen sich schwer zuordnen |
| **Angriffsfläche** | Drei öffentliche PHP-Skripte (`challenge.php`, `submit.php`, `stats.php`) auf dem Webspace; Schutz hängt am Patchstand des Hosters. Härtung: `session.upload_progress.enabled=Off`, `expose_php=Off` (ergänzt 26.10.) | Kein PHP auf dem Webspace. Die Angriffsfläche verlagert sich zum Dienst |
| **Funktionsumfang** | Wie spezifiziert: Uploads bis 10 MB mit Inhaltsprüfung, ALTCHA ohne Drittanbieter, Rate-Limit, eigene Fehlermeldungen | Abhängig vom Dienst; Upload-Prüfung, Spam-Schutz und Fehlertexte meist nur eingeschränkt anpassbar |

## Einschätzung

Auf verwaltetem IONOS-Webspace ist der PHP-Endpunkt vertretbar: Den Patch der Laufzeit übernimmt der Hoster, die Daten bleiben ohne weiteren Dienstleister im eigenen Bereich, und es entstehen keine laufenden Kosten. Ein externer Dienst lohnt sich, wenn auf dem Webspace grundsätzlich kein PHP laufen soll. Er verlagert Betrieb und Verantwortung, beseitigt sie aber nicht und erfordert einen weiteren Auftragsverarbeiter für Bewerbungsunterlagen.

Unabhängig von der Wahl sollten vor dem Go-live DKIM und DMARC für goekbau.de eingerichtet werden.

## Vor dem Entfernen von WordPress

1. Vollständige Sicherung von Webspace-Dateien und Datenbank, verschlüsselt und offline aufbewahrt; Wiederherstellbarkeit stichprobenartig prüfen.
2. Logs und Webspace auf Spuren von PHP2Shell prüfen (siehe Befund). Bei Treffern zuerst bereinigen und alle Zugangsdaten (Datenbank, SFTP, WordPress-Admins, SMTP) wechseln.
3. Bewerbungsunterlagen im Upload-Ordner (Elementor-Formulare): Aufbewahrung oder Löschung entscheiden; sie dürfen nach dem Wechsel nicht öffentlich erreichbar bleiben.
4. Per SFTP alle Verzeichnisse im Webspace auflisten (alte Installationen, Testkopien, Backups, Admin-Werkzeuge) und mit dem Kunden klären, was weg kann. Weitere Domains und Subdomains im IONOS-Konto prüfen, die Zertifikatsabfrage bei crt.sh wiederholen.
5. Erst danach `dist/site` hochladen, die Konfigurationsdatei mit den Secrets anlegen (außerhalb des Document Roots, sonst im gesperrten `_app`), Formular und Weiterleitungen am echten Server testen und die PHP-Version auf 8.3 oder neuer stellen.
