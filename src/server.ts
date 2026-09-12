import { Server } from "http"
import { connectRedis } from "./database/redis"
import logger from "./utils/logger"
import app from "./app"
import config from "./config"
import { initSocket } from "./shared/socket.server"
import { startWorkers } from "./workers"

let server: Server | undefined

async function serverFuntion() {
  try {
    await connectRedis()
    logger.info('Redis connected successfully')
    server = app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`)
    })
    initSocket(server)
    await startWorkers()
    logger.info('Socket.IO and workers initialized')
  } catch (error) {
    logger.error('Failed to start server:', error)
    process.exit(1)
  }
}

const gracefulShutdown = (signal: string, exitCode: number) => {
  logger.info(`${signal} received, shutting down gracefully`)
  if (!server) {
    process.exit(exitCode)
    return
  }
  server.close((err) => {
    if (err) {
      logger.error('Error during server close:', err)
      process.exit(1)
    }
    logger.info('Server closed')
    process.exit(exitCode)
  })

  setTimeout(() => {
    logger.error('Forced shutdown: connections did not drain in time')
    process.exit(1)
  }, 10000).unref()
}

const unexpectedErrorHandler = (error: unknown) => {
  logger.error(error)
  gracefulShutdown('unexpectedError', 1)
}

process.on('uncaughtException', unexpectedErrorHandler)
process.on('unhandledRejection', unexpectedErrorHandler)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM', 0))
process.on('SIGINT', () => gracefulShutdown('SIGINT', 0))

serverFuntion()