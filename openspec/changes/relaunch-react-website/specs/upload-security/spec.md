## Purpose

Schützt Empfänger von Bewerbungen vor Schadsoftware in Dateianhängen. Dafür gibt es mehrere kostenfreie Schutzschichten: strenge Typprüfung, Entschärfung aktiver Inhalte und Abgleich mit bekannter Malware. Bewerberdateien gelangen dabei nicht an Dritte.

## ADDED Requirements

### Requirement: Erlaubte Dateitypen
Der Upload SHALL nur PDF, DOCX, JPG und PNG annehmen. Der Typ MUST anhand der Magic Bytes und der Dateistruktur erkannt werden. Endung und deklarierter MIME-Typ MUST damit übereinstimmen. Legacy-Formate mit Makro-Fähigkeit (DOC, DOCM, XLS, RTF), Archive (ZIP, RAR, 7z) und ausführbare Formate MUST abgelehnt werden.

#### Scenario: Umbenannte ausführbare Datei
- **WHEN** eine Windows-EXE als `lebenslauf.pdf` hochgeladen wird
- **THEN** wird die Bewerbung mit HTTP 422 und dem Hinweis auf erlaubte Formate abgelehnt

#### Scenario: Makro-Dokument
- **WHEN** eine `.docm`-Datei oder eine `.docx` mit enthaltenem `vbaProject.bin` hochgeladen wird
- **THEN** wird sie abgelehnt

### Requirement: Größen- und Mengengrenzen
Pro Bewerbung SHALL der Endpoint höchstens 5 Dateien mit zusammen höchstens 10 MB annehmen. Die Grenzen MUST serverseitig vor jeder weiteren Verarbeitung greifen.

#### Scenario: Sechste Datei
- **WHEN** eine Bewerbung 6 Dateien enthält
- **THEN** wird sie abgelehnt, ohne dass eine Datei inhaltlich verarbeitet wird

### Requirement: Schutz vor Archiv-Bomben
Für DOCX-Dateien (ZIP-Container) SHALL der Endpoint vor dem Entpacken die Anzahl der Einträge (≤ 1000), die entpackte Gesamtgröße (≤ 50 MB) und das Kompressionsverhältnis (≤ 100:1) prüfen. Pfade mit `..` oder absoluten Pfaden MUST zur Ablehnung führen.

#### Scenario: Zip-Bombe als DOCX
- **WHEN** eine DOCX hochgeladen wird, deren Inhalt entpackt 2 GB groß wäre
- **THEN** wird sie abgelehnt, ohne entpackt zu werden

### Requirement: Entschärfung von Bildern
JPG- und PNG-Dateien SHALL serverseitig dekodiert und neu kodiert werden. An den Empfänger geht nur die neu kodierte Datei. Metadaten (EXIF, GPS) und angehängte Fremddaten MUST dabei entfernt werden. Nicht dekodierbare Bilder MUST abgelehnt werden.

#### Scenario: Polyglot-Bild
- **WHEN** ein PNG hochgeladen wird, an dessen Ende ein Skript oder Archiv angehängt ist
- **THEN** erhält der Empfänger ein sauber neu kodiertes PNG ohne die angehängten Daten

### Requirement: Prüfung von PDFs auf aktive Inhalte
PDF-Dateien SHALL auf aktive oder riskante Bestandteile geprüft werden: `/JavaScript`, `/JS`, `/Launch`, `/EmbeddedFile`, `/RichMedia`, `/XFA`, `/OpenAction` mit Aktion sowie Verschlüsselung. PDFs mit einem dieser Merkmale MUST abgelehnt werden. Die Meldung MUST den Bewerber bitten, eine einfache PDF-Fassung zu senden.

#### Scenario: PDF mit JavaScript
- **WHEN** ein PDF mit eingebettetem `/JavaScript` hochgeladen wird
- **THEN** wird es abgelehnt und der Bewerber erhält einen Hinweis, das Dokument erneut als einfaches PDF zu exportieren

### Requirement: Prüfung von DOCX auf aktive Inhalte
DOCX-Dateien SHALL abgelehnt werden, wenn sie Makros (`vbaProject.bin`), eingebettete OLE-Objekte, ActiveX-Steuerelemente oder externe Beziehungen (`TargetMode="External"`, z. B. Remote-Template-Injection) enthalten.

#### Scenario: Externe Vorlage
- **WHEN** eine DOCX hochgeladen wird, deren Beziehungen auf eine externe URL als Vorlage verweisen
- **THEN** wird sie abgelehnt

### Requirement: Abgleich mit bekannter Malware ohne Dateiweitergabe
Für jede angenommene Datei SHALL der SHA-256-Hash gegen eine öffentliche Malware-Hash-Datenbank geprüft werden. Dabei MUST ausschließlich der Hash übermittelt werden, niemals die Datei. Dienste, die hochgeladene Dateien Dritten zugänglich machen, MUST NOT verwendet werden.

#### Scenario: Bekannte Malware
- **WHEN** der Hash einer Datei in der Malware-Datenbank als bekannt bösartig geführt wird
- **THEN** wird die Bewerbung abgelehnt und der Vorfall ohne personenbezogene Daten protokolliert

#### Scenario: Datenbank nicht erreichbar
- **WHEN** die Hash-Prüfung wegen Zeitüberschreitung (> 3 s) oder eines Fehlers kein Ergebnis liefert
- **THEN** wird die Bewerbung zugestellt. Der E-Mail-Betreff erhält den Präfix „[Anhang ungeprüft]“, und die übrigen Schutzschichten bleiben wirksam

#### Scenario: Keine Dateiübermittlung
- **WHEN** der Netzwerkverkehr des Endpoints während einer Bewerbung mitgeschnitten wird
- **THEN** verlassen keine Dateiinhalte den Server außer per SMTP an den konfigurierten Empfänger

### Requirement: Sichere Weitergabe an den Empfänger
Angehängte Dateien SHALL vor dem Versand einen neutralen, servergenerierten Dateinamen erhalten (z. B. `bewerbung-1.pdf`). Die E-Mail MUST pro Anhang Typ, Größe, SHA-256 und Prüfergebnis nennen.

#### Scenario: Manipulierter Dateiname
- **WHEN** eine Datei `lebenslauf.pdf‮exe.pdf` (Unicode-Richtungszeichen) oder mit Pfadanteilen hochgeladen wird
- **THEN** trägt der Anhang in der E-Mail einen neutralen Namen ohne Steuerzeichen

### Requirement: Keine Ablage im Web-Verzeichnis
Hochgeladene Dateien SHALL nie unterhalb des öffentlich ausgelieferten Verzeichnisses gespeichert werden. Sie MUST nach dem Versandversuch spätestens am Ende des Requests gelöscht sein.

#### Scenario: Direktzugriff
- **WHEN** jemand versucht, eine gerade hochgeladene Datei über eine URL abzurufen
- **THEN** existiert keine URL, unter der sie erreichbar ist
