const express = require('express')
const { OAuth2Client } = require('google-auth-library');
const Database = require('sqlite-async')
const path = require('path');
const { create } = require('domain');



const client = new OAuth2Client("897864354621-rqs8e9er3647tn3g6d2n0ecmulfkn28f.apps.googleusercontent.com");
const router = express.Router()
let db


Database.open(path.join(__dirname, 'database', 'database.db')).then(newDB => db = newDB).catch(err => console.error())

//Function to verify google login. uses google OAuth library
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: "897864354621-rqs8e9er3647tn3g6d2n0ecmulfkn28f.apps.googleusercontent.com",
    });
    const payload = ticket.getPayload();
    return {
        email: payload['email'],
        fullName: payload['name'],
        image_url: payload['picture'],
        gID: payload['sub']
    }
}


//Gets all the forums. is listed as a POST because GET requests wouldn't work with the router
router.post('/forums', async (req, res) => {
    let results = await db.all('SELECT * FROM forums')
    results.splice(0, 1)
    res.json(results)
})

//Gets all the posts from a specified forum.
router.post('/forum/:tok', async (req, res) => {
    const token = req.params.tok
    let { id } = await db.get(`select id from forums where token = ?`, [token])
    let posts = await db.all(`select posts.*, users.name from posts inner join users on posts.id_users = users.id where posts.id_forums = ?`, [id])
    res.json(posts)
})

router.post('/login', async (req, res) => {
    console.log(req.session);
    const auth_token = req.body.token
    const acc = await verify(auth_token)
    let user = await db.get(`select * from users where gID = ?`, [acc.gID])
    if (!user) {
        await db.run(`insert into users (name, email, pfp_url, gID) values(?, ?, ? ,?)`, [acc.fullName, acc.email, acc.image_url, acc.gID])
        user = await db.get('select * from users where id = last_insert_rowid()')
    }
    userId = user.id
    req.session.userID = userId


    return res.status(200).json({ name: user.name, pfp: user.pfp_url })
})

router.post('/addPost', async (req, res) => {
    const { title, content, forum } = req.body
    const userId = req.session.userID
    const timeCreated = Date.now()
    const { id } = await db.get('select id from forums where token = ?', [forum])
    await db.run('insert into posts (title, content, id_forums, id_users, timeCreated) values(?,?,?,?,?)', [title, content, id, userId, timeCreated])
    res.status(204).json({})
})

module.exports = router