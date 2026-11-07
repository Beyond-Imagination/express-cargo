import type { Request } from 'express'

/** Raw request containers the binder reads field values from. */
export type BindSources = {
    req: Request
    body: any
    query: any
    params: any
    header: any
    session: any
    file: any
}
