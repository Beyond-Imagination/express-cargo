# Пользовательский преобразователь

Декоратор `@Transform` позволяет определить пользовательскую логику преобразования, которая выполняется **после** встроенного приведения типов Express-Cargo. Это идеально подходит для продвинутой нормализации входных данных, выходящей за рамки простого преобразования типов.

Основы использования `@Transform` описаны на странице [Transformation Decorator](/docs/decorators/transforms).

## Порядок выполнения

Важно понимать, когда выполняется `@Transform`:

1. Исходное значение извлекается из источника запроса (`@Query`, `@Body` и т.д.)
2. **Встроенное приведение типов** преобразует значение в объявленный тип (`String`, `Number`, `Boolean`, `Date`)
3. **`@Transform`** выполняется над уже приведённым значением
4. **Валидация** применяется к конечному результату

Это означает, что ваша функция-преобразователь получает значение после приведения типа, а не исходную строку.

## Практические рецепты

### Строка с разделителями-запятыми в массив

Параметры запроса всегда являются строками. Если ваш API принимает список через запятую (например, `?tags=a,b,c`), вы можете разделить его в массив:

```typescript
class SearchRequest {
    @Query()
    @Transform((value: string) => value.split(',').map(v => v.trim()))
    tags!: string[]
}

// GET /search?tags=node,express,cargo
// Результат: { tags: ['node', 'express', 'cargo'] }
```

### Приведение булевоподобных строк

Express-Cargo автоматически приводит `"true"` к `true`, но вам может потребоваться обработка других истинных значений, таких как `"yes"`, `"1"` или `"on"`:

```typescript
class FilterRequest {
    @Query()
    @Transform((value: string) => ['true', 'yes', '1', 'on'].includes(String(value).toLowerCase()))
    active!: boolean
}

// GET /filter?active=yes → { active: true }
// GET /filter?active=0   → { active: false }
```

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