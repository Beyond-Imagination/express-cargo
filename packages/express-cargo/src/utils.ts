export function isDeepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true

    const stack: [any, any][] = [[obj1, obj2]]
    while (stack.length > 0) {
        const [a, b] = stack.pop()!

        if (a === b) continue
        if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
            return false
        }

        // Handle Date objects specifically
        if (a instanceof Date && b instanceof Date) {
            if (a.getTime() !== b.getTime()) return false
            continue
        }

        // Check if both are arrays or neither (for accuracy and performance)
        const isArrayA = Array.isArray(a)
        const isArrayB = Array.isArray(b)
        if (isArrayA !== isArrayB) return false

        const keysA = Object.keys(a)
        const keysB = Object.keys(b)
        if (keysA.length !== keysB.length) return false

        for (const key of keysA) {
            if (!Object.prototype.hasOwnProperty.call(b, key)) return false
            stack.push([a[key], b[key]])
        }
    }

    return true
}
