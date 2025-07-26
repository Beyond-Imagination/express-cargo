const config = require(`./.swcrc.esm.json`)

module.exports = {
    transform: {
        '^.+\\.(t|j)sx?$': ['@swc/jest', { ...config }],
    },
}
