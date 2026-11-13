# MVP-Umfang

Stand: 2026-11-13. Status: **freigegeben** (M1–M6, M3 geändert; M7, M8 und Bereich Privat zurückgestellt, Abschnitt 7). Grundlage: VISION.md, Frontend V1, AP0-Plan (Schritt 1 in Abschnitt 3).

**Priorität 1: Das Produkt funktional bekommen** (Elias, 2026-11-13).

## 1. Ziel des MVP

Ein kleiner Unternehmer erledigt seine laufende Buchhaltung eines Monats komplett in der App: Belege erfassen, Einnahmen und Ausgaben buchen, Rechnungen schreiben, Zahlungen zuordnen und am Ende sehen, wo er steht. Die App zeigt ihm nur, was eine Entscheidung braucht („Zu prüfen“).

Messbar: Ein Testnutzer bildet einen echten Monat ab, ohne außerhalb der App etwas nachzutragen, und gibt den Export an seinen Steuerberater.

## 2. Zielgruppe im MVP

Vorschlag: **Einzelunternehmer und Freiberufler mit Einnahmen-Überschuss-Rechnung (EÜR)**, mit oder ohne Kleinunternehmerregelung, bis etwa 10 Mitarbeitende. Bilanzierende Firmen, Lohn und größere Teams folgen später (siehe M1).

Begründung: Die EÜR ist fachlich deutlich kleiner als die Bilanz (keine doppelte Buchführung nach außen, kein Jahresabschluss), und diese Gruppe hat den größten Schmerz bei wenig Budget.

## 3. Funktionen

Die Bereiche entsprechen der Navigation aus Frontend V1.

| Bereich | Im MVP | Später |
|---|---|---|
| **Zu prüfen** | Liste offener Vorgänge aus allen Bereichen: Beleg ohne Buchung, Buchung ohne Beleg, Zahlung ohne Zuordnung, Rechnungsentwurf, überfällige Rechnung. Jeder Vorgang hat genau eine nächste Aktion | Vorschläge aus Regeln („gleicher Händler wie letzten Monat“) |
| **Belege & Ausgaben** | Beleg per Foto oder Dateiimport einfügen, **Tags** zur eindeutigen Einordnung, Betrag, Datum und Steuersatz von Hand erfassen, Ausgabe buchen, Beleg an Buchung hängen, Storno statt Löschen | Texterkennung (OCR), E-Mail-Postfach für Belege, wiederkehrende Ausgaben |
| **Privat und Business** | – (zurückgestellt) | Für Einzelunternehmer getrennte Bereiche „Privat“ und „Business“ |
| **Einnahmen** | Einnahme buchen (mit oder ohne Rechnung aus der App) | – |
| **Rechnungen** | Kunden anlegen, Rechnung mit Positionen, fortlaufender Nummernkreis, Pflichtangaben, PDF, Status (Entwurf, offen, bezahlt, storniert), Rechnungskorrektur statt Ändern, Zahlung erzeugt Einnahme | E-Rechnung ausstellen (siehe M5), Angebote, Mahnungen, Versand aus der App |
| **Bank** | Kontoauszug als CSV importieren, Umsätze Buchungen und Rechnungen zuordnen | Direkte Bankanbindung (siehe M4) |
| **Überblick** | Einnahmen, Ausgaben und Ergebnis des Monats und Jahres, offene Rechnungen, Anzahl offener Vorgänge | Liquiditätsvorschau |
| **Auswertungen** | EÜR-Übersicht nach Kategorien, Umsatzsteuer-Übersicht je Zeitraum (als Hilfe für die Voranmeldung), Export für den Steuerberater (siehe M6) | Direkte Übermittlung an ELSTER (siehe M7) |
| **Zugänge & Rechte** | Login (Zitadel), Rollen Kundenadmin und User, Audit lesend für Kundenadmin (E9) | Feinere Rollen, Steuerberater-Zugang |
| **Einstellungen** | Firmendaten, Steuerstatus (Kleinunternehmer oder Regelbesteuerung), Kategorien, Nummernkreis | Mehrere Firmen je Nutzer |

## 4. Bewusst nicht im MVP

Bilanz und Jahresabschluss, Lohn, Anlagenverwaltung mit Abschreibung, Fremdwährungen, Lager, Kassenbuch für Bargeschäfte mit Kassensystem, eigene KI-Funktionen (Leitplanke aus der Vision).

## 5. Rechtliche Anforderungen und Pflichtschnittstellen

**Prüfstand 2026-11-13:** Recherche von ChatGPT anhand amtlicher Quellen (Gesetzestexte, BMF, ELSTER, DATEV), von Elias übergeben. Die Quellen sind unten verlinkt; ich habe sie nicht selbst geöffnet. Fachlich unterlegt heißt nicht, dass die spätere Umsetzung automatisch rechtskonform ist: Umsetzung, Sonderfälle und Schnittstellenversionen werden je Bereich vor der Freigabe geprüft. GoBD betrifft auch die betrieblichen Abläufe, nicht nur den Code.

| Thema | Ergebnis | Folge für die App | Betrifft |
|---|---|---|---|
| **GoBD** (BMF 28.11.2019, geändert 11.03.2024 und 14.07.2025) | Nachvollziehbarkeit, Vollständigkeit, Richtigkeit, zeitgerechte Erfassung, Ordnung, Unveränderbarkeit, Verfahrensdokumentation, Datenzugriff bei Prüfung. Keine bestimmte Technik vorgeschrieben | Kein CRUD: Änderungsprotokoll, Korrektur nur nachvollziehbar (Storno), Erfassungs- und Buchungszeitpunkt speichern, Beleg eindeutig zugeordnet, Verfahrensdokumentation führen | alle Buchungen, Belege, Audit |
| **Rechnungspflichtangaben** (§ 14 Abs. 4 UStG, § 14a UStG, § 33 UStDV) | 10 Pflichtangaben (u. a. Name und Anschrift beider Seiten, Steuernummer oder USt-IdNr., Datum, fortlaufende einmalige Nummer, Leistung und Leistungszeitpunkt, Entgelt nach Steuersätzen, Steuersatz und -betrag oder Befreiungshinweis). Weniger Angaben bei Kleinbetragsrechnungen bis 250 € brutto, Sonderregeln für Kleinunternehmer | Pflichtfelder regelbasiert **je Rechnungstyp** prüfen, nicht eine Regel für alle | Rechnungen |
| **E-Rechnung** (§ 14 UStG, § 27 Abs. 38 UStG, BMF 15.10.2025) | Empfang seit 01.01.2025 Pflicht. Ausstellen: Übergang bis 31.12.2026, bis 31.12.2027 bei höchstens 800.000 € Vorjahresumsatz, ab 01.01.2028 grundsätzlich Pflicht im inländischen B2B. Eine PDF ist keine E-Rechnung. Formate: XRechnung und ZUGFeRD ab EN 16931. Ausnahmen u. a. Kleinbetragsrechnungen und Rechnungen von Kleinunternehmern | Importieren, anzeigen, gegen Format- und Geschäftsregeln validieren, **strukturierte Originaldaten unverändert aufbewahren**. Technisch gültig heißt nicht steuerlich korrekt | Belege (Empfang), Rechnungen (Ausstellen) |
| **Umsatzsteuer-Voranmeldung** (§ 18 UStG) | Monatlich bei mehr als 9.000 € Vorjahressteuer, vierteljährlich bei mehr als 2.000 €, darunter Befreiung möglich. Abgabe am 10. Tag nach Zeitraumende, Dauerfristverlängerung plus 1 Monat. Übermittlung über ELSTER/ERiC (kostenlos, Entwicklerregistrierung nötig) | Zurückgestellt (M7). Später: Kennzahlen je Jahresversion, Fristen, Validierung, Übermittlungsprotokoll | Auswertungen |
| **DATEV-Export** | Keine gesetzliche Pflicht. Buchungsstapel als CSV, Präfix `EXTF_`, Semikolon, CR/LF, Dezimalkomma, Header + Feldüberschriften + Daten in fester Reihenfolge. Felder u. a. Konto, Gegenkonto, Soll/Haben, Betrag, Belegdatum, Buchungstext, Steuerschlüssel. Ein DATEV-Export ist kein vollständiger GoBD-Export für die Außenprüfung | MVP: Dateiexport nach offizieller Feldspezifikation. Später: DATEV-Buchungsdatenservice (vertragliche Voraussetzungen) | Auswertungen |
| **Aufbewahrung** (§ 147 AO, § 14b UStG) | Bücher, Inventare, Abschlüsse 10 Jahre; Rechnungen und Buchungsbelege 8 Jahre; Geschäftsbriefe und sonstige Unterlagen 6 Jahre. Beginn am Ende des Kalenderjahres; laufende Verfahren können verlängern. Bei E-Rechnungen genügt der strukturierte Teil; bei ZUGFeRD zusätzlich das PDF, wenn es weitere steuerlich relevante Angaben enthält | Dokumenttyp und Fristbeginn je Dokument speichern. Löschjob beachtet Fristen und Aufbewahrungshindernisse. Keine Formatumwandlung, die strukturierte Daten verliert | Belegspeicher, Löschjob |

**Quellen** (aus der Recherche übernommen):
- § 14 UStG: https://www.gesetze-im-internet.de/ustg_1980/__14.html
- § 14b UStG: https://www.gesetze-im-internet.de/ustg_1980/__14b.html
- § 18 UStG: https://www.gesetze-im-internet.de/ustg_1980/__18.html
- § 147 AO: https://www.gesetze-im-internet.de/ao_1977/__147.html
- ELSTER/ERiC für Softwarehersteller: https://www.elster.de/elsterweb/infoseite/entwickler
- DATEV-Format: https://developer.datev.de/de/file-formats/details/datev-format
- BMF, UStVA-Vordrucke 2026: https://www.bundesfinanzministerium.de/Content/DE/Downloads/BMF_Schreiben/Steuerarten/Umsatzsteuer/2025-12-29-vordruckmuster-USt-voranmeldung-2026.html
- GoBD (BMF): in der Recherche ohne vollständigen Link, vor P2 nachtragen

## 6. Datenmodell (grob)

Jede Tabelle hat `tenant_id` und unterliegt Row Level Security (AP0, 4.3). Nichts wird gelöscht, nur storniert.

- **Firma** (Mandant): Name, Anschrift, Steuernummer bzw. USt-IdNr., Steuerstatus
- **Benutzer**: Verweis auf Zitadel, Rolle
- **Beleg**: Datei (im Belegspeicher, verschlüsselt, Original unverändert), Hash, Quelle (Foto, Datei), Dokumenttyp, Fristbeginn, Eingang, Status, Tags
- **Tag**: Name, je Firma
- **Buchung**: Art (Einnahme, Ausgabe), Belegdatum, Erfassungszeitpunkt, Netto, Steuersatz, Steuer, Brutto, Tags, Beleg, Rechnung, Storno-Verweis
- **Kunde**: Name, Anschrift, USt-IdNr.
- **Rechnung** mit **Positionen**: Nummer, Datum, Leistungszeitraum, Status, Korrektur-Verweis
- **Bankumsatz**: Datum, Betrag, Verwendungszweck, Gegenkonto, Zuordnung
- **Vorgang** („Zu prüfen“): Typ, Bezug, Status
- **Audit**: wer, wann, was, vorher, nachher (nur INSERT)

## 7. Entscheidungen

Entschieden am 2026-11-13.

| # | Frage | Entscheidung |
|---|---|---|
| **M1** | Zielgruppe im MVP | **Freigegeben:** EÜR-Unternehmer bis etwa 10 Mitarbeitende (Abschnitt 2) |
| **M2** | Plattform im MVP | **Freigegeben:** Web zuerst, iOS über Capacitor, sobald der Login in der WebView steht (R9) |
| **M3** | Belegerfassung im MVP | **Geändert:** Belege per Foto oder Dateiimport, **Tags** zur eindeutigen Einordnung. Texterkennung (OCR) ist nicht Teil des MVP. Getrennte Bereiche **Privat** und **Business** für Einzelunternehmer sind **zurückgestellt** |
| **M4** | Bankdaten im MVP | **Freigegeben:** CSV-Import. Direkte Anbindung später |
| **M5** | E-Rechnung | **Freigegeben:** Im MVP empfangen, validieren, anzeigen und strukturiert aufbewahren; Ausstellen direkt danach (Pflicht ab 2027/2028, Abschnitt 5) |
| **M6** | Export für Steuerberater | **Freigegeben:** DATEV-Buchungsstapel plus Belege als ZIP |
| **M7** | Umsatzsteuer-Voranmeldung | **Zurückgestellt**, keine Priorität im MVP |
| **M8** | Kategorien | **Zurückgestellt**, keine Priorität im MVP. Einordnung im MVP über Tags (M3) |

**Offene Punkte aus den Entscheidungen:**
- **Privat und Business (zurückgestellt):** Bei Wiederaufnahme klären, ob (a) private Belege nur getrennt abgelegt, (b) Privatentnahmen und -einlagen gebucht oder (c) ein privates Haushaltsbuch geführt wird.
- **DATEV-Export braucht Konten:** Der Buchungsstapel verlangt Konto und Gegenkonto (Kontenrahmen SKR03 oder SKR04) und Steuerschlüssel. Tags allein reichen dafür nicht. Spätestens vor P8 muss feststehen, wie Buchungen einem Konto zugeordnet werden; das berührt M8.

## 8. Umsetzungsreihenfolge

Jeder Schritt ist durchgängig (UI, API, DB, Tests) und endet mit einer Abnahme.

| # | Schritt | Abnahme |
|---|---|---|
| P1 | Firma anlegen, Einstellungen, Login | Zwei Testfirmen sehen nur ihre eigenen Daten |
| P2 | GoBD-Grundlage für Buchungen und Belege spezifizieren und umsetzen (Protokoll, Storno, Zeitpunkte, Originalerhalt, Dokumenttyp und Frist); Ausgabe mit Beleg (Foto oder Datei) und Tags buchen, stornieren | Beleg und Buchung gespeichert, Original unverändert (Hash), Storno im Audit, kein Löschen möglich. Erster Teil der Verfahrensdokumentation |
| P3 | Einnahme buchen | wie P2 |
| P4 | Überblick | Summen stimmen mit den Testbuchungen überein |
| P5 | Kunden und Rechnungen, PDF, Nummernkreis, bezahlt markieren | Nummern lückenlos, Pflichtangaben vorhanden, Zahlung erzeugt Einnahme |
| P6 | „Zu prüfen“ aus echten Daten | Jeder offene Fall aus P2–P5 erscheint genau einmal |
| P7 | Bank-CSV-Import und Zuordnung | Testauszug importiert, Zuordnung erzeugt bzw. verknüpft Buchung |
| P8 | DATEV-Export (Buchungsstapel + Belege als ZIP) | Datei entspricht der DATEV-Feldspezifikation und lässt sich einlesen. Voraussetzung: Kontenzuordnung geklärt (Abschnitt 7) |
| P9 | E-Rechnung empfangen | Beispiel-XRechnung und -ZUGFeRD werden gelesen, validiert und das strukturierte Original bleibt unverändert |

EÜR- und USt-Übersicht entfallen im MVP (M7, M8 zurückgestellt).

Vor P2 stehen die technischen Schritte 2–6 aus dem AP0-Plan (Backend-Grundgerüst, lokale Umgebung, Login, Autorisierung, Datenbank). P1 fällt mit Login und Autorisierung zusammen.
