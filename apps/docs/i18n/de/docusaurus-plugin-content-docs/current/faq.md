---
title: FAQs
sidebar_label: FAQs
---

Finden Sie Antworten auf häufig gestellte Fragen zur Verwendung der Bibliothek. Klicken Sie auf eine Frage, um die Antwort anzuzeigen.

### 1. Erste Schritte

<details>
<summary><b>F: Was ist das express-cargo-Projekt?</b></summary>

**A:** Es handelt sich um eine Middleware, die entwickelt wurde, um die wiederholte und mühsame Verarbeitung von Anfragedaten (`req.body`, `req.query` usw.) in Express.js mithilfe eines klassenbasierten Ansatzes zu automatisieren. Durch die Verwendung von TypeScript-Decorators können Sie die Datenbindung und -validierung deklarativ an einem Ort handhaben.
</details>

<details>
<summary><b>F: Gibt es Vorsichtsmaßnahmen bei der Installation?</b></summary>

**A:** **Node.js Version 20 oder höher** wird empfohlen. Es ist so konzipiert, dass es als Standard-Middleware flexibel in bestehende Express-Projekte integriert werden kann.
</details>

<details>
<summary><b>F: Ist die TypeScript-Konfiguration obligatorisch?</b></summary>

**A:** Ja. Da es Decorators verwendet, müssen die folgenden beiden Optionen in Ihrer `tsconfig.json` auf `true` gesetzt sein:
- `experimentalDecorators: true`
- `emitDecoratorMetadata: true`

Zusätzlich muss das `reflect-metadata`-Paket installiert sein, um Typinformationen zur Laufzeit lesen zu können.
</details>

### 2. Datenbindung & Decorators

<details>
<summary><b>F: Was ist der Unterschied zwischen `@Body` und `@Query`?</b></summary>

**A:** Der Unterschied liegt in der Quelle der Datenextraktion:
- **`@Body`**: Extrahiert Daten aus dem HTTP-Anfrage-Body. Hauptsächlich für `POST`- und `PUT`-Anfragen verwendet.
- **`@Query`**: Extrahiert Parameter aus dem URL-Query-String (z. B. `?id=1&name=test`). Hauptsächlich zur Filterung oder Sortierung in `GET`-Anfragen verwendet.
- Sie können auch verschiedene andere Anfragedaten mit `@Params()` (oder `@Uri()`), `@Header()` und `@Session()` binden.
</details>

<details>
<summary><b>F: Was ist @Uri()? Unterscheidet es sich von @Params()?</b></summary>

**A:** `@Uri()` ist ein **Alias** für `@Params()`. Sie können je nach Lesbarkeitspräferenz zwischen ihnen wählen, wenn Sie URL-Pfadparameter binden (z. B. `/:id`).
</details>

<details>
<summary><b>F: Wie rufe ich die gebundenen Daten ab?</b></summary>

**A:** Nachdem Sie die `bindingCargo(ClassName)`-Middleware in Ihrem Router übergeben haben, können Sie die Instanz innerhalb des Handlers abrufen, indem Sie die Funktion `getCargo<ClassName>(req)` aufrufen.
</details>

### 3. Validierung & Transformation

<details>
<summary><b>F: Wie werden Validierungsfehler behandelt?</b></summary>

**A:** Die Validierung wird intern mit Decorators wie `@Min`, `@Max` und `@Length` durchgeführt. Wenn ungültige Daten erkannt werden, gibt die Middleware automatisch eine Fehlerantwort zurück oder löst eine Ausnahme aus.
</details>

<details>
<summary><b>F: Wie kann ich Feldwerte verarbeiten oder transformieren?</b></summary>

**A:** Verwenden Sie den **`@Transform()`**-Decorator. Zum Beispiel ermöglicht das Schreiben von `@Transform(v => v.trim())` die Umwandlung von Eingabedaten in das gewünschte Format vor der Bindung.
</details>

<details>
<summary><b>F: Wie vermeide ich Fehler, wenn ein bestimmtes Feld fehlt?</b></summary>

**A:** Verwenden Sie den **`@Optional()`**-Decorator. Das Feld wird auch dann erfolgreich gebunden, wenn der Wert `null` oder `undefined` ist, und die Validierung für dieses Feld wird übersprungen.
</details>

### 4. Framework-Kompatibilität

<details>
<summary><b>F: Kann ich es mit Fastify oder NestJS verwenden?</b></summary>

**A:** Diese Bibliothek ist speziell als **exklusive Middleware für Express.js** konzipiert.
- **NestJS**: NestJS verfügt über eine eigene `ValidationPipe` und Decorators, die sich in der Funktionalität überschneiden können. Obwohl es technisch möglich ist, wenn der Express-Adapter verwendet wird, besteht das Hauptziel dieser Bibliothek darin, die DX in reinen Express-Umgebungen zu verbessern.
- **Fastify**: Derzeit nicht offiziell unterstützt.
</details>

### 5. Fehlerbehebung

<details>
<summary><b>F: Warum geben meine Klassensinstanzdaten `undefined` zurück?</b></summary>

**A:** Bitte überprüfen Sie die folgenden beiden Punkte:
- Ist eine Body-Parsing-Middleware wie `express.json()` **vor** `bindingCargo` deklariert?
- Wird `reflect-metadata` ganz oben im Einstiegspunkt Ihrer Anwendung importiert?
</details>

<details>
<summary><b>F: Erfolgt eine automatische Typkonvertierung?</b></summary>

**A:** Ja. Es wird versucht, Werte automatisch basierend auf den in den Klassenfeldern definierten Typen (`string`, `number`, `boolean` usw.) zu konvertieren. Beispielsweise wird ein String `"123"`, der von `@Query()` kommt, automatisch in eine Zahl konvertiert, wenn der Feldtyp als `number` definiert ist.
</details>

### 6. Sonstiges

<details>
<summary><b>F: Kann ich es kostenlos in kommerziellen Projekten verwenden?</b></summary>

**A:** Diese Bibliothek ist unter der **MIT-Lizenz** lizenziert. Sie können sie auch für kommerzielle Zwecke ohne Einschränkungen frei verwenden, ändern und verteilen.
</details>
