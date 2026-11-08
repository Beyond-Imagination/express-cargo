import { z } from 'zod'
import {
    EMAIL_PATTERN,
    MIN_EIGHT_CODE_UNITS_PATTERN,
    MIN_THREE_CODE_UNITS_PATTERN,
    THREE_TO_FIFTY_CODE_UNITS_PATTERN,
} from '../../scenarios/patterns'

// z.coerce would also accept missing values and arrays, so only scalars are converted.
const scalar = z.union([z.string(), z.number(), z.boolean()])
const stringInput = scalar.transform(String)
const numberInput = scalar.transform(Number)

const itemSchema = z.object({
    sku: stringInput.pipe(z.string().regex(MIN_THREE_CODE_UNITS_PATTERN)),
    quantity: numberInput.pipe(z.number().min(1)),
    price: numberInput.pipe(z.number().min(0.01)),
})
export const requestSchema = z.object({
    id: z.coerce.number().min(1),
    active: z.string().transform(value => value === 'true'),
    requestId: z.string().regex(MIN_EIGHT_CODE_UNITS_PATTERN),
    name: stringInput.pipe(z.string().trim().regex(THREE_TO_FIFTY_CODE_UNITS_PATTERN)),
    email: stringInput.pipe(z.string().regex(EMAIL_PATTERN)),
    age: numberInput.pipe(z.number().min(18).max(120)),
    role: z.enum(['admin', 'user']),
    items: z.array(itemSchema).min(1),
})
