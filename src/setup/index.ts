import express, { type Express } from 'express'
import { engine } from 'express-handlebars'
import livereload from 'livereload'
import connectlivereload from 'connect-livereload'

const viewsDir = './src'
const publicDir = './src/public'

export function createExpressApp(): Express {
    const app = express()
    app.use(express.static(publicDir))

    // Create livereload server to reload browser on code change
    const liveReloadServer = livereload.createServer({
        exts: ['hbs', 'css'],
    })
    liveReloadServer.watch([viewsDir, publicDir])
    liveReloadServer.server.once('connection', () => {
        setTimeout(() => {
            liveReloadServer.refresh('/')
        }, 100)
    })
    app.use(connectlivereload())

    // Setup handlebars
    app.engine('hbs', engine({ extname: '.hbs' }))
    app.set('view engine', 'hbs')
    app.set('views', viewsDir)

    return app
}
