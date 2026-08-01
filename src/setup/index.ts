import express, { type Express } from 'express'
import { engine } from 'express-handlebars'
import livereload from 'livereload'
import connectlivereload from 'connect-livereload'

const FgRed = '\x1b[31m'
const Reset = '\x1b[0m'

// Load .env file
import dotenv from 'dotenv'
dotenv.config()

// Validate environment variables
const requiredEnvironment = [
    'CLIENT_ID',
    'CLIENT_SECRET',
    'API_KEY_ID',
    'API_KEY_TOKEN',
    'REDIRECT_URI',
] as const

const missingEnvironment = requiredEnvironment.filter(
    envName =>
        typeof process.env[envName] !== 'string' || process.env[envName] === ''
)
if (missingEnvironment.length > 0) {
    console.error(
        FgRed +
            '\n\n' +
            'Detected missing environment variables. Did you create a ' +
            'Gamma client? Follow the guide at ' +
            'https://gamma-docs.olillin.com/website/#creating-a-user-client ' +
            'and fill in the credentials in the .env file.\n\n' +
            'Missing environment variables:\n' +
            `  ${missingEnvironment.join('\n  ')}` +
            '\n\n' +
            Reset
    )

    process.exit(1)
}

// Declare process.env type
type RequiredEnvironment = {
    [k in (typeof requiredEnvironment)[number]]: string
}

declare global {
    namespace NodeJS {
        interface ProcessEnv extends RequiredEnvironment {}
    }
}

// Configure directories
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
