import { Body, Header, Params, Query, Request, Session, UploadedFile, UploadedFiles, Uri } from '../../src'
import { expectViolation, validateCargoSchema } from './testUtils'

// The internal source key (`'body'`, `'file'`, …) drives binding; violation messages must
// quote the decorator as the user authored it. `@UploadedFile` is the case a naive
// capitalisation of the source key would get wrong.
const SOURCE_DECORATORS: [string, (key?: string) => PropertyDecorator][] = [
    ['Body', Body],
    ['Query', Query],
    ['Params', Params],
    ['Header', Header],
    ['Session', Session],
    ['UploadedFile', UploadedFile],
    ['UploadedFiles', UploadedFiles],
]

describe('schema validation — source decorator naming', () => {
    it.each(SOURCE_DECORATORS)('reports @%s as authored, not its internal source key', (name, source) => {
        class SourceWithRequestDto {
            @source()
            @Request(req => req.ip)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(SourceWithRequestDto), 'foo', `@${name} cannot be combined with @Request`)
    })

    it('names both sources when two are combined', () => {
        class MultipleSourcesDto {
            @Body()
            @Query()
            foo!: string
        }

        expectViolation(() => validateCargoSchema(MultipleSourcesDto), 'foo', '@Query + @Body cannot be combined; pick a single source')
    })

    it('names the source in the empty-key message', () => {
        class EmptyKeyDto {
            @Header('')
            foo!: string
        }

        expectViolation(() => validateCargoSchema(EmptyKeyDto), 'foo', '@Header key must not be an empty string')
    })

    it('reports @Uri as @Params, the decorator it aliases', () => {
        class UriDto {
            @Uri()
            @Request(req => req.ip)
            foo!: string
        }

        expectViolation(() => validateCargoSchema(UriDto), 'foo', '@Params cannot be combined with @Request')
    })
})
