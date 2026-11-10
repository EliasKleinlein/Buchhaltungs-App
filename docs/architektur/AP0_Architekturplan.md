# AP 0: Bestandsaufnahme und Architekturplan

Stand: 2026-11-04, ergänzt am 2026-11-08 und 2026-11-09. Status: **Entwurf, Entscheidungen getroffen** (E1–E11, E8 zurückgestellt, siehe Abschnitt 4.1). Es wurde nichts implementiert und kein Cluster verändert.

Dieses Dokument ist die Grundlage für die Arbeitspakete (AP) 1 bis 6:

| AP | Inhalt |
|---|---|
| AP 1 | Login und Sitzungen (Identity-Provider, MFA, Passwort-Reset) |
| AP 2 | Zentrale Autorisierung (Mandantenprüfung, Rollen, Rechte-Matrix) |
| AP 3 | Mandanten in Kubernetes (Namespace, Netzwerkregeln, Provisionierung) |
| AP 4 | Datenbank und Belegspeicher (inkl. Audit, Backups, Wiederherstellung) |
| AP 5 | Admin-Oberfläche und Supportzugriff |
| AP 6 | Sicherheitstests gegen zwei Testmandanten |

Alle als „Empfehlung“ markierten Punkte brauchen deine Entscheidung (Abschnitt 4).

---

## 1. Bestandsaufnahme

### 1.1 Projekt (geprüft am 2026-11-04)

| Bereich | Vorhanden | Befund |
|---|---|---|
| Frontend | ja | React 19 + TypeScript 7, Vite 8, eine globale CSS-Datei, Zustand im Hook `useDemoState`, nur Demodaten (`src/data/demo.ts`) |
| iOS | ja | Capacitor 8.6 (Swift Package Manager), nie in Xcode gebaut, App-ID ist ein Platzhalter |
| Backend | **nein** | kein Server-Code vorhanden |
| Datenbank | **nein** | keine DB, keine Migrationen |
| Login / Session | **nein** | keine Authentifizierung, keine Rollen, kein Routing nach Rolle |
| Docker / Kubernetes | **nein** | keine Dockerfiles, keine Manifeste, keine Helm-Charts |
| Tests | **nein** | keine Testdateien, kein Testframework; Iteration 1 wurde nur manuell mit Playwright geprüft |
| Sicherheitsmechanismen | teilweise | strenge `.gitignore` für Geheimnisse und Daten, sonst nichts (das Frontend hat keine Angriffsfläche, weil es keine Daten verarbeitet) |
| CI/CD | **nein** | keine GitHub Actions |

**Folge:** Es gibt keinen Bestand, der Architekturentscheidungen vorgibt oder an den man sich anpassen müsste. Das Frontend bleibt unverändert und bekommt später nur eine API-Anbindung.

### 1.2 Entwicklungsrechner und Server: Tiny-PC (geprüft am 2026-11-09/10)

Seit 2026-11-09 wird auf dem Tiny-PC entwickelt. Er ist zugleich Stufe 2 (E7). Die frühere Erfassung des MacBooks ist überholt.

| Werkzeug | Status |
|---|---|
| Windows 11 Pro, AMD Ryzen 7 5825U (x64), 8 Kerne / 16 Threads, 31,4 GB RAM | ausreichend für einen lokalen Cluster |
| Festplatte | 476 GB, davon 390 GB frei |
| WSL2 mit Ubuntu 24.04 | vorhanden |
| Docker Desktop (mit `kubectl`) | vorhanden, läuft |
| Node.js 26.13 (LTS), npm 11.20 | installiert am 2026-11-10 |
| .NET SDK 10.0.403 | installiert am 2026-11-10 |
| Podman, kind, k3d, Helm | fehlen |
| PostgreSQL-Client | fehlt |
| Xcode | nicht möglich (nur macOS); iOS-Build später auf einem Mac |

**Folge:** Für den lokalen Cluster reicht Docker Desktop als Grundlage für k3d; Podman wird nicht gebraucht. `k3d` und `helm` müssen noch installiert werden. Eine grobe Schätzung (nicht gemessen): etwa 1 GB RAM je Mandant (Silo mit Backend, Postgres, Zitadel) plus 3–4 GB Plattform. Die echten Werte werden in Schritt 7 gemessen.

### 1.3 Bestehende Vorgaben aus der Vision

- Zielgruppe: Einzelunternehmer bis 500 Mitarbeitende.
- Preis: maximal 50 € pro Monat.
- Plattformen: Web und iOS mit denselben Funktionen.
- Hosting: zuerst lokal, dann Raspberry Pi 3, dann Cloud oder Server.

Zwei dieser Vorgaben stehen in Spannung zu „Namespace pro Mandant“. Siehe Risiken R1 und R2.

---

## 2. Architekturvorschlag

### 2.1 Grundidee

- **Eine** Kubernetes-Distribution auf allen Stufen: k3s (lokal per k3d, dann Pi, dann Server). Damit verhalten sich Manifeste, NetworkPolicies und Pod Security auf allen Stufen gleich. k3s bringt einen NetworkPolicy-Controller mit.
- **Gemeinsame Plattform-Namespaces** für Dinge, die es nur einmal gibt: Ingress, Identity-Provider, Datenbank-Cluster, Objektspeicher, Plattform-Admin.
- **Ein Namespace pro Unternehmen** mit eigener Backend-Instanz, eigenen Zugangsdaten und Default-Deny-Netzwerk.
- **Doppelte Mandantenprüfung:** Kubernetes trennt die Netzwerke, und das Backend prüft zusätzlich bei jeder Anfrage, dass die Mandanten-ID im Token gleich der Mandanten-ID seiner Instanz ist. Fällt eine Schicht aus, hält die andere.

### 2.2 Architekturdiagramm

```text
                         Internet / lokales Netz
                                   │ TLS (cert-manager)
                   ┌───────────────┴────────────────┐
                   │  ns: ingress  (Traefik, k3s)   │
                   └──┬──────────┬───────────┬──────┘
          app.<domain>│  auth.<domain>   admin.<domain>  (eigener Host, MFA Pflicht)
                      │          │           │
   ┌──────────────────┘          │           └──────────────────────┐
   │ Routing nach Subdomain       ▼                                  ▼
   │ firma-a.app.<domain>  ┌──────────────────┐        ┌───────────────────────────┐
   │ firma-b.app.<domain>  │ ns: identity     │        │ ns: platform              │
   │                       │ Identity-Provider│◄──OIDC─┤ admin-api (global)        │
   │                       │ (Keycloak)       │        │ provisioner (eng. RBAC)   │
   │                       └──────────────────┘        │ audit-viewer              │
   │                              ▲  OIDC              └─────┬──────────┬──────────┘
   ▼                              │                          │ legt an  │ liest Audit
┌──────────────────────────┐ ┌──────────────────────────┐    ▼          │
│ ns: tenant-firma-a       │ │ ns: tenant-firma-b       │  Namespaces,  │
│  backend (TENANT_ID=a)   │ │  backend (TENANT_ID=b)   │  DB, Bucket,  │
│  Secret: DB-Login a      │ │  Secret: DB-Login b      │  Secrets      │
│  NetworkPolicy: deny all │ │  NetworkPolicy: deny all │               │
│  + erlaubt: ingress→be,  │ │  + erlaubt: ingress→be,  │               │
│    be→data, be→storage,  │ │    be→data, be→storage,  │               │
│    be→identity (JWKS)    │ │    be→identity (JWKS)    │               │
│  ResourceQuota/LimitRange│ │  ResourceQuota/LimitRange│               │
│  PSS: restricted         │ │  PSS: restricted         │               │
└────────┬─────────────┬───┘ └────────┬─────────────┬───┘               │
         │ TLS 5432    │ TLS S3        │             │                   │
         ▼             ▼               ▼             ▼                   ▼
┌───────────────────────────┐  ┌───────────────────────────────────────────┐
│ ns: data                  │  │ ns: storage                               │
│ PostgreSQL (CloudNativePG)│  │ S3-kompatibler Speicher                   │
│  DB tenant_a / Rolle a    │  │  Bucket tenant-a (eigener Schlüssel)      │
│  DB tenant_b / Rolle b    │  │  Bucket tenant-b (eigener Schlüssel)      │
│  DB platform  / audit     │  │  Bucket audit (Object Lock / WORM)        │
│  Backups → Bucket backup  │  │  Bucket backup                            │
└───────────────────────────┘  └───────────────────────────────────────────┘
```

### 2.3 Komponenten

| Komponente | Empfehlung | Warum |
|---|---|---|
| Backend | **ASP.NET Core (.NET 10, LTS)**, EF Core, Npgsql | Passt zu deinem C#-Lernpfad, SDK ist installiert, eingebaute Policy-basierte Autorisierung, langer Support |
| Datenbank | **PostgreSQL** mit dem Operator **CloudNativePG** | TLS, Backups und Wiederherstellung (Point-in-Time) sind eingebaut, läuft auf arm64 |
| Identity-Provider | **Zitadel**, eine Instanz je Mandant (entschieden, E4) | Login, Passwort-Reset, MFA, Brute-Force-Schutz und Einladungen sind fertig und geprüft. Eine eigene Loginverwaltung wäre das größte Sicherheitsrisiko des Projekts |
| Objektspeicher (Belege) | S3-kompatibel, Produkt offen (siehe E6) | Bucket pro Mandant, Object Lock für Aufbewahrung |
| Ingress / TLS | Traefik (in k3s enthalten) + cert-manager | Keine zusätzliche Software nötig |
| Secrets | Sealed Secrets oder SOPS (Git), Zugangsdaten von CloudNativePG erzeugt | Nichts Geheimes im öffentlichen Repo |
| Provisionierung | Helm-Chart `tenant` + `provisioner`-Dienst mit eng begrenztem ServiceAccount | Ein Weg, um Mandanten anzulegen, protokolliert und wiederholbar |

### 2.4 Datenflüsse

**A) Login (Web)**
1. Browser öffnet `firma-a.app.<domain>`.
2. Das Backend leitet zum Identity-Provider weiter (OIDC Authorization Code + PKCE).
3. Nach Login und gegebenenfalls MFA bekommt das Backend die Tokens. Der Browser erhält nur ein `HttpOnly`-, `Secure`-, `SameSite=Strict`-Session-Cookie (Muster „Backend for Frontend“). Im Browser liegen keine Tokens, also kann ein XSS-Angriff sie nicht stehlen.

**B) Login (iOS)**
1. Die App öffnet den Login im System-Browser (`ASWebAuthenticationSession`), nicht in der WebView.
2. Authorization Code + PKCE, Tokens im iOS-Schlüsselbund.
3. API-Aufrufe mit `Authorization: Bearer`. Das Backend akzeptiert beide Wege mit derselben Prüfung.

**C) Geschützter API-Aufruf**
1. Token beziehungsweise Session prüfen: Signatur, Ablauf, Aussteller, Zielgruppe.
2. Mandanten-ID nur aus dem Token lesen, **nie** aus URL, Body oder Header des Clients.
3. Token-Mandant gleich `TENANT_ID` der Instanz? Sonst `403` und ein Audit-Eintrag.
4. Rolle gegen die Policy der Operation prüfen (Deny by Default: ohne Policy kein Zugriff).
5. Datenzugriff über die DB-Rolle des Mandanten, die nur die eigene Datenbank erreicht.
6. Schreibende und löschende Operationen erzeugen einen Audit-Eintrag in derselben Transaktion.

**D) Löschen**
- Festgeschriebene Buchungen und aufbewahrungspflichtige Belege werden **nie** physisch gelöscht. Stattdessen gibt es Storno oder Sperrung mit Begründung und Audit-Eintrag.
- Physisch löschbar sind nur Entwürfe und nicht aufbewahrungspflichtige Daten, und nur durch den Kundenadmin.
- Nach Ablauf der Aufbewahrungsfrist löscht ein Job, der selbst protokolliert wird.

**E) Mandant anlegen (nur Plattform-Admin)**
1. Der Admin legt das Unternehmen in der Admin-Oberfläche an. Die admin-api prüft Rolle und MFA und schreibt einen Audit-Eintrag.
2. Der provisioner legt Namespace, Datenbank, DB-Rolle, Bucket, Secrets und Policies über das Helm-Chart `tenant` an.
3. Der Identity-Provider legt die Organisation an und lädt den Kundenadmin ein.
4. Ein Abnahmetest prüft automatisch die Isolation des neuen Mandanten.

### 2.5 Rollen (Anwendung, nicht Kubernetes)

| Operation | Admin (Plattform) | Kundenadmin | Benutzer |
|---|---|---|---|
| Daten lesen (eigenes Unternehmen) | nur über protokollierten Supportzugriff | ja | ja |
| Daten erstellen / bearbeiten | nur Supportzugriff | ja | ja |
| Zulässige Daten löschen | nein (nur Fristablauf-Job) | ja | **nein** |
| Unternehmensdaten verwalten | ja | ja | nein |
| Weitere Benutzer verwalten | ja | **nicht freigegeben** | nein |
| Mandanten anlegen / sperren | ja | nein | nein |
| Audit-Protokolle einsehen | alle | eigenes Unternehmen, nur lesend (E9) | nein |
| Kubernetes-Zugriff | **nein** (getrennter Betreiberzugang) | nein | nein |

Die Rollen liegen im Identity-Provider als Claims (`tenant_id`, `roles`). Kubernetes-RBAC regelt nur, was Dienste (ServiceAccounts) und Betreiber im Cluster dürfen.

### 2.6 Vorgeschlagene Dateistruktur

```text
Buchhaltungs-App/
├── frontend/                       # unverändert (Design bleibt), später API-Client
├── backend/
│   ├── Nori.sln
│   ├── src/
│   │   ├── Nori.Api/               # Endpunkte, Auth, Policies, BFF
│   │   ├── Nori.Domain/            # Buchhaltungslogik, Regeln, keine Technik
│   │   ├── Nori.Infrastructure/    # EF Core, Postgres, S3, Audit
│   │   └── Nori.Platform/          # admin-api + provisioner (eigener Dienst)
│   └── tests/
│       ├── Nori.Domain.Tests/      # Unit-Tests
│       ├── Nori.Api.Tests/         # Rechte-Matrix (Positiv/Negativ), IDOR
│       └── Nori.Integration.Tests/ # Testcontainers: Postgres + Keycloak
├── deploy/
│   ├── charts/
│   │   ├── platform/               # ingress, identity, data, storage, platform
│   │   └── tenant/                 # Namespace, Quota, NetworkPolicy, PSS, Backend
│   ├── environments/
│   │   ├── local/                  # k3d-Konfiguration, Werte für lokal
│   │   ├── pi/                     # (falls freigegeben)
│   │   └── cloud/
│   └── policies/                   # Default-Deny, Pod Security, LimitRanges
├── security-tests/
│   ├── isolation/                  # Netzwerktests Mandant A ↔ B
│   ├── api/                        # Eskalations- und Mandantentests gegen laufendes System
│   └── scans/                      # Trivy-, Kubescape-, ZAP-Konfiguration
└── docs/
    └── architektur/                # dieses Dokument, Ergebnisse je AP
```

---

## 3. Implementierungsreihenfolge

Jeder Schritt endet mit Testausgaben und wartet auf deine Abnahme.

| # | Schritt | AP | Abhängig von |
|---|---|---|---|
| 1 | Werkzeuge installieren, lokalen k3d-Cluster mit Podman starten | Vorbereitung | Freigabe E1, E3 |
| 2 | Backend-Grundgerüst (.NET 10), Health-Endpunkt, Testprojekte, CI mit Build und Tests | Vorbereitung | E2 |
| 3 | Identity-Provider lokal, Realm/Organisation, Login, Logout, Reset, MFA für Admin, BFF-Session, Brute-Force-Schutz | AP 1 | E4, E5 |
| 4 | Zentrale Autorisierung: Mandanten-Middleware, Policies je Operation, Rechte-Matrix als Tests | AP 2 | 3 |
| 5 | Datenbank: CloudNativePG, DB und Rolle je Mandant, TLS, Migrationen, Audit-Tabelle (nur INSERT), Storno statt Löschen | AP 4 (Teil 1) | E3 |
| 6 | Helm-Chart `tenant`: Namespace, PSS restricted, Quota, LimitRange, Default-Deny, gezielte Freigaben, ServiceAccount ohne Token-Mount | AP 3 | 1 |
| 7 | provisioner mit eng begrenzter ClusterRole, zwei Testmandanten anlegen, Isolationstests | AP 3 | 6 |
| 8 | Belegspeicher (Bucket je Mandant), Backups, **getestete** Wiederherstellung | AP 4 (Teil 2) | E6 |
| 9 | Admin-Oberfläche (eigener Host), Mandantenübersicht, Supportzugriff mit Begründung und Zeitlimit, Audit-Ansicht | AP 5 | 4, 7 |
| 10 | Sicherheitstests komplett gegen zwei Testmandanten, Bericht mit Ausgaben | AP 6 | alle |

Hinweis: Die Reihenfolge weicht leicht von der AP-Nummerierung ab. Datenbank (AP 4) kommt vor Kubernetes-Mandanten (AP 3), weil Autorisierungstests eine Datenbank brauchen. Die Abnahme bleibt je AP getrennt.

---

## 4. Entscheidungsbedarf

| # | Frage | Optionen | Empfehlung und Begründung |
|---|---|---|---|
| **E1** | Mandantenmodell in Kubernetes | **(a)** Namespace + eigene Backend-Instanz + eigene DB-Instanz je Mandant („Silo“) · **(b)** Namespace + eigene Backend-Instanz je Mandant, gemeinsamer Postgres-Cluster mit **eigener Datenbank und Rolle** je Mandant · **(c)** gemeinsames Backend für alle, Trennung nur in DB und Code | **(b).** Erfüllt „Namespace je Unternehmen“ und trennt Daten auf DB-Ebene. Kostet etwa 150–250 MB RAM pro Mandant statt etwa 400–600 MB bei (a). (c) widerspricht deiner Vorgabe. Optional später: (a) als Premium-Stufe für große Kunden |
| **E2** | Backend-Sprache | C#/.NET 10 · Node/TypeScript · andere | **C#/.NET 10:** Lernpfad, starke Typisierung, eingebaute Autorisierung, Support bis 2028 |
| **E3** | Datenbank-Isolation | DB je Mandant (in gemeinsamem Cluster) · Schema je Mandant · Zeilen mit `tenant_id` + Row Level Security · Cluster je Mandant | **DB je Mandant.** Eine eigene DB-Rolle kann technisch keine fremde DB lesen. Backup und Wiederherstellung sowie Löschung nach Kündigung sind je Mandant einfach |
| **E4** | Login-Verwaltung | Externer Identity-Provider (Keycloak / Zitadel) · eigene Loginverwaltung | **Keycloak.** MFA, Brute-Force-Schutz, Reset, Einladungen und Organisationen sind fertig, verbreitet und gut dokumentiert. Nachteil: braucht etwa 0,7–1 GB RAM. Zitadel ist sparsamer, aber weniger verbreitet. Eine eigene Lösung rate ich ab |
| **E5** | Mandant im Login erkennen | Subdomain je Mandant (`firma-a.app…`) · ein Host, Mandant nur aus Token | **Subdomain**, weil sie sauber auf die Namespace-Instanz routet. Der Token wird trotzdem geprüft |
| **E6** | Belegspeicher | Selbst betrieben (z. B. Garage, SeaweedFS, MinIO) · Cloud-S3 eines EU-Anbieters | Lokal selbst betrieben, in der Cloud ein EU-Anbieter mit Object Lock. **Vor der Wahl prüfen:** Lizenz und Pflegestatus von MinIO haben sich 2025 geändert |
| **E7** | Raspberry Pi 3 als Stufe 2 | beibehalten · durch Pi 5 (8 GB) oder Mini-PC ersetzen · überspringen | **Ersetzen oder überspringen.** Ein Pi 3 hat 1 GB RAM. k3s, Postgres und Keycloak zusammen brauchen deutlich mehr. Siehe R2 |
| **E8** | Cloud-Standort (später) | EU-Anbieter, Rechenzentrum in Deutschland · andere | **EU, Deutschland** wegen DSGVO und Erwartung der Zielgruppe |
| **E9** | Darf der Kundenadmin das Audit-Protokoll seines Unternehmens sehen? | ja / nein | Ja, nur lesend. Das schafft Vertrauen und ist kein Sicherheitsrisiko |
| **E10** | Supportzugriff des Admins auf Kundendaten | jederzeit · nur mit Zustimmung des Kundenadmins · nur mit Begründung und Zeitlimit | **Begründung + Zeitlimit + Audit**, optional Benachrichtigung des Kundenadmins |
| **E11** | Interner Verkehr zwischen Diensten | TLS nur zu DB, Speicher, IdP · überall mTLS (Service-Mesh) | **TLS zu DB, Speicher und IdP** reicht für den Start. Ein Service-Mesh bringt viel Komplexität bei wenig Gewinn, solange NetworkPolicies greifen |

### 4.1 Getroffene Entscheidungen (2026-11-08)

| # | Entscheidung | Folge für den Plan |
|---|---|---|
| **E1** | **(a) Silo:** Jede Firma bekommt ihre eigene Umgebung mit allem, was dazugehört (Namespace, Backend-Instanz, eigene Datenbank-Instanz) | Mehr RAM je Mandant (etwa 400–600 MB), Risiko R1 wird größer. Offen: ob Identity-Provider und Belegspeicher ebenfalls je Mandant getrennt werden oder gemeinsam bleiben |
| **E2** | **C# mit .NET 10** | wie in 2.3 vorgeschlagen |
| **E7** | **Raspberry Pi wird übersprungen.** Stufe 2 ist der bereits laufende Tiny-PC im Heimnetz, der als Server dient | `deploy/environments/pi/` entfällt und wird zu `deploy/environments/tiny/`. Risiko R2 entfällt. Hardware des Tiny-PCs (RAM, CPU) vor Schritt 1 erfassen |

### 4.2 Getroffene Entscheidungen (2026-11-09)

| # | Entscheidung | Folge für den Plan |
|---|---|---|
| **E3** | **Eigene Datenbank-Instanz je Mandant** (ergibt sich aus E1) | Isolation erledigt. Plattformdaten (Mandantenliste, Admin-Audit) liegen in einer eigenen Plattform-DB außerhalb der Mandanten |
| **E4** | **Zitadel, eine Instanz je Mandant.** Alles, was zu einer Firma gehört (Backend, Datenbank, Zitadel), wird als **ein Paket** ausgeliefert: das Helm-Chart `tenant` | Ersetzt Keycloak in 2.3 und im Diagramm 2.2; `ns: identity` wird durch Zitadel im Mandanten-Namespace ersetzt. Zitadel nutzt die Postgres-Instanz des Mandanten mit eigener DB und Rolle. Intern bleiben es getrennte Container (ein Prozess je Container, Pod Security `restricted`). Der Plattform-Admin bekommt eine **eigene, zentrale Zitadel-Instanz** in `ns: platform` |
| **E5** | **Subdomain je Mandant** (`firma-a.app.<domain>`), ergibt sich aus E4 | Das System muss die Firma vor dem Login kennen, um zur richtigen Zitadel-Instanz zu leiten. Der Token wird trotzdem gegen `TENANT_ID` geprüft |
| **E6** | **SeaweedFS (Apache-2.0), eine gemeinsame Instanz in `ns: storage`, ein Bucket je Mandant.** Vorgabe: „effizienter und trotzdem maximal sicher“ (2026-11-10) | Vier Schutzschichten statt eigener Instanz je Mandant: (1) eigener Bucket mit eigenem Zugangsschlüssel, der nur diesen Bucket erreicht; (2) **Verschlüsselung im Backend vor dem Hochladen** mit einem Schlüssel je Mandant, der nur im Namespace des Mandanten liegt. Selbst bei einem Fehler im Speicher sind fremde Belege unlesbar; (3) NetworkPolicy: nur das Backend des Mandanten erreicht den Speicher; (4) Object Lock im Modus Compliance für aufbewahrungspflichtige Belege. MinIO (archiviert, keine Sicherheitsupdates) und Garage (kein Object Lock) sind ausgeschlossen. Object Lock wird in AP 4 mit eigenem Test geprüft (T4.7), bevor wir uns darauf verlassen. Cloud (Stufe 3): später EU-Anbieter mit Object Lock oder dieselbe SeaweedFS-Lösung |
| **E8** | **Zurückgestellt.** Der Fokus liegt auf dem Produkt; Stufe 3 (Cloud) bleibt möglich | Wird entschieden, wenn Stufe 3 konkret wird. Bis dahin gilt die Empfehlung (EU, Rechenzentrum in Deutschland) als Richtung |
| **E9** | **Ja:** Der Kundenadmin sieht das Audit-Protokoll seines eigenen Unternehmens, nur lesend | Eigene Policy „Audit lesen (eigener Mandant)“ in AP 2, Ansicht in AP 5 |
| **E10** | **Supportzugriff nur mit Begründung und Zeitlimit**, jeder Zugriff im Audit, optional Benachrichtigung des Kundenadmins | Umsetzung in AP 5, Tests T5.1 und T5.2 |
| **E11** | **TLS zu Datenbank, Speicher und Identity-Provider**, kein Service-Mesh | Trennung innerhalb des Clusters über NetworkPolicies (AP 3) |

Alle Entscheidungen aus Abschnitt 4 sind getroffen (E8 zurückgestellt).

---

## 5. Risiken und Sicherheitskontrollen

### 5.1 Risiken

| # | Risiko | Auswirkung | Gegenmaßnahme |
|---|---|---|---|
| R1 | Namespace + Backend-Instanz je Mandant kostet RAM. Bei vielen kleinen Kunden mit maximal 50 € pro Monat steigen die Infrastrukturkosten linear | Preisziel gefährdet | E1 (b), knappe LimitRanges, später Skalierung auf null bei Inaktivität prüfen |
| R2 | Raspberry Pi 3 (1 GB RAM) reicht nicht für den Stack | Stufe 2 nicht umsetzbar | E7 |
| R3 | Der provisioner braucht Rechte zum Anlegen von Namespaces, ein lohnendes Angriffsziel | Übernahme des ganzen Clusters | Eigene ClusterRole nur für Namespaces mit Label `tenant`, keine Secrets anderer Namespaces lesen, nur aus der admin-api erreichbar, jede Aktion protokolliert |
| R4 | Einzige Person mit Betriebszugang (du) | Verlust des Zugangs = Verlust der Plattform | Notfallzugang dokumentiert und offline gesichert, MFA mit zwei Faktoren |
| R5 | GoBD-Unveränderbarkeit vs. DSGVO-Löschanspruch | Rechtsverstoß in eine Richtung | Sperren statt Löschen bis Fristende, dann protokollierter Löschjob. Fristen (8 bzw. 10 Jahre nach aktuellem Recht) vor AP 4 mit einer Fachquelle prüfen |
| R6 | Selbst gebaute Autorisierung hat Lücken (IDOR/BOLA) | Datenabfluss zwischen Mandanten | Mandanten-ID nur aus Token, zwei Schichten (Instanz und DB-Rolle), Rechte-Matrix als automatische Tests |
| R7 | Öffentliches Repo | Hinweise für Angreifer, versehentlich Secrets | Strenge `.gitignore`, Secret-Scan in CI (z. B. gitleaks), keine echten Domains oder IPs im Repo |
| R8 | Backups ohne Wiederherstellungsprobe | Datenverlust trotz Backup | Wiederherstellung ist Teil der Abnahme von AP 4 und wird regelmäßig geübt |
| R9 | Session in iOS-WebView und Web unterschiedlich | Zwei Wege mit zwei Fehlerquellen | Gemeinsame Prüflogik im Backend, beide Wege in den Tests |
| R10 | Lernkurve Kubernetes, Keycloak, .NET gleichzeitig | Langsamer Fortschritt, Fehlkonfiguration | Strikte Reihenfolge (Abschnitt 3), kleine Schritte, jede Policy mit Test |

### 5.2 Sicherheitskontrollen (Zuordnung zu den Grundsätzen)

| Grundsatz | Kontrolle |
|---|---|
| Least Privilege | ServiceAccount je Dienst ohne automatisch eingebundenes Token, DB-Rolle nur für eigene DB, Audit-Rolle nur INSERT, Admin ohne Kubernetes-Rechte |
| Deny by Default | NetworkPolicy deny-all (ein- und ausgehend) in jedem Namespace, Backend-Endpunkte ohne Policy = gesperrt (Fallback-Policy „authentifiziert + keine Rolle = nichts“) |
| Strikte Mandantentrennung | Namespace, eigene DB, eigener Bucket, `TENANT_ID`-Abgleich im Backend, Subdomain-Routing |
| Serverseitige Rechteprüfung | Policy-basierte Autorisierung in ASP.NET Core bei jeder Operation, Frontend blendet nur aus |
| Revisionssichere Protokollierung | Audit-Tabelle nur anhängend, Einträge per Hash verkettet, regelmäßiger Export in WORM-Bucket |
| Keine unprotokollierte Löschung | Löschen nur über einen Domänendienst, der zuerst den Audit-Eintrag schreibt (gleiche Transaktion); aufbewahrungspflichtige Daten technisch nur stornierbar |
| Container | Pod Security Standards `restricted`, nicht-root, schreibgeschütztes Dateisystem, Images mit fester Version, Trivy-Scan in CI |
| Secrets | Nie im Repo, verschlüsselt in Git (Sealed Secrets / SOPS), Rotation über CloudNativePG |
| Transport | TLS außen (cert-manager), TLS zu Postgres, Speicher und IdP |

---

## 6. Verifizierbare Abnahmetests

Jeder Test hat eine erwartete Ausgabe. „Bestanden“ gilt nur mit protokollierter Testausgabe.

| ID | AP | Test | Erwartetes Ergebnis |
|---|---|---|---|
| T1.1 | 1 | Login mit falschem Passwort 10× | Konto vorübergehend gesperrt, Ereignis protokolliert |
| T1.2 | 1 | Admin-Login ohne MFA | Zugriff auf `admin.<domain>` verweigert |
| T1.3 | 1 | Session-Cookie prüfen | `HttpOnly`, `Secure`, `SameSite=Strict`, Session-ID wechselt nach Login |
| T1.4 | 1 | Logout, dann alter Cookie / altes Token | `401` |
| T1.5 | 1 | Passwort-Reset-Link zweimal benutzen | Zweiter Versuch abgelehnt |
| T2.1 | 2 | Rechte-Matrix: jede Operation × jede Rolle | Nur die erlaubten Kombinationen liefern `2xx`, alle anderen `403` |
| T2.2 | 2 | Benutzer ruft Lösch-Endpunkt auf | `403`, Audit-Eintrag |
| T2.3 | 2 | Nutzer von A ändert Mandanten-ID in URL/Body/Header auf B | `403` oder `404`, keine Daten von B |
| T2.4 | 2 | Kundenadmin ruft globale Admin-Endpunkte auf | `403` |
| T2.5 | 2 | Endpunkt ohne Policy (absichtlich in Test eingebaut) | gesperrt (Deny by Default) |
| T3.1 | 3 | Test-Pod in `tenant-a` verbindet sich zu Backend in `tenant-b` | Zeitüberschreitung (blockiert) |
| T3.2 | 3 | Test-Pod in `tenant-a` verbindet sich ins Internet | blockiert (Egress deny) |
| T3.3 | 3 | Privilegierten oder Root-Pod in Mandanten-Namespace starten | von Pod Security abgelehnt |
| T3.4 | 3 | ServiceAccount von `tenant-a` liest Secrets in `tenant-b` | `forbidden` |
| T3.5 | 3 | Pod über ResourceQuota hinaus anlegen | abgelehnt |
| T4.1 | 4 | DB-Rolle von A verbindet sich zu DB von B | Verbindung abgelehnt |
| T4.2 | 4 | Zugangsdaten von A auf Bucket von B | `AccessDenied` |
| T4.3 | 4 | Verbindung zu Postgres ohne TLS | abgelehnt |
| T4.4 | 4 | Festgeschriebene Buchung löschen | nicht möglich, nur Storno, Audit-Eintrag vorhanden |
| T4.5 | 4 | Audit-Eintrag nachträglich ändern | DB verweigert; Hash-Kette würde Manipulation zeigen |
| T4.6 | 4 | Backup einspielen in leere Umgebung | Daten vollständig, Prüfsummen gleich |
| T4.7 | 4 | Beleg mit Object Lock (Compliance) vor Fristende löschen oder überschreiben, auch mit Admin-Schlüssel | abgelehnt, Beleg unverändert |
| T4.8 | 4 | Beleg von A direkt aus dem Speicher lesen (ohne Backend von A) | nur verschlüsselte Daten, nicht lesbar |
| T5.1 | 5 | Admin öffnet Kundenbereich ohne Begründung | verweigert |
| T5.2 | 5 | Admin öffnet Kundenbereich mit Begründung | erlaubt, zeitlich begrenzt, Audit-Eintrag mit Grund |
| T5.3 | 5 | Admin-Konto versucht `kubectl`-Aktion | kein Zugang |
| T6.x | 6 | Trivy (Images, Abhängigkeiten), Kubescape (Cluster), OWASP ZAP (API), gitleaks (Repo), alle T1–T5 gegen zwei Testmandanten | keine kritischen oder hohen Befunde offen |

---

## 7. Nächster Schritt

Wartet auf deine Freigabe von:
1. den Entscheidungen E1–E11 (Abschnitt 4),
2. der Dateistruktur (2.6),
3. der Reihenfolge (3).

Danach beginnt Schritt 1 (Werkzeuge und lokaler Cluster). Installationen auf deinem Rechner führe ich nur nach Bestätigung aus.
