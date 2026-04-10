import { createExpressApp } from './setup/index.js'
import { AuthorizationCode, type UserInfo } from 'gammait'
import session from 'express-session'

const app = createExpressApp()

app.use(session({ secret: 'my secret', cookie: { maxAge: 60000 } }))

// Tell TypeScript that our session may contain user info
declare module 'express-session' {
    interface SessionData {
        user: UserInfo | null
    }
}

app.get('/', (req, res) => {
    res.render('home')
})

const clientId = process.env.CLIENT_ID!
const clientSecret = process.env.CLIENT_SECRET!
const redirectUri = process.env.REDIRECT_URI!

const client = new AuthorizationCode({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri,
    scope: ['openid', 'profile'],
})

app.get('/login', (req, res) => {
    const authorizationUrl = client.authorizeUrl()

    res.redirect(authorizationUrl)
})

app.get('/callback', async (req, res) => {
    const code = req.query['code']
    if (!code) {
        res.render('error', { message: 'Missing authorization code' })
        return
    }

    await client.generateToken(String(code))
    const userInfo: UserInfo = await client.userInfo()

    // Store user info in session
    req.session.regenerate(err => {
        if (err) {
            res.render('error', { message: 'Failed to regenerate session' })
            return
        }

        req.session.user = userInfo

        req.session.save(err => {
            if (err) {
                res.render('error', { message: 'Failed to save session' })
            } else {
                res.redirect('/user')
            }
        })
    })
})

app.get('/user', (req, res) => {
    const user = req.session.user
    if (!user) {
        res.redirect('/')
        return
    }
    res.render('user', { name: user.nickname })
})

app.get('/logout', (req, res) => {
    req.session.user = null
    req.session.save(err => {
        if (err) {
            res.render('error', { message: 'Failed to save session' })
            return
        }

        req.session.regenerate(err => {
            if (err) {
                res.render('error', { message: 'Failed to regenerate session' })
                return
            }

            res.redirect('/')
        })
    })
})

const port = process.env.PORT ?? 8000
app.listen(port, () => {
    console.log(`Listening on port ${port} at http://localhost:${port}`)
})
