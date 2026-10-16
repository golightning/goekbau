# Migration WordPress → Inhaltsmodell

Stand: 2026-10-17. Quelle: WordPress-Export `.wpress` (Elementor-JSON aus der Datenbank) und der öffentliche Crawl (`research/wp-audit/content/`).
Redaktionelle Grundsätze: Tippfehler korrigiert, durchgehend „Sie“ (vorher auf der Karriereseite „du“), widerspruchsfreie Firmenbeschreibung („seit Mai 2023“ statt „neues“ bzw. „etabliertes“ Unternehmen), Elementor-Silbentrennungen wie „SICHERUNGS-ÜBERWACHER“ aufgelöst.

## Seiten

| WordPress-Seite | Ziel | Bemerkung |
|---|---|---|
| `/` Home (70) | `content/pages/home.yaml` | Hero-Slider (2 identische Slides) → ein Hero-Motiv; Leistungsliste nicht dupliziert, sondern aus `services/` |
| `/uber-uns/` (73) | `content/pages/uber-uns.yaml` | Werte (3 Icon-Boxen + 3 Listenpunkte) zu einem Block zusammengeführt; Zitat Wolfgang Korruhn übernommen |
| `/leistungen/` (75) | `content/pages/leistungen.yaml` + `services/*.yaml` + `service-areas.yaml` | 8 angebotene + 5 geplante Leistungen; „derzeit nicht angeboten“ → Status `planned` |
| `/karriere/` (77) | `content/pages/karriere.yaml` | „Was wir bieten“ und „Anforderungen“ als Listen; Teaser-Liste wird aus `careers/` erzeugt |
| `/kontakt/` (79) | `content/pages/kontakt.yaml` + `company.yaml` | Adresse, Telefon, E-Mails in Stammdaten; Karte nach Einwilligung |
| `/stellenanzeige-2/` (737) | `careers/jobs/bauueberwacher-bahn-ob-kib.md` | Aufgaben aus `-3` übernommen (dort für beide Rollen beschrieben), Profil aus den Zugangsvoraussetzungen |
| `/stellenanzeige-3/` (738) | `careers/jobs/fachbauueberwacher-oberbau.md` | |
| `/stellenanzeige-4/` (739) | `careers/trainings/funktionsausbildung-fachbauueberwacher-oberbau.md` | in WP fälschlich als Stelle betitelt; fehlender Zeilenumbruch „Ril 046.2758Grundmodul“ behoben |
| `/stellenanzeige-5/` (740) | `careers/trainings/funktionsausbildung-bauueberwacher-bahn-ob-kib.md` | WP-Titel mit Suffix „5“ korrigiert; Abschlussprüfung auf BÜB (Ril 046.2753) korrigiert – in WP stand dort FBÜ/046.2752 (Kopierfehler, **vom Kunden bestätigen**) |
| `/stellenanzeige-6/` (741) | `careers/trainings/komplettausbildung-bauueberwacher-bahn.md` | |
| `/impressum/` (1108) | `content/legal/impressum.md` | § 55 RStV → § 18 MStV; TMG → DDG; OS-Plattform-Hinweis entfernt (EU-Plattform seit 07/2025 eingestellt); Steuernummer nicht mehr veröffentlicht; **HRB-Nummer fehlt** (⟦OFFEN⟧); Berufshaftpflicht-Umfang „Einmannbetrieb“ prüfen (⟦OFFEN⟧) |
| `/datenschutz/` (1084) | `content/legal/datenschutz.md` | **neu verfasst** für die tatsächlich eingesetzte Technik (ohne Google Fonts, reCAPTCHA, CookieYes, Elementor); vor Go-live rechtlich prüfen (⟦OFFEN⟧) |

Verworfen: Elementor-Templates `home-2`, `header-2`, `test`, `H2` (ungenutzt), 22 Spam-Kommentare, WPForms (ungenutzt).

## Annahmen, die der Kunde bestätigen sollte

- Stellen: `employmentType: FULL_TIME`, Arbeitsort Senden (Bayern), `datePosted` = letzte Änderung in WP (2026-02-07)
- Team: Rollen aus den Elementor-Hover-Boxen; Porträtfoto `IMG-20221227-WA0001.jpg` als Deniz Gök zugeordnet (war in WP der erste Teameintrag)
- Partner: Namen aus Logos/Links abgeleitet – „Btb“, „KNOW Personalberatung“ (Logo `eren-logo4`, verlinkt auf know-personalberatung.de) und „Gök Bauüberwachung LST“ bitte bestätigen; das lila Blitz-Logo (`LogoTransparent`) wurde nicht übernommen (vermutlich Agenturlogo)
- Kennzahlen 56 000 Stunden am Gleis, 170 Projekte, 21 Jahre Branchenerfahrung unverändert übernommen
- Agentur-Link im Footer: https://golightning.ai

## Medien – Herkunft

| Datei in `content/media/` | Quelle (WP `uploads/`) | Lizenz / Status |
|---|---|---|
| `brand/logo-goek.png` | `2023/10/Logo_Goek_Bauueberwachung.png` (4500 px, getrimmt auf 2400 px) | eigenes Logo |
| `photos/railway-track-pixabay-2049394.jpg` | `2025/02/railway-track-2049394_1280.jpg` | Pixabay-Lizenz |
| `photos/rails-pixabay-3633518.jpg` | `2025/02/rails-3633518_1280.jpg` | Pixabay-Lizenz |
| `photos/crane-pixabay-8400990.jpg` | `2025/02/crane-8400990_1280.jpg` | Pixabay-Lizenz (Reserve) |
| `projects/strecke-4940-goldshoefe.jpg` | `2025/02/Bildschirm_foto-2023-12-07-um-22.35.38-1-e1701988811636-1.png` | eigenes Baustellenfoto (14.05.2023) |
| `projects/strecke-4540-biberach.jpg` | `2025/02/Bildschirm_foto-2023-12-07-um-22.39.06-1.png` | eigenes Baustellenfoto (30.05.2023) |
| `projects/strecke-4930-fornsbach.jpg` | `2025/02/Bildschirm_foto-2023-12-07-um-22.44.04-1.png` | eigenes Baustellenfoto (03.07.2023) |
| `projects/strecke-5830-passau.jpg` | `2025/02/Bildschirm_foto-2023-12-07-um-22.47.13-1.png` | eigenes Baustellenfoto (26.09.2023) |
| `team/deniz-goek.jpg` | `2025/02/IMG-20221227-WA0001.jpg` | eigenes Foto (Freigabe der abgebildeten Person bestätigen) |
| `partners/db-infrago.png` | `2025/02/Bild_DB-InfraGO-data.png` | Partnerlogo – Nutzungsfreigabe einholen |
| `partners/pd-res.png` | `2025/02/Image_Editor-150x150-1.png` | Partnerlogo, nur 150 px – größere Datei anfordern |
| `partners/agp-baubetreuung.png` | `2025/08/WhatsApp-Image-2025-08-22-at-17.48.59.jpeg` | Partnerlogo |
| `partners/goek-lst.png` | `2025/02/Bildschirm_foto-2025-02-12-um-19.39.51-150x150-1.png` | Partnerlogo, nur 150 px |
| `partners/btb.png` | `2025/02/btb_logo-150x150-1.png` | Partnerlogo, nur 150 px |
| `partners/know-personalberatung.png` | `2025/08/eren-logo4_ZeichenflNche-1-Kopie-6-e1755822504709.png` | Partnerlogo |

Nicht übernommen: `dbec1842k_fotolia_Bauuberwachung…jpg` (Fotolia) und `AdobeStock_249385261_planung…jpeg` (Adobe Stock) – Lizenznachweis für die neue Nutzung fehlt; ca. 60 Theme-Demo-Bilder (`plumbero-*`, `gallery*`, Platzhalter); 18 Bewerbungsdateien aus `uploads/elementor/forms/` (personenbezogen, bleiben ausschließlich im gesicherten Export).
