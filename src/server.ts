import app from './app'
import { Config } from './config'
import logger from './config/logger'

const startServer = () => {
    const PORT = Config.PORT

    try {
        app.listen(PORT, () => {
            logger.info('Server Listening on port', { port: PORT })
        })
    } catch (error) {
        process.exit(1)
    }
}

startServer()
