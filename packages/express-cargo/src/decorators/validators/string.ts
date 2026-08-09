import { CargoErrorMessage, HashAlgorithm, IsUrlOptions, TypedPropertyDecorator, UuidVersion } from '../../types'
import { ValidatorRule } from '../../validatorRule'
import { isValidPhoneNumber, CountryCode } from 'libphonenumber-js'
import { addValidator } from './addValidator'

/**
 * Checks if the string contains the specified substring.
 * @param seed - The substring to search for.
 * @param message - Optional custom error message.
 */
export function Contains(seed: string, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'contains',
                val => typeof val === 'string' && val.includes(seed),
                message || `${String(propertyKey)} must contain ${seed}`,
            ),
        )
    }
}

/**
 * Checks if the string starts with the specified prefix.
 * @param prefixText - The prefix string.
 * @param message - Optional custom error message.
 */
export function Prefix(prefixText: string, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'prefix',
                val => typeof val === 'string' && val.startsWith(prefixText),
                message || `${String(propertyKey)} must start with ${prefixText}`,
            ),
        )
    }
}

/**
 * Checks if the string ends with the specified suffix.
 * @param suffixText - The suffix string.
 * @param message - Optional custom error message.
 */
export function Suffix(suffixText: string, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey) => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'suffix',
                val => typeof val === 'string' && val.endsWith(suffixText),
                message || `${String(propertyKey)} must end with ${suffixText}`,
            ),
        )
    }
}

/**
 * Checks if the string length matches the specified value.
 * @param value - The exact length required.
 * @param message - Optional custom error message.
 */
export function Length(value: number, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'length',
                (val: any) => typeof val === 'string' && val.length === value,
                message || `${String(propertyKey)} must be ${value} characters`,
            ),
        )
    }
}

/**
 * Checks if the string length is less than or equal to the maximum.
 * @param max - The maximum length allowed.
 * @param message - Optional custom error message.
 */
export function MaxLength(max: number, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'maxLength',
                (val: any) => typeof val === 'string' && val.length <= max,
                message || `${String(propertyKey)} must not exceed ${max} characters`,
            ),
        )
    }
}

/**
 * Checks if the string length is greater than or equal to the minimum.
 * @param min - The minimum length allowed.
 * @param message - Optional custom error message.
 */
export function MinLength(min: number, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'minLength',
                (val: any) => typeof val === 'string' && val.length >= min,
                message || `${String(propertyKey)} must be at least ${min} characters`,
            ),
        )
    }
}

/**
 * Checks if the string matches the specified regular expression.
 * @param pattern - The regular expression to match against.
 * @param message - Optional custom error message.
 */
export function Regexp(pattern: RegExp, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'regexp',
                (value: unknown) => typeof value === 'string' && pattern.test(value),
                message || `${String(propertyKey)} does not match pattern ${pattern}`,
            ),
        )
    }
}

/**
 * Checks if the string is a valid email address.
 * @param message - Optional custom error message.
 */
export function Email(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        const DEFAULT_EMAIL_PATTERN =
            /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'email',
                (value: unknown) => typeof value === 'string' && DEFAULT_EMAIL_PATTERN.test(value),
                message || `${String(propertyKey)} should be email format`,
            ),
        )
    }
}

const ALPHA_PATTERN = /^[a-zA-Z]+$/

/**
 * Checks if the string contains only alphabetic characters.
 * @param message - Optional custom error message.
 */
export function Alpha(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'alpha',
                (value: unknown) => typeof value === 'string' && ALPHA_PATTERN.test(value),
                message || `${String(propertyKey)} should be alphabetic`,
            ),
        )
    }
}

const uuidPatterns = {
    all: /^[0-9a-f]{8}-[0-9a-f]{4}-[1345][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v1: /^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v3: /^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    v5: /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
}

/**
 * Checks if the string is a valid UUID.
 * @param version - The UUID version to check against ('v1', 'v3', 'v4', 'v5', or 'all').
 * @param message - Optional custom error message.
 */
export function Uuid(version?: UuidVersion, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    let regex: RegExp
    let versionLabel: string

    const v = version ? version.replace('v', '') : 'all'

    switch (v) {
        case '1':
            regex = uuidPatterns.v1
            versionLabel = 'v1'
            break
        case '3':
            regex = uuidPatterns.v3
            versionLabel = 'v3'
            break
        case '4':
            regex = uuidPatterns.v4
            versionLabel = 'v4'
            break
        case '5':
            regex = uuidPatterns.v5
            versionLabel = 'v5'
            break
        default:
            regex = uuidPatterns.all
            versionLabel = 'v1, v3, v4, or v5'
    }

    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'uuid',
                (value: unknown) => typeof value === 'string' && regex.test(value),
                message || `${String(propertyKey)} must be a valid UUID format (${versionLabel})`,
            ),
        )
    }
}

/**
 * Checks if the string contains only alphanumeric characters.
 * @param message - Optional custom error message.
 */
export function Alphanumeric(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'alphanumeric',
                (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9]+$/.test(value),
                message || `${String(propertyKey)} should be alphanumeric`,
            ),
        )
    }
}

/**
 * Checks if the string contains only uppercase characters.
 * @param message - Optional custom error message.
 */
export function IsUppercase(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isUppercase',
                (value: unknown) => typeof value === 'string' && value.toUpperCase() === value,
                message || `${String(propertyKey)} should be uppercase`,
            ),
        )
    }
}

const JWT_PATTERN = /^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/

/**
 * Checks if the string is a valid JSON Web Token (JWT).
 * @param message - Optional custom error message.
 */
export function IsJwt(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isJwt',
                (value: unknown) => typeof value === 'string' && JWT_PATTERN.test(value),
                message || `${String(propertyKey)} should be a valid JWT`,
            ),
        )
    }
}

/**
 * Checks if the string is a valid phone number for the given region.
 * If no region is provided, validates as an international number (must include country code).
 * @param region - Optional ISO 3166-1 alpha-2 region code (e.g., 'KR', 'US').
 * @param message - Optional custom error message.
 */
export function IsPhoneNumber(region?: CountryCode, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isPhoneNumber',
                (value: unknown) => typeof value === 'string' && isValidPhoneNumber(value, region),
                message || `${String(propertyKey)} must be a valid phone number${region ? ` for ${region}` : ''}`,
            ),
        )
    }
}

/**
 * Checks if the string is a valid IANA timezone identifier.
 * @param message - Optional custom error message.
 */
export function IsTimeZone(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isTimeZone',
                (value: unknown) => {
                    if (typeof value !== 'string') return false
                    try {
                        Intl.DateTimeFormat(undefined, { timeZone: value })
                        return true
                    } catch {
                        return false
                    }
                },
                message || `${String(propertyKey)} must be a valid IANA timezone`,
            ),
        )
    }
}

const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i

/**
 * Checks if the string is a valid hex color code.
 * Supports #RGB, #RGBA, #RRGGBB, #RRGGBBAA formats.
 * @param message - Optional custom error message.
 */
export function IsHexColor(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isHexColor',
                (value: unknown) => typeof value === 'string' && HEX_COLOR_PATTERN.test(value),
                message || `${String(propertyKey)} should be a hex color code`,
            ),
        )
    }
}

const HEX_PATTERN = /^(0x)?[0-9a-fA-F]+$/i

/**
 * Checks if the string is a valid hexadecimal number.
 * @param message - Optional custom error message.
 */
export function IsHexadecimal(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isHexadecimal',
                (value: unknown) => typeof value === 'string' && HEX_PATTERN.test(value),
                message || `${String(propertyKey)} should be a hexadecimal number`,
            ),
        )
    }
}

const hashPatterns: Record<HashAlgorithm, RegExp> = {
    md5: /^[0-9a-f]{32}$/i,
    sha1: /^[0-9a-f]{40}$/i,
    sha256: /^[0-9a-f]{64}$/i,
    sha384: /^[0-9a-f]{96}$/i,
    sha512: /^[0-9a-f]{128}$/i,
    crc32: /^[0-9a-f]{8}$/i,
    crc32b: /^[0-9a-f]{8}$/i,
}

/**
 * Checks if the string is a valid hash for the specified algorithm.
 * Supported algorithms: md5, sha1, sha256, sha384, sha512, crc32, crc32b.
 * @param algorithm - The hash algorithm to validate against.
 * @param message - Optional custom error message.
 */
export function IsHash(algorithm: HashAlgorithm, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    const pattern = hashPatterns[algorithm]
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isHash',
                (value: unknown) => typeof value === 'string' && pattern.test(value),
                message || `${String(propertyKey)} should be a valid ${algorithm} hash`,
            ),
        )
    }
}

/**
 * Checks if the string is a valid URL.
 * @param options - Optional configuration (e.g., allowed protocols).
 * @param message - Optional custom error message.
 */
export function IsUrl(options?: IsUrlOptions, message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    const protocols = options?.protocols ?? ['http', 'https', 'ftp']
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isUrl',
                (value: unknown) => {
                    if (typeof value !== 'string') return false
                    try {
                        const url = new URL(value)
                        const protocol = url.protocol.replace(/:$/, '')
                        return protocols.includes(protocol)
                    } catch {
                        return false
                    }
                },
                message || `${String(propertyKey)} should be a valid URL`,
            ),
        )
    }
}

/**
 * Checks if the string contains only lowercase characters.
 * @param message - Optional custom error message.
 */
export function IsLowercase(message?: CargoErrorMessage): TypedPropertyDecorator<string> {
    return (target, propertyKey): void => {
        addValidator(
            target,
            propertyKey,
            new ValidatorRule(
                propertyKey,
                'isLowercase',
                (value: unknown) => typeof value === 'string' && value.toLowerCase() === value,
                message || `${String(propertyKey)} should be lowercase`,
            ),
        )
    }
}
