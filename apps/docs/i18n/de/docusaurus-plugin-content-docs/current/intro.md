# Einführung in express-cargo

## Übersicht

express-cargo ist eine leichtgewichtige Middleware-Bibliothek,
die für die Entwicklung von Webanwendungen auf Basis des Express.js-Frameworks entwickelt wurde.
Diese Bibliothek nutzt das Decorator-Pattern, um klassenbasierte Anfragedatenbindung und Validierungsfunktionen bereitzustellen.
Sie ermöglicht die automatische Zuordnung verschiedener Datenformate, die über HTTP-Anfragen (Request) empfangen werden,
zu entwicklerdefinierten Klassen und erleichtert gleichzeitig die optimierte Validierung dieser Daten.

## Warum express-cargo?

Obwohl Express.js eine flexible Architektur bietet,
können bei der Verarbeitung von Anfragedaten Herausforderungen im Zusammenhang mit wiederkehrenden Aufgaben und der Wartung auftreten.
express-cargo adressiert diese Entwicklungsherausforderungen
und verbessert dadurch die Entwicklungseffizienz und die Robustheit des Codes.

### 1. Reduzierung von Boilerplate-Code

- **Herausforderungen beim herkömmlichen Ansatz**: In einer Express.js-Umgebung führt das Extrahieren von Daten aus `req.body`, `req.query`,
  `req.params`, `req.headers` und das wiederholte Implementieren von Typprüfungs- und Validierungslogik in jedem Route-Handler
  zu Code-Duplizierung und verringerter Produktivität.
- **Lösung von express-cargo**: express-cargo verwendet Decorators, um Datenextraktions- und Zuordnungslogik
  deklarativ innerhalb von Request-Klassen zu definieren. Entwickler können sich auf die Deklaration von Datenquellen konzentrieren, was den wiederholten Datenverarbeitungscode minimiert
  und dadurch die Produktivität verbessert.

### 2. Verbesserte Typsicherheit und Lesbarkeit

- **Herausforderungen beim herkömmlichen Ansatz**: In einer JavaScript-Umgebung ist die Typzuverlässigkeit von Anfragedaten gering,
  und selbst in einer TypeScript-Umgebung bergen manuelle Typzusicherungen das Risiko von Laufzeitfehlern. Darüber hinaus
  beeinträchtigt die Verflechtung von Datenverarbeitungslogik und Geschäftslogik oft die Lesbarkeit des Codes.
- **Lösung von express-cargo**: Durch die automatische Datenzuordnung und Typkonvertierung basierend auf den in
  Request-Klassen deklarierten Typen ermöglicht express-cargo die frühzeitige Erkennung von Typfehlern während der Kompilierung und stärkt die Laufzeitstabilität.
  Klar definierte DTO-Klassen stellen intuitiv die erwartete Eingabestruktur für eine API dar und verbessern die Lesbarkeit des Codes.

### 3. Strukturierte Validierung und konsistente Fehlerbehandlung

- **Herausforderungen beim herkömmlichen Ansatz**: Wenn die Datenvalidierungslogik über mehrere Controller verteilt ist,
  wird die Wartung schwierig und die Anwendung einer konsistenten Fehlerbehandlungsstrategie komplex.
- **Lösung von express-cargo**: express-cargo bietet integrierte und benutzerdefinierte Validierungs-Decorators, mit denen Validierungsregeln
  deklarativ innerhalb von Request-Klassen definiert werden können. Die automatische Validierung erfolgt während des Anfragedatenbindungsprozesses,
  und im Falle eines Validierungsfehlers bietet eine benutzerdefinierbare Fehlerbehandlung konsistente und vorhersagbare Antworten.

## ✨ Hauptmerkmale

- Klassenbasierte Anfragedatenbindung
- Integrierte und benutzerdefinierte Validierungs-Decorators
- Unterstützung für verschachtelte Objekte
- Automatische Typumwandlung
- Unterstützung für virtuelle Felder und berechnete Werte
- Anpassbare Fehlerbehandlung

> Eine leichtgewichtige Middleware für Express, die klassenbasierte Anfragedatenbindung und Validierung mithilfe von Decorators ermöglicht.

express-cargo trägt dazu bei, die Last wiederkehrender Aufgaben zu verringern, die Codequalität und -stabilität zu verbessern und
es Entwicklern zu ermöglichen, sich auf die Implementierung der Kerngeschäftslogik innerhalb der Express.js-Entwicklungsumgebung zu konzentrieren.
Erleben Sie eine robuste und effiziente Anwendungsentwicklung mit Express.js unter Verwendung von express-cargo.
