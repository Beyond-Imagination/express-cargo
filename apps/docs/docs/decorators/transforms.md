# Transformation Decorator

Express-Cargo uses decorators to automatically transform incoming request data before it's bound to a class. This is useful for tasks like converting a string to a number, a string to a boolean, or sanitizing a value.

Unlike virtual fields, which create new fields from existing ones, these transformation decorators modify the value of a single field directly.

## `@transform<T>(transformer: (value: any) => T)`

This is the primary decorator for data transformation. It takes a transformer function that receives the raw value from the request and returns the new, transformed value for the field.

- `transformer`: A function that accepts the raw value and returns the transformed value.

## Usage Example

Here is a complete example of how to use the `@transform` decorator to handle data type conversions. This is especially useful for data coming from query parameters or form bodies, which are often parsed as strings.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, body, query, transform } from 'express-cargo'

// 1. Define a class with source and transformation rules
class SearchRequest {
    // Transforms the 'page' query parameter (string) into a number
    @query('page')
    @transform((value: string) => parseInt(value, 10))
    page!: number

    // Transforms the 'isPublished' query parameter (string) into a boolean
    @query('isPublished')
    @transform((value: string) => value === 'true')
    isPublished!: boolean
}

const app = express()
app.use(express.json())

// 2. Apply the bindingCargo middleware
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. Access the data, which now has the correct types
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: 'Search parameters processed successfully!',
        data: searchParams,
        // The data types are now correct
        pageType: typeof searchParams.page, 
        isPublishedType: typeof searchParams.isPublished
    })
})

/*
To test this endpoint, send a GET request to /search.

Example request URL:
http://localhost:3000/search?page=10&isPublished=true
*/
```

## Output Example

When the example request URL is accessed, the `bindingCargo` middleware transforms the string values `page='10'` and `isPublished='true'` into their correct data types. The `getCargo` function returns an object with these transformed values.

```json
{
    "message": "Search parameters processed successfully!",
    "data": {
        "page": 10,
        "isPublished": true
    },
    "pageType": "number",
    "isPublishedType": "boolean"
}
```
