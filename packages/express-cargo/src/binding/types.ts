import type { Request } from 'express'
import type { CargoClassMetadata } from '../metadata'
import type { CargoFieldError } from '../errors'

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

/** Per-class state threaded through a single binding pass. */
export type BindContext = {
    metaClass: CargoClassMetadata
    targetObject: any
    sources: BindSources
    errors: CargoFieldError[]
    sourceKey: string
}
