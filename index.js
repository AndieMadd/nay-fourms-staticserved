const express = require('express')
const history = require('connect-history-api-fallback')
const cors = require('cors')
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path')
const router = require(path.join(__dirname, "DBapi", "router.js"))

const app = express()

app.use(cookieParser())
app.use(session({ secret: "mr peeny", resave: false, saveUninitialized: false }))
app.use(express.static("dist"))
app.use(cors())
app.use(express.json())
app.use('/api', router)


app.get('/', (req, res) => {
    res.sendFile('index.html')
})


app.use(history())


const port = process.env.PORT || 8000
app.listen(port, () => { console.log('app listening on port 8000'); })