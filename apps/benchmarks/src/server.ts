import { app } from './app'

const port = Number(process.env.PORT ?? 3001)
if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${process.env.PORT}`)
}

app.listen(port, '127.0.0.1', () => {
    console.log(`Benchmark server listening on http://127.0.0.1:${port}`)
})
