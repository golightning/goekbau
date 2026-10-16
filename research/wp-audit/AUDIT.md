# Audit: goekbau.de (WordPress-Ist-Zustand)

Stand: 2026-10-16. Quelle: öffentlicher Crawl (HTML, WP-REST-API, Sitemap) + REA-Browser-Laufzeitaufnahme.
Noch **nicht** ausgewertet: WordPress-Export (`.wpress`) – liefert Elementor-JSON, Formular-Empfänger, Menüs, Original-Medien.

Legende: **[beobachtet]** direkt gemessen · **[abgeleitet]** aus Beobachtung geschlossen · **[offen]** unbekannt

## 1. Technik-Stack [beobachtet]

| Bereich | Ist |
|---|---|
| Hosting | IONOS, Apache, PHP 8.0.30 (EOL seit 11/2023) |
| CMS | WordPress 6.9.10 |
| Theme | Hello Elementor |
| Page Builder | Elementor 4.3.4 + Elementor Pro (Header/Footer-Templates, Formulare, Nav-Menü, Animated Headline) |
| Weitere Plugins | Prime Slider Lite (Hero-Slider), Unlimited Elements Premium (Image-Accordion, Hover-Reveal-Box, Smooth Scroll via Lenis+GSAP ScrollTrigger, Scroll-to-Top), CookieYes (cookie-law-info), Click-to-Chat (WhatsApp), Yoast SEO, WPForms (installiert, **nicht verwendet**), WP Mail SMTP, All-in-One WP Migration, Elementor MCP Composer |
| Kanonische Domain | `https://www.goekbau.de/` (apex → 301 → www) |

Laufzeit Startseite (REA Evidence `ev_071a7b65…e03`, Desktop 1440×900, de-DE):
156 Requests – 68 Stylesheets, 53 Scripts, 26 Bilder, 6 Fonts. 27 distinkte JS-Dateien (jQuery + Migrate, jQuery UI, UIkit, SmartMenus, Lenis, ScrollTrigger, Emoji-Script …). Keine 4xx/5xx. Konsole nur `JQMIGRATE`-Log.

## 2. Seiteninventar [beobachtet]

| Route | WP-ID | Titel | Besonderheiten |
|---|---|---|---|
| `/` | 70 | Home | Hero-Slider (2 identische Slides), Über-uns-Teaser, Leistungen (8 + 5 „geplant“), CTA, Projekte (Image-Accordion), Team |
| `/uber-uns/` | 73 | Über uns | Werte (3), Zähler (Gründung 2023, 56 000 Std. am Gleis, 170 Projekte, 21 Jahre Erfahrung), Projekte, Team, Werte-Liste, Kunden/Partner-Logos |
| `/leistungen/` | 75 | Leistungen | Leistungsliste (identisch zur Home-Sektion) |
| `/karriere/` | 77 | Karriere | Intro, „Was wir bieten“, Anforderungen, Teaser auf 4 Stellen (Toggle), Bewerbungsformular |
| `/kontakt/` | 79 | Kontakt | Kontaktformular, Adresse, Telefon, WhatsApp, 2 E-Mails, Google-Maps-iframe |
| `/stellenanzeige-2/` | 737 | Stelle: Bauüberwacher Bahn Ob/KIB (Ril 046.2753) | Tabs-Widget + Bewerbungsformular |
| `/stellenanzeige-3/` | 738 | Stelle: Fachbauüberwacher Oberbau (Ril 046.2752) | dito |
| `/stellenanzeige-4/` | 739 | **Ausbildung**: Funktionsausbildung FBÜ Oberbau | WP-Titel irreführend identisch mit `-3`; Teaser „Funktionsausbildungen“ |
| `/stellenanzeige-5/` | 740 | **Ausbildung**: Funktionsausbildung BÜB Ob/KIB | WP-Titel mit Suffix „5“; Teaser „Funktionsausbildungen“ |
| `/stellenanzeige-6/` | 741 | **Ausbildung**: Komplettausbildung | |
| `/impressum/` | 1108 | Impressum | Text |
| `/datenschutz/` | 1084 | Datenschutz | Text (e-recht24-Generator, IONOS, Google) |

Keine Blog-Posts. 129 Medien (61 JPEG, 38 PNG, 1 WebP; ≈ 34 MB).
Header/Footer sind Elementor-Theme-Builder-Templates (IDs 54 / 66), Global Kit = 58.

## 3. Formulare [beobachtet]

Alle über Elementor Pro → `admin-ajax.php` (`elementor_pro_forms_send_form`).

| Formular | Seiten | Felder |
|---|---|---|
| „New Form“ (Kontakt) | `/kontakt/` | Name (optional), E-Mail*, Telefon*, Nachricht (optional) |
| „Career Form“ (Bewerbung) | `/karriere/`, alle Stellenanzeigen | Name*, E-Mail*, Position*, Datei-Upload* (mehrfach, keine `accept`-Einschränkung), Nachricht* |

[offen] Empfängeradresse, Betreff, Upload-Größenlimit, Spam-Schutz (Honeypot/reCAPTCHA?) – aus Export lesen.

## 4. Design-Tokens [beobachtet, Elementor-Kit `post-58.css`]

- Farben: Primär/Akzent `#A6875C` (Bronze), Sekundär `#54595F`, Text `#141414`, Hell `#EEEEEE`, Weiß; Hover-Gold `#E2C398`; Gelb-Akzent `#FFD974` (Seiten-CSS)
- Schriften: Raleway 600 (Headlines), Roboto Slab 400 (Fließtext), Poppins 400/500 (Akzent/Sekundär)
- Container 1140 px; Breakpoints 767 / 1024 px
- Hero: Vollbild-Foto mit dunklem Overlay, weiße Headline; Nav-Pill aktiv in Bronze

## 5. Befunde / Altlasten

| # | Befund | Typ |
|---|---|---|
| B1 | Google Fonts werden **vor** Cookie-Einwilligung von `fonts.googleapis.com` geladen (DSGVO-Risiko, vgl. LG München I 3 O 17493/20) | beobachtet |
| B2 | Google-Maps-iframe lädt ohne Einwilligung (nur `loading="lazy"`) | beobachtet |
| B3 | `<html lang="en">`, `og:locale en_US` auf deutschsprachiger Seite | beobachtet |
| B4 | Footer-Social-Icons (Facebook, Twitter, Instagram, YouTube) ohne Link (Platzhalter) | beobachtet |
| B5 | Nur Startseite hat Meta-Description; übrige Seiten ohne | beobachtet |
| B6 | Stellen-URLs nicht sprechend (`/stellenanzeige-2/`); Stellen- und Ausbildungsangebote vermischt; Seitentitel von `-4`/`-5` falsch (Dublette bzw. Suffix „5“) | beobachtet |
| B7 | Hero-Slider zeigt zweimal denselben Slide | beobachtet |
| B8 | Zähler-Werte hartkodiert, im HTML initial „0“ (ohne JS unsichtbar) | beobachtet |
| B9 | Content-Tippfehler („Bauüberwachungsind“, „reibungslosenAblauf“, „vorrausschauender“, „Angebot zum Komplettausbildung“, Placeholder „Your Position“/„Message“) | beobachtet |
| B10 | WhatsApp-Link `wa.me/1621991444` ohne Ländervorwahl → funktioniert nicht zuverlässig | abgeleitet |
| B11 | PHP 8.0 EOL; 27 JS-Dateien / 68 CSS-Requests für eine statische Broschüren-Seite | beobachtet |
| B12 | Öffentliche REST-Namespaces `mcp`, `elementor-mcp-composer`, `ai1wm` erreichbar (Angriffsfläche, verschwindet mit Ablösung) | beobachtet |
| B13 | Home-Text „neues Unternehmen“ vs. Über-uns „etabliertes Unternehmen“ – inkonsistent | beobachtet |

## 6. Was eine React-Ablösung leisten muss (Ableitung)

Die Site ist eine **statische Broschüren-Site mit 2 Formularen**. Kein Login, kein Shop, kein Blog.
Dynamisch sind nur: Stellenanzeigen (gelegentlich gepflegt) und Formular-Versand inkl. Datei-Upload.
→ Statisch generierte React-Site + ein kleiner Formular-Endpoint reicht.

## 7. URL-Erhalt (für Redirects)

Alle 12 Routen oben müssen erreichbar bleiben oder per 301 umgeleitet werden. Zusätzlich Yoast-Sitemaps (`/sitemap_index.xml`, `/page-sitemap.xml`) und `/wp-sitemap.xml`.
