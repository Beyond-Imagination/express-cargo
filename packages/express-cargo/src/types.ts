export type Source = 'body' | 'query' | 'uri' | 'header' | 'session'

export type CargoFieldMetadata = {
    key: string | symbol
    source: Source
    validators: ValidatorRule[]
}

type ValidatorFunction = (value: any) => boolean
export type ValidatorRule = {
    type: string
    validate: ValidatorFunction
    message: string
}
