export type Source = 'body' | 'query' | 'uri' | 'header' | 'session'

export type CargoFieldMetadata = {
    key: string | symbol
    source: Source
}
