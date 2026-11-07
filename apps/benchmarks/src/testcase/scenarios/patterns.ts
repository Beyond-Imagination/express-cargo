/** Validation patterns every library applies to the scenarios' request values. */

export const EMAIL_PATTERN =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
export const MIN_THREE_CODE_UNITS_PATTERN = /^[\s\S]{3,}$/
export const THREE_TO_FIFTY_CODE_UNITS_PATTERN = /^[\s\S]{3,50}$/
export const MIN_EIGHT_CODE_UNITS_PATTERN = /^[\s\S]{8,}$/
