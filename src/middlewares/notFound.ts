import type { RequestHandler } from 'express'
import { StatusCodes } from 'http-status-codes'

export const notFound: RequestHandler = (req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: `API not found: ${req.method} ${req.originalUrl}`,
        errorSources: [
            {
                path: req.originalUrl,
                message: 'The requested endpoint does not exist',
            },
        ],
    })
}