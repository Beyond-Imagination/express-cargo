# Transformation Decorator

Express-Cargo provides a decorator to automatically transform incoming request data before binding it to a class. This is useful for tasks such as normalizing user input (e.g., converting a string to lowercase) or parsing a comma-separated string into an array.

Unlike virtual fields, which combine existing fields to create a new one, this transformation decorator directly modifies the value of a single field.

## `@Transform<T>(transformer: (value: T) => T)`

This is the primary decorator for data transformation. It takes a transformer function that receives the raw value from the request and returns the new, transformed value for the field.

- `transformer`: A function that accepts the raw value and returns the transformed value.

## Usage Example

This example demonstrates how the `@Transform` decorator can be used to normalize and process request data into a desired format. This is highly useful for handling diverse user inputs and ensuring that your API processes them consistently, which improves the stability of your application.

```typescript
import express, { Request, Response } from 'express'
import { bindingCargo, getCargo, Query, Transform } from 'express-cargo'

// 1. Define a class with data processing and normalization rules
class SearchRequest {
    // Transforms the 'sortBy' query parameter to lowercase for consistent sorting
    @Query()
    @Transform((value: string) => value.toLowerCase())
    sortBy!: string

    // Doubles the 'count' query parameter value
    @Query()
    @Transform((value: number) => value * 2)
    count!: number
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
        countType: typeof searchParams.count,
        doubleCount: searchParams.count,
    })
})

/*
To test this endpoint, send a GET request to /search.

Example request URL:
http://localhost:3000/search?sortBy=TITLE&tags=typescript, javascript ,node
*/
```

## Output Example

When the example request URL is accessed, the `bindingCargo` middleware processes the query parameters. The `@Transform` decorators then normalize the `sortBy` value to a lowercase string and double the `count` value. The `getCargo` function returns an object with these transformed values.

```json
{
    "message": "Search parameters transformed successfully!", 
    "data": {
        "sortBy": "title",
        "count": 10
    },
    "sortByType": "string",
    "countType": "number",
    "doubleCount": 10
}
```
