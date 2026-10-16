# ADR 0001 – Deploy-Now-Hosting-Spike

Status: lokal vorbereitet; Hosting-Entscheidung ausstehend. Task 1.3 bleibt offen.
Stand: 16.10.2026.

## Entscheidung und Umfang

Vor dem Aufbau der Website wird geprüft, ob ein IONOS-Deploy-Now-PHP-Projekt
die Anforderungen aus D2/D11 trägt. Das Testartefakt liegt getrennt von der
Website unter `tools/deploy-now-spike/`. Es enthält keine echten Formulare,
Bewerbungen, SMTP-Zugangsdaten oder Malware-Dateien.

`api/ping.php` verlangt ein mindestens 32 Zeichen langes Token im Header
`X-Spike-Token`. Fehlendes, falsches oder nicht konfiguriertes Token ergibt 404.
Die Diagnose gibt nur Fähigkeiten zurück, keine internen Pfade oder Secrets.
`.htaccess` sperrt Token-Datei und andere Dotfiles. Vor dem ersten autorisierten
Aufruf mit `--http-only` prüfen, dass diese Sperre tatsächlich funktioniert.

## Projekt in IONOS anlegen

1. Bestehendes GitHub-Repository `golightning/goekbau` verbinden und **PHP-Projekt**
   auswählen. Der Spike-Code muss dafür zuerst auf dem gewählten Branch liegen.
2. Build-Befehl: `sh tools/deploy-now-spike/build.sh`.
   Publish-Verzeichnis: `dist/deploy-now-spike`. Es werden ausschließlich diese
   Dateien veröffentlicht. Noch kein Next.js-/Composer-Build erforderlich.
3. PHP-Runtime 8.3 wählen. Nur die von IONOS bereitgestellte Vorschau-Domain
   verwenden; die produktiven Domains und DNS-Einträge bleiben unberührt.
4. Zufälliges Token erzeugen, z. B. `openssl rand -hex 32`, und als Runtime-Secret
   `SPIKE_TOKEN` hinterlegen. Nicht in Chat, Repo, URL oder Log kopieren.
5. Im Runtime-Konfigurationsschritt die Datei `.spike-token` mit Inhalt
   `$SPIKE_TOKEN` rendern lassen. Bei Workflow v2 entspricht das
   `.deploy-now/<projektname>/.spike-token.template` im Repository.
   Build-Environment-Variablen allein sind keine Runtime-Konfiguration.
6. Den von IONOS generierten Workflow und dessen Projekt-ID übernehmen.
   Projektbezogene Dateien werden erst nach Erstellung ergänzt; der Spike
   enthält keine erfundenen IDs oder Secrets.

Die PHP-Projektauswahl, Runtime-Templates und das Publish-Verzeichnis folgen
der [IONOS-Einrichtung](https://docs.ionos.space/docs/from-repo/),
[Runtime-Konfiguration](https://docs.ionos.space/docs/runtime-configuration/)
und [Build-Konfiguration](https://docs.ionos.space/docs/github-actions-customization/).

## Prüfung auf Staging

```sh
python3 tools/deploy-now-spike/check.py https://STAGING-HOST --http-only
python3 tools/deploy-now-spike/check.py https://STAGING-HOST
curl -I https://STAGING-HOST/spike-old
curl -I https://STAGING-HOST/spike-gone
curl -I https://STAGING-HOST/vendor/probe.txt
```

Der zweite Aufruf fragt das Token verdeckt ab. Alternativ unterstützt er
`SPIKE_TOKEN` aus der Umgebung. Redirects werden nicht automatisch verfolgt,
damit das Token nicht an ein Redirect-Ziel weitergegeben wird. Remote-HTTP
ohne TLS ist nicht erlaubt. Nicht vor der erfolgreichen Dotfile-Prüfung starten.

Der Test führt zwei authentifizierte Requests aus. Er prüft PHP-Version,
Extensions einschließlich XML-Unterstützung für DOCX, Upload-Grenzen,
Schreibzugriff und Wiederlesen eines Markers außerhalb des Document Roots.
Ein fehlendes GD/Imagick, ZIP oder sonstiges Pflichtmerkmal führt zu Exitcode 1.
Beide SMTP-Ports werden berichtet; mindestens einer muss TLS unterstützen.

HTTPS wird ausschließlich als Transport-/Zertifikatsprüfung gegen
`https://mb-api.abuse.ch/api/v1/` geprüft. Auch eine HTTP-Antwort 401/403 belegt
nur die Netzwerkverbindung. Ein authentifizierter MalwareBazaar-Hash-Abgleich
bleibt Task 8.5. SMTP prüft Port 465 mit implizitem TLS und Port 587 mit
STARTTLS, jeweils mit Zertifikatsprüfung; weder AUTH noch MAIL/RCPT/DATA werden
gesendet. Erfolgreiche Zustellung bleibt Task 7.5.

## Noch ausstehende Hosting-Nachweise

| Prüfung                                                                                                                  | IONOS-Ergebnis |
| ------------------------------------------------------------------------------------------------------------------------ | -------------- |
| 301 inklusive Ziel, 410, eigene 404-Seite                                                                                | offen          |
| Custom-Header, kein X-Powered-By, Deny vendor/Dotfiles                                                                   | offen          |
| PHP >= 8.3, fileinfo, GD/Imagick, ZIP, zlib, OpenSSL, XML                                                                | offen          |
| Upload >= 10 MiB, POST >= 11 MiB, mindestens 5 Dateien (per `.user.ini` gesetzt → belegt zugleich, ob Overrides greifen) | offen          |
| Privater Speicher beschreibbar und über Requests erhalten                                                                | offen          |
| Marker nach erneutem Deployment weiterhin vorhanden                                                                      | offen          |
| HTTPS abuse.ch mit gültigem TLS                                                                                          | offen          |
| SMTP-TLS 465/587                                                                                                         | offen          |

Nach dem ersten Test erneut deployen und den ersten Diagnose-Request prüfen:
`previous_request_seen` muss bereits `true` sein. Der Marker heißt
`goekbau-spike-state/probe` neben dem Document Root. Das Script prüft keinen
Schutz gegen andere Hosting-Mandanten. Isolierung und Dateirechte bleiben
zusätzlich zu prüfen. Nach Abschluss den Marker samt Testverzeichnis über
einen gezielten Runtime-Cleanup entfernen und den Diagnose-Endpoint sowie das
Token vor Produktivbetrieb entfernen.

Falls privater Speicher nicht möglich ist, den in D11 vorgesehenen gesperrten
Speicher gesondert testen. Falls notwendige Apache-Regeln, Extensions oder
Netzwerkverbindungen fehlen: D2-Fallback bewerten und Entscheidung hier
festhalten. Persistenz über Deployments wird bei Deploy Now über
[Deployment-Konfiguration](https://docs.ionos.space/docs/deployment-configuration/)
gesteuert; zwei HTTP-Requests allein belegen sie nicht.

## Hinweise für die echte `.htaccess` (Task 10.4 / 8.10)

- Die Dotfile-Sperre `RewriteRule (^|/)\. - [F,L]` würde auch `/.well-known/security.txt`
  (`web-security`) blockieren. In der Produktions-`.htaccess` braucht `^\.well-known/` eine Ausnahme vor der Sperre.
- `expose_php` lässt sich nicht per `.user.ini` setzen (PHP_INI_SYSTEM). `X-Powered-By` wird deshalb
  ausschließlich per `Header unset` entfernt. Der Checker prüft das.
- Die lokale Prüfung mit `php:8.3-apache` (mod_php) liest `.user.ini` nicht. Deshalb bleiben die Upload-Limits
  dort rot. Aussagekräftig ist nur das Ergebnis auf IONOS, wo PHP per FPM/CGI läuft.

## Lokale Verifikation

Die lokale Apache/PHP-Prüfung belegt nur das Testartefakt, keine IONOS-Eignung.
Geprüft mit `php:8.3-apache`, Image-Digest
`sha256:f8506a19d79cad7fcf0c8049f1ed2208824961018fdc10bd80f324094dcd36bd`:

- PHP-Syntaxprüfung erfolgreich; sämtliche HTTP-Prüfungen erfolgreich
  (301-Ziel, 410, eigene 404, HEAD, Custom-Header, kein X-Powered-By,
  vendor/Dotfiles gesperrt, fehlendes/falsches Token abgelehnt).
- Authentifizierter GET liefert JSON; POST wird mit 405 abgelehnt.
- Privater Marker im Container über zwei Requests erhalten.
- SMTP-Zertifikatsprüfung auf 465 und STARTTLS auf 587 erfolgreich;
  es wurden keine Mails versendet.
- abuse.ch: erster Versuch ohne HTTP-Antwort innerhalb des 3-s-Zeitlimits,
  zweiter Versuch HTTP 401 mit erfolgreichem TLS. Kein Nachweis für
  authentifizierte API-Funktion oder dauerhafte Verfügbarkeit.
- Standardcontainer: ZIP und GD/Imagick fehlen, Upload-Limit 2M,
  POST-Limit 8M. Die Prüfung meldet diese vier fehlenden Voraussetzungen
  mit Exitcode 1. Das sind lokale Containerwerte, keine IONOS-Ergebnisse.
- Unabhängig nachgeprüft am 17.10.2026 (zweiter Durchlauf, gleiches Image): identisches Ergebnis,
  4 erwartete Fehlschläge (ZIP, GD/Imagick, Upload-Limit, POST-Limit), alle übrigen Prüfungen OK.

Für einen lokalen Nachlauf zunächst `sh tools/deploy-now-spike/build.sh`
ausführen. Ein nur lokal erzeugtes Token unter
`dist/deploy-now-spike/.spike-token` ablegen (dieser Ordner ist gitignored).
Das Artefakt in einen PHP-8.3-Apache-Container nach `/var/www/html` mounten,
`rewrite` und `headers` aktivieren, `/var/www/goekbau-spike-state` für
`www-data` beschreibbar machen und den Container ausschließlich an
`127.0.0.1` binden. Dann die beiden Checker-Aufrufe gegen diesen lokalen
Origin ausführen. Die Einrichtung des vollständigen lokalen Prod-Nachbaus
mit Extensions und Mailpit bleibt Task 1.4.
