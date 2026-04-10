import { createExpressApp } from './setup/index.js'

const app = createExpressApp()

app.get('/', (req, res) => {
    res.render('template', { name: 'Gamma Quickstart' })
})

const port = process.env.PORT ?? 8000
app.listen(port, () => {
    console.log(`Listening on port ${port} at http://localhost:${port}`)
})
