export type SourceKey = 'cargo:body' | 'cargo:query' | 'cargo:uri' | 'cargo:header' | 'cargo:session'

export const bodyKey: SourceKey = 'cargo:body'
export const queryKey: SourceKey = 'cargo:query'
export const uriKey: SourceKey = 'cargo:uri'
export const headerKey: SourceKey = 'cargo:header'
export const sessionKey: SourceKey = 'cargo:session'

export const sourceKeys: SourceKey[] = [bodyKey, queryKey, uriKey, headerKey, sessionKey]

export type FieldMetadata = {
    property: string | symbol
    key: string | symbol
}
