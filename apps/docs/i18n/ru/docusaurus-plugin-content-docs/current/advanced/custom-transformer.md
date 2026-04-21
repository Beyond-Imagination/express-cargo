# Пользовательский преобразователь

Декоратор `@Transform` позволяет определить пользовательскую логику преобразования, которая выполняется **после** встроенного приведения типов Express-Cargo. Он предназначен для **уточнения значений** — нормализации, ограничения или очистки значения, тип которого уже определён — а не для изменения типа поля.

Основы использования `@Transform` описаны на странице [Transformation Decorator](/decorators/transforms).

:::note `@Transform` уточняет значения, а не типы
Поскольку встроенное приведение типов (`String`, `Number`, `Boolean`, `Date`, `Array`) выполняется до преобразователя, ваша функция получает уже приведённое значение и должна возвращать тот же тип. Если исходное значение запроса не соответствует объявленному типу (например, строка с запятыми поступает в поле, объявленное как `string[]`), приведение типа завершится с ошибкой ещё до того, как ваш преобразователь будет вызван.

Когда необходимо получить значение формы, отличающейся от исходной (разобрать разделённую строку в массив, принять несколько truthy-написаний для boolean и т.д.), используйте вместо этого декоратор [`@Request`](/decorators/virtual). Он полностью обходит встроенное приведение типов и передаёт вам объект `Request` напрямую. См. раздел [Когда использовать `@Request` вместо этого](#when-to-use-request-instead) ниже.
:::

## Порядок выполнения

Важно понимать, когда выполняется `@Transform`:

1. Исходное значение извлекается из источника запроса (`@Query`, `@Body` и т.д.)
2. **Встроенное приведение типов** преобразует значение в объявленный тип (`String`, `Number`, `Boolean`, `Date`)
3. **`@Transform`** выполняется над уже приведённым значением
4. **Валидация** применяется к конечному результату

Это означает, что ваша функция-преобразователь получает значение после приведения типа, а не исходную строку.

## Практические рецепты

### Нормализация Enum

Нормализация пользовательского ввода для соответствия ожидаемым значениям enum:

```typescript
enum SortOrder {
    ASC = 'asc',
    DESC = 'desc',
}

class ListRequest {
    @Query()
    @Transform((value: string) => value.toLowerCase() as SortOrder)
    order!: SortOrder
}

// GET /list?order=DESC → { order: 'desc' }
```

### Очистка строкового ввода

Удаление нежелательных символов или нормализация пробелов:

```typescript
class CommentRequest {
    @Body()
    @Transform((value: string) => value.trim().replace(/\s+/g, ' '))
    content!: string
}

// POST { content: "  hello   world  " } → { content: "hello world" }
```

### Ограничение числовых диапазонов

Обеспечение нахождения числа в допустимом диапазоне:

```typescript
class PaginationRequest {
    @Query()
    @Transform((value: number) => Math.min(Math.max(value, 1), 100))
    limit!: number
}

// GET /items?limit=500 → { limit: 100 }
// GET /items?limit=-5  → { limit: 1 }
```

### Манипуляция датами

Применение корректировок к распарсенным датам:

```typescript
class ReportRequest {
    @Query()
    @Transform((value: Date) => {
        // Установить время на начало дня (00:00:00)
        value.setHours(0, 0, 0, 0)
        return value
    })
    startDate!: Date
}
```

## Комбинирование с другими декораторами

`@Transform` безупречно работает вместе с другими декораторами Express-Cargo:

```typescript
class ProductQuery {
    @Query('q')
    @Transform((value: string) => value.toLowerCase().trim())
    @IsNotEmpty()
    searchTerm!: string

    @Query()
    @Default(10)
    @Transform((value: number) => Math.min(value, 50))
    limit!: number
}
```

:::tip
Старайтесь, чтобы функции-преобразователи были простыми и сфокусированными на одной задаче. Если вам нужны сложные многоэтапные преобразования, рассмотрите композицию вспомогательных функций:

```typescript
const normalize = (v: string) => v.trim().toLowerCase()
const clamp = (min: number, max: number) => (v: number) => Math.min(Math.max(v, min), max)

class Request {
    @Query()
    @Transform(normalize)
    keyword!: string

    @Query()
    @Transform(clamp(1, 100))
    page!: number
}
```
:::

## Когда использовать `@Request` вместо этого {#when-to-use-request-instead}

Когда значение запроса нужно не просто уточнить, а **преобразовать в другой тип**, `@Transform` не подходит: встроенное приведение типов выполняется первым и либо вызовет ошибку, либо приведёт значение к форме, отличной от ожидаемой. Используйте [`@Request`](/decorators/virtual), чтобы обойти приведение типов и работать непосредственно с объектом `Request`.

### Строка с разделителями-запятыми в массив

```typescript
class SearchRequest {
    @Request(req => String(req.query.tags ?? '').split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Результат: { tags: ['node', 'express', 'cargo'] }
```

### Гибкий разбор boolean

Принимать несколько truthy-написаний, таких как `"yes"`, `"1"` или `"on"`, а не только `"true"`:

```typescript
class FilterRequest {
    @Request(req => {
        const raw = String(req.query.active ?? '').toLowerCase()
        return ['true', 'yes', '1', 'on'].includes(raw)
    })
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```