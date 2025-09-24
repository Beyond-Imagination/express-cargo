import { Request, Response } from 'express'

export function makeMockReq(options: Partial<Request> = {}): Request {
    return { body: {}, query: {}, params: {}, headers: {}, ...options } as unknown as Request
}

export function makeMockRes(): Response {
    return { status: jest.fn().mockReturnThis(), json: jest.fn().mockReturnThis() } as unknown as Response
}

export function makeNext() {
    return jest.fn()
}
