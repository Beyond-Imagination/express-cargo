# Example app requests

A ready-made request for every route in this app, grouped by the router that serves it. Start the
server first:

```shell
pnpm dev
```

Every route is wired the same way, so the request classes stay in the router files and only the
requests are listed here:

```typescript
router.post('/body', bindingCargo(BodyExample), (req, res) => {
    const cargo = getCargo<BodyExample>(req)
    res.json(cargo)
})
```

The blocks below assume this shell variable:

```shell
H='Content-Type: application/json'
```

## Source decorators — `decorators/source.ts`

```shell
# @Body
curl -X POST localhost:3000/body -H "$H" -d '{"number": 1, "string": "sss", "boolean": true}'

# @Query
curl 'localhost:3000/query?number=456&string=hello-query&boolean=false'

# @Params / @Uri
curl localhost:3000/uri/789

# @Header
curl localhost:3000/header -H 'Authorization: Bearer my-auth-token-123'

# @Session — POST seeds the session, so the two requests need a shared cookie jar
curl -X POST localhost:3000/session -c cookies.txt
curl localhost:3000/session -b cookies.txt
```

## File upload — `decorators/file.ts`

The routes use `multer` with memory storage and answer with a summary of each file.

```shell
# @UploadedFile
curl -X POST localhost:3000/upload/avatar -F username=jane -F avatar=@./package.json

# @UploadedFiles
curl -X POST localhost:3000/upload/gallery -F photos=@./package.json -F photos=@./tsconfig.json

# both on one class
curl -X POST localhost:3000/upload/profile \
    -F bio='Open Source Contributor' -F avatar=@./package.json -F gallery=@./tsconfig.json
```

## Transform, Request, Virtual — `decorators/transform.ts`

```shell
# @Transform — sortBy is lowercased, count is cast to a number and doubled
curl 'localhost:3000/transform?sortBy=NAME&count=5'

# @Request — reads the header straight off the Express request
curl -X POST localhost:3000/request -H "$H" -H 'X-Custom-Header: data-from-my-app-123' -d '{}'

# @Virtual — total is computed from the other fields
curl -X POST localhost:3000/virtual -H "$H" -d '{"price": 100, "quantity": 5}'
```

## Type helpers — `decorators/typeHelper.ts`

```shell
# cast from the declared field type, no decorator needed
curl -X POST localhost:3000/type-casting/10 -H "$H" \
    -d '{"string": "test", "boolean": "true", "date": "2025-10-26", "customObject": {"name": "Jane Doe", "age": 26}}'

# @List — the element type is a constructor or a primitive name
curl -X POST localhost:3000/list -H "$H" -d '{
    "stringArray": ["apple", "banana"],
    "numberArray": [10, 20],
    "booleanArray": [true, false],
    "dateArray": ["2023-01-01T00:00:00Z"],
    "stringLiteralArray": ["foo"],
    "customClassArray": [{"name": "Alice", "age": 30}]
}'

# @Enum — the key or the value works; role binds to the numeric member 0
curl -X POST localhost:3000/enum -H "$H" -d '{"role": "ADMIN", "stringRole": "admin"}'
```

## Missing values — `decorators/missingHandler.ts`

```shell
# @Optional — validation is skipped while the field is absent
curl -X POST localhost:3000/optional -H "$H" -d '{"number": 1}'
curl -X POST localhost:3000/optional -H "$H" -d '{}'

# @Default — request values win, defaults fill the gaps
curl -X POST localhost:3000/default -H "$H" -d '{"number": 99, "string": "custom-value", "boolean": true}'
curl -X POST localhost:3000/default -H "$H" -d '{}'
```

## Validators — `decorators/validators/`

### Number — `validators/number.ts`

```shell
curl -X POST localhost:3000/min   -H "$H" -d '{"number": 1}'
curl -X POST localhost:3000/max   -H "$H" -d '{"number": 10}'
curl -X POST localhost:3000/range -H "$H" -d '{"number": 15}'
```

### String — `validators/string.ts`

```shell
curl -X POST localhost:3000/contains        -H "$H" -d '{"greeting": "hello world"}'
curl -X POST localhost:3000/prefix          -H "$H" -d '{"url": "https://example.com"}'
curl -X POST localhost:3000/suffix          -H "$H" -d '{"photo": "my_picture.png"}'
curl -X POST localhost:3000/max-length      -H "$H" -d '{"name": "hello"}'
curl -X POST localhost:3000/min-length      -H "$H" -d '{"name": "ok"}'
curl -X POST localhost:3000/length          -H "$H" -d '{"name": "AB"}'
curl -X POST localhost:3000/regexp          -H "$H" -d '{"phone": "010-1234-5678"}'
curl -X POST localhost:3000/email           -H "$H" -d '{"email": "user.name@sub.domain.co.kr"}'
curl -X POST localhost:3000/alpha           -H "$H" -d '{"name": "JaneDoe"}'
curl -X POST localhost:3000/alphanumeric    -H "$H" -d '{"alphanumeric": "abc123"}'
curl -X POST localhost:3000/is-uppercase    -H "$H" -d '{"text": "HELLO"}'
curl -X POST localhost:3000/is-lowercase    -H "$H" -d '{"text": "hello"}'
curl -X POST localhost:3000/is-url          -H "$H" -d '{"url": "https://example.com"}'
curl -X POST localhost:3000/is-phone-number -H "$H" -d '{"phone": "010-1234-5678"}'
curl -X POST localhost:3000/is-timezone     -H "$H" -d '{"timezone": "Asia/Seoul"}'
curl -X POST localhost:3000/is-hex-color    -H "$H" -d '{"color": "#1a2b3c"}'
curl -X POST localhost:3000/is-hexadecimal  -H "$H" -d '{"value": "deadbeef"}'

# @Uuid takes an optional version; uuidAll accepts any, uuid is v4 only
curl -X POST localhost:3000/uuid -H "$H" \
    -d '{"uuidAll": "6bb113fd-4dcb-1197-956d-ba9033e22c69", "uuid": "a91f62e5-28aa-48a1-ae2d-95e41c164113"}'

# @IsJwt checks the three-segment shape only, never the signature
curl -X POST localhost:3000/is-jwt -H "$H" -d '{"token": "header-part.payload-part.signature-part"}'

curl -X POST localhost:3000/is-hash -H "$H" -d '{
    "md5": "d41d8cd98f00b204e9800998ecf8427e",
    "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}'
```

### Comparison — `validators/comparison.ts`

```shell
curl -X POST localhost:3000/equal     -H "$H" -d '{"number": 3, "string": "text", "boolean": true}'
curl -X POST localhost:3000/not-equal -H "$H" -d '{"number": 4, "string": "other-text", "boolean": false}'
curl -X POST localhost:3000/is-true   -H "$H" -d '{"booleanValue": true}'
curl -X POST localhost:3000/is-false  -H "$H" -d '{"booleanValue": false}'
curl -X POST localhost:3000/one-of    -H "$H" -d '{"language": "ts"}'
curl -X POST localhost:3000/validate  -H "$H" -d '{"email": "test@example.com"}'
```

### Date — `validators/date.ts`

```shell
curl -X POST localhost:3000/min-date -H "$H" -d '{"date": "2024-05-01"}'
curl -X POST localhost:3000/max-date -H "$H" -d '{"date": "2030-01-01"}'
```

### Array — `validators/array.ts`

```shell
curl -X POST localhost:3000/list-max-size -H "$H" -d '{"numbers": [1, 2, 3], "tags": ["ts", "node"]}'
curl -X POST localhost:3000/list-min-size -H "$H" -d '{"numbers": [1, 2, 3, 4, 5], "tags": ["ts", "node"]}'
curl -X POST localhost:3000/each          -H "$H" -d '{"tags": ["typescript", "decorator"], "evenNumbers": [2, 4, 10]}'

# elements are compared with a deep equality check; the strings field uses a
# case-insensitive comparator, so HELLO and WORLD pass
curl -X POST localhost:3000/list-contains -H "$H" -d '{
    "numbers": [1, 2, 3],
    "objects": [{"name": "test1"}, {"name": "test2"}],
    "dates": ["2024-01-01T00:00:00.000Z"],
    "mixed": [1, {"name": "test1"}],
    "strings": ["HELLO", "WORLD"]
}'

curl -X POST localhost:3000/list-not-contain -H "$H" -d '{
    "numbers": [3, 4, 5],
    "objects": [{"name": "allowed"}],
    "dates": ["2025-06-01T00:00:00.000Z"],
    "strings": ["FOO", "BAR"]
}'
```

### Cross-field — `validators/crossField.ts`

The second request of each pair fails.

```shell
# @With: page needs limit to have a value
curl -X POST localhost:3000/with -H "$H" -d '{"page": 1, "limit": 10}'
curl -X POST localhost:3000/with -H "$H" -d '{"page": 1}'

# @Without: deliveryAddress is rejected when isPickup is truthy
curl -X POST localhost:3000/without -H "$H" -d '{"deliveryAddress": "123 Magic Street", "isPickup": false}'
curl -X POST localhost:3000/without -H "$H" -d '{"deliveryAddress": "123 Magic Street", "isPickup": true}'
```

## Error handling — `errorHandler.ts`, `errors/cargoErrorHandler.ts`

`src/errors/cargoErrorHandler.ts` installs a global handler with `setCargoErrorHandler`, so cargo
errors never reach Express and any failing request answers with the same shape:

```shell
curl -X POST localhost:3000/min -H "$H" -d '{"number": -10}'
```

```json
{
    "code": "VALIDATION_ERROR",
    "message": "The provided input is invalid.",
    "details": [{ "name": "CargoFieldError", "message": "number must be >= 1" }]
}
```

`/error-handler` is the exception: it forwards cargo errors with `next(error)` for that route only,
so its router can catch `CargoValidationError`, `CargoFieldError` and `CargoTransformFieldError`
with an ordinary Express error handler.

```shell
# passes
curl -X POST localhost:3000/error-handler -H "$H" -d '{"name": "Jane Doe", "email": "janeDoe123@epxress-cargo.com"}'

# fails on both fields
curl -X POST localhost:3000/error-handler -H "$H" -d '{"name": "Jane Marie Roe", "email": "janeDoe123"}'
```

## Advanced — `advanced/`

```shell
# inheritance.ts — base class decorators apply to the subclass, nested as well
curl -X POST localhost:3000/class-field-inheritance -H "$H" \
    -d '{"sample": {"baseText": "abcd", "stringText": "abcde"}}'

# polymorphism.ts — @Type resolves the class from the raw data, per element for arrays
curl -X POST localhost:3000/type -H "$H" -d '{
    "name": "Gemini Admin",
    "profile": {"bio": "Open Source Contributor", "user": {"name": "Cargo Maintainer"}},
    "featuredMedia": {"type": "video", "duration": 3600},
    "gallery": [{"type": "image", "format": "jpg"}, {"type": "video", "duration": 500}]
}'

# integration.ts — body, query, params, header and @Request on one class
curl -X POST 'localhost:3000/integration/20?today=2025-10-28' -H "$H" \
    -H 'Authorization: Bearer example-access-token' \
    -d '{"posts": [{"name": "post1", "content": "hello..."}, {"name": "post2", "content": "..."}]}'

# passport.ts — authenticate first, then bind req.user with @Request<object>
curl localhost:3000/passport -H 'Authorization: Bearer express-cargo-token'
```
