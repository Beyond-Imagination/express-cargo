import 'express'

declare global {
    namespace Express {
        interface Request {
            _cargo?: any
            session?: any
        }
    }
}
