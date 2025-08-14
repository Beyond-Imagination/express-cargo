# Transformation Decorator

Express-Cargo uses decorators to automatically transform incoming request data before it's bound to a class. This is useful for tasks like converting a string to a number, a string to a boolean, or sanitizing a value.

Unlike virtual fields, which create new fields from existing ones, these transformation decorators modify the value of a single field directly.

## `@transform<T>(transformer: (value: any) => T)`

This is the primary decorator for data transformation. It takes a transformer function that receives the raw value from the request and returns the new, transformed value for the field.

- `transformer`: A function that accepts the raw value and returns the transformed value.

## Usage Example

This example demonstrates how the `@transform` decorator can be used to normalize and process request data into a desired format. This is highly useful for handling diverse user inputs (e.g., case sensitivity, comma-separated lists) and ensuring that your API processes them consistently, which improves the stability of your application.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, query, transform } from 'express-cargo'

// 1. Define a class with data processing and normalization rules
class SearchRequest {
    // Transforms the 'sortBy' query parameter to lowercase for consistent sorting
    @query()
    @transform((value: string) => value.toLowerCase())
    sortBy!: string

    // Splits the 'tags' query parameter by commas, trims whitespace from each tag, and converts it to an array
    @query()
    @transform((value: string) => value.split(',').map(tag => tag.trim()))
    tags!: string[]
}

const app = express()
app.use(express.json())

// 2. Apply the bindingCargo middleware to the route
app.get('/search', bindingCargo(SearchRequest), (req: Request, res: Response) => {
    // 3. Access the transformed data with the correct types
    const searchParams = getCargo<SearchRequest>(req)

    res.json({
        message: 'Search parameters transformed successfully!',
        data: searchParams,
        // Verify the type of the transformed data
        sortByType: typeof searchParams.sortBy,
        tagsType: typeof searchParams.tags,
        firstTag: searchParams.tags?.[0], // Access the first element of the array
    })
})

/*
To test this endpoint, send a GET request to /search.

Example request URL:
http://localhost:3000/search?sortBy=TITLE&tags=typescript, javascript ,node
*/
```

## Output Example

When the example request URL is accessed, the `bindingCargo` middleware processes the query parameters. The `@transform` decorators then normalize the `sortBy` value to a lowercase string and parse the comma-separated `tags` string into an array. The `getCargo` function returns an object with these transformed values.

```json
{
    "message": "Search parameters transformed successfully!", 
    "data": {
        "sortBy": "title", 
        "tags": [
            "typescript",
            "javascript",
            "node"
        ]
    },
    "sortByType": "string",
    "tagsType": "object",
    "firstTag": "typescript"
}
```
