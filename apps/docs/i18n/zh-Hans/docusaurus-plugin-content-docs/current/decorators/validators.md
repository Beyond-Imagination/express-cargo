# 验证装饰器

Express-Cargo 使用装饰器验证绑定到类的传入请求数据。

验证不是由独立的 `validate` 函数执行的。它被集成到 `bindingCargo` 中间件中，并在请求生命周期内自动验证数据。

## 内置验证器

### `@Optional()`

将字段标记为可选，允许该字段被省略或设置为 `undefined`，且不会触发验证错误。

### `@Min(value: number)`

验证数字大于或等于指定的最小值。

- **`value`**：允许的最小值。

### `@Max(value: number)`

验证数字小于或等于指定的最大值。

- **`value`**：允许的最大值。

### `@Range(min: number, max: number)`

验证数字位于指定范围内，包含最小值和最大值。

- **`min`**：允许的最小值。
- **`max`**：允许的最大值。

### `@Contains(seed: string)`

验证字符串包含指定子字符串。

- **`seed`**：字符串中必须包含的子字符串。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@Prefix(value: string)`

验证字符串以指定前缀开头。

- **`value`**：必需的起始文本。

### `@Suffix(value: string)`

验证字符串以指定后缀结尾。

- **`value`**：必需的结尾文本。

### `@Equal(value: any)`

验证值与指定值严格相等（`===`）。

- **`value`**：要比较的值。

### `@NotEqual(value: any)`

验证值与指定值严格不相等（`!==`）。

- **`value`**：要比较的值。

### `@IsTrue()`

验证被装饰的属性为 true。

### `@IsFalse()`

验证被装饰的属性为 false。

### `@Length(value: number)`

验证被装饰字符串的长度恰好等于指定值。

- **`value`**：所需的精确字符长度。

### `@MaxLength(value: number)`

验证被装饰字符串的长度不超过指定最大值。

- **`value`**：允许的最大字符长度。

### `@MinLength(value: number)`

验证被装饰字符串的长度至少为指定最小值。

- **`value`**：允许的最小字符长度。

### `@OneOf(values: any[])`

验证输入值是指定值集合中的一个。

- **`values`**：允许值数组。

### `@ListContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

验证数组包含所有指定值。支持原始值、对象、Date 和混合类型。

- **`values`**：数组中必须存在的值。
- **`comparator`**（可选）：自定义比较函数 `(expected, actual) => boolean`。提供后，所有比较都会委托给该函数，包括原始值。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

> **警告**：对象比较默认使用深度相等。当 `values` 包含许多对象或深层嵌套结构时，性能可能下降。可以考虑使用 `comparator` 来获得更高效或更灵活的比较。

### `@ListNotContains(values: any[], comparator?: (expected, actual) => boolean, message?: string)`

验证数组不包含任何指定值。支持原始值、对象、Date 和混合类型。

- **`values`**：数组中不得存在的值。
- **`comparator`**（可选）：自定义比较函数 `(expected, actual) => boolean`。提供后，所有比较都会委托给该函数，包括原始值。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

> **警告**：对象比较默认使用深度相等。当 `values` 包含许多对象或深层嵌套结构时，性能可能下降。可以考虑使用 `comparator` 来获得更高效或更灵活的比较。

### `@Enum(enumObj: object, message?: string)`

验证输入值匹配指定 enum 对象中的某个值。
它还会自动将输入值（例如字符串 key）转换为对应的 enum 值。

- **`enumObj`**：用于验证的 enum 对象。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@Validate(validateFn: (value: unknown) => boolean, message?: string)`

使用自定义验证函数验证值。
该装饰器提供灵活性，可实现内置验证器之外的验证逻辑。

- **`validateFn`**：接收字段值并在有效时返回 true、无效时返回 false 的函数。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@Regexp(pattern: RegExp, message?: string)`

验证被装饰字段匹配指定正则表达式模式。
该装饰器适合强制执行 email、电话号码等格式规则。

- **`pattern`**：用于测试字段值的 RegExp 对象。值匹配该模式时即为有效。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@Email()`

验证被装饰属性是有效的 email 地址。

### `@Alpha(message?: string)`

验证被装饰字段只包含字母字符（大写或小写英文字母，A-Z / a-z）。

- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@Uuid(version?: 'v1' | 'v3' | 'v4' | 'v5', message?: string)`

验证被装饰字段是有效的 UUID 字符串，并可选地限制为特定版本（v1、v3、v4 或 v5）。

- **`version`**（可选）：要验证的特定 UUID 版本。省略时会验证 v1、v3、v4 或 v5。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@Alphanumeric(message?: string)`

验证被装饰字段只包含字母数字字符（英文字母和数字，A-Z、a-z、0-9）。

- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsUppercase(message?: string)`

验证被装饰字段只包含大写字符。

- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsLowercase(message?: string)`

验证被装饰字段只包含小写字符。

- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsJwt(message?: string)`

验证被装饰字段符合 JWT 格式（`header.payload.signature`）。每一部分都必须由 Base64URL 字符组成（A-Z、a-z、0-9、`-`、`_`）。该装饰器只检查格式，不验证签名或 token 有效性。

- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsUrl(options?: IsUrlOptions, message?: string)`

验证被装饰字段是有效 URL。默认允许 `http`、`https` 和 `ftp` 协议。

- **`options`**（可选）：
  - **`protocols`**：允许的协议数组。默认为 `['http', 'https', 'ftp']`。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsPhoneNumber(region?: CountryCode, message?: string)`

验证被装饰字段是有效电话号码。使用 [libphonenumber-js](https://github.com/catamphetamine/libphonenumber-js) 实现跨国家的准确验证。

提供 region 时，会接受本地格式（不带国家码）。未提供 region 时，号码必须包含国家码（例如 `+82`）。如果号码包含以 `+` 开头的国家码前缀，则会忽略 region 参数，并根据号码自身的国家码进行验证。

- **`region`**（可选）：ISO 3166-1 alpha-2 地区代码（例如 `'KR'`、`'US'`）。省略时，号码必须为国际格式。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsTimeZone(message?: string)`

验证被装饰字段是有效的 IANA 时区标识符（例如 `Asia/Seoul`、`America/New_York`、`UTC`）。使用内置 `Intl` API 进行验证，不需要外部依赖。

- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsHexColor(message?: string)`

验证被装饰字段是有效的十六进制颜色代码。支持 `#RGB`、`#RGBA`、`#RRGGBB` 和 `#RRGGBBAA` 格式（大小写不敏感）。必须包含 `#` 前缀。

- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsHexadecimal(message?: string)`

验证被装饰字段是十六进制数字。值只能包含 `0-9` 和 `a-f` 字符（大小写不敏感）。也允许 `0x` 前缀。

- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@IsHash(algorithm: HashAlgorithm, message?: string)`

验证被装饰字段是给定算法的有效 hash 字符串。支持的算法：`md5`、`sha1`、`sha256`、`sha384`、`sha512`、`crc32`、`crc32b`。值必须是长度与算法要求完全一致的十六进制字符串。

- **`algorithm`**：用于验证的 hash 算法。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@MinDate(min: Date | (() => Date), message?: string)`

验证被装饰字段是一个 `Date`，且不早于给定的最小日期。接受固定 `Date` 或返回 `Date` 的函数，以支持动态比较。

- **`min`**：允许的最小日期，或返回该日期的函数。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@MaxDate(max: Date | (() => Date), message?: string)`

验证被装饰字段是一个 `Date`，且不晚于给定的最大日期。接受固定 `Date` 或返回 `Date` 的函数，以支持动态比较。

- **`max`**：允许的最大日期，或返回该日期的函数。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@With(fieldName: string, message?: string)`

验证如果被装饰字段有值，则指定目标字段（fieldName）也必须有值，从而在两个字段之间建立必需依赖关系。

- **`fieldName`**：当被装饰字段有值时，也必须有值的目标字段名称。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@Without(fieldName: string, message?: string)`

验证如果被装饰属性有值，则指定目标属性不得有值，从而在两个属性之间建立互斥关系。

- **`fieldName`**：当被装饰字段有值时必须为空的目标属性名称。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@Each(...args: (Validator | Function)[])`

验证数组中的每个独立元素。它可以接收其他验证装饰器或自定义验证函数。

- `args`：验证装饰器（例如 @Min(5)）或自定义函数 `(value: any) => boolean`。

### `@ListMaxSize(max: number, message?: string)`

验证数组包含的元素数量不超过指定数量。

- **`max`**：数组允许的最大元素数量。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

### `@ListMinSize(min: number, message?: string)`

验证数组包含的元素数量至少达到指定数量。

- **`min`**：数组允许的最小元素数量。
- **`message`**（可选）：验证失败时显示的错误消息。省略时使用默认消息。

## 使用示例

下面是一个在 Express 应用中使用验证装饰器的完整示例。

```typescript
import express, { Request, Response, NextFunction } from 'express'
import { bindingCargo, getCargo, Body, Min, Max, Suffix, CargoValidationError } from 'express-cargo'

// 1. 定义包含来源和验证规则的类
class CreateAssetRequest {
    @Body('name')
    assetName!: string

    @Body('type')
    @Suffix('.png')
    assetType!: string

    @Body('quantity')
    @Min(1)
    @Max(100)
    quantity!: number
}

const app = express()
app.use(express.json())

// 2. 将 bindingCargo 中间件应用到路由
app.post('/assets', bindingCargo(CreateAssetRequest), (req: Request, res: Response) => {
    // 3. 如果验证成功，使用 getCargo 访问数据
    const assetData = getCargo<CreateAssetRequest>(req)
    res.json({
        message: 'Asset created successfully!',
        data: assetData,
    })
})

// 4. 添加错误处理中间件以捕获验证错误
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof CargoValidationError) {
        res.status(400).json({
            message: 'Validation Failed',
            errors: err.errors.map(e => e.message),
        })
    } else {
        next(err)
    }
})

/*
要测试此端点，请向 /assets 发送 POST 请求。

有效请求 body 示例：
{
    "name": "My-Asset",
    "type": "icon.png",
    "quantity": 10
}

无效请求 body 示例：
{
    "name": "My-Asset",
    "type": "icon.jpg", // 未通过 @Suffix('.png')
    "quantity": 101     // 未通过 @Max(100)
}
*/
```

## 错误处理

验证失败时，`bindingCargo` 中间件会抛出 `CargoValidationError`。你应该注册一个 Express 错误处理中间件来捕获该错误并格式化响应。

`CargoValidationError` 对象有一个 `errors` 属性，其中保存 `CargoFieldError` 实例数组。每个 `CargoFieldError` 对象都包含 `message` 属性，其中是描述具体错误的格式化字符串（例如 `"quantity: quantity must be <= 100"`）。

如代码示例所示，常见的处理方式是遍历 `err.errors` 数组，生成这些错误消息的简单列表。

**错误响应示例：**

当发送上方示例中的无效请求 body 时，错误处理器会生成如下 JSON 响应，其中包含格式化错误消息数组。

```json
{
    "message": "Validation Failed",
    "errors": [
        "type: assetType must end with .png",
        "quantity: quantity must be <= 100"
    ]
}
```
