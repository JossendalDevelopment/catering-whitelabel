import express from 'express'
import jwt from 'jsonwebtoken'
import config from 'config'
import conn from '../lib/conn'
import sha512 from 'js-sha512'

const router = express.Router() 

router.get('/api', (req, res, next) => {
    console.log('working')
    res.send('working')
})


router.get('/truckprofile', (req, res, next) => {
  // const username = store.getState().login.username----must set username here and delete const below & must move to private routes
  const username = 'food'
  const sql = `
  SELECT * 
  FROM trucks 
  WHERE username = ?
  `
  conn.query(sql, username, (err, results, fields) => {
    const companyname = results[0].companyname
    const aboutus = results[0].aboutus
    const menuurl = results[0].menuurl
    const truckpic = results[0].truckpicurl
    
    res.json({
        companyname,
        aboutus,
        menuurl,
        truckpic
    })
  })

})

router.get('/userprofile', (req, res, next) => {
    // const username = store.getState().login.username----must set username here and delete const below & must move to private routes
    const username = 'johnny5'

    const sql = `
    SELECT * 
  FROM users 
  WHERE username = ?
    `

    conn.query(sql, username, (err, results, fields) => {
        const username = results[0].username
        res.json({
            username
        })
    })


})





router.post('/registration', (req, res, next) => {
    const username = req.body.username
    const password = sha512(req.body.password)
    const email = req.body.email
    const sql = `
            SELECT count(1) as count FROM users WHERE username=? 
            UNION SELECT count(1) as count FROM trucks WHERE username=?
        `

    conn.query(sql, [username,username], (err, results, fields) => {

        if(results.map(res => res.count).indexOf(1) !== -1){
            console.log('username taken')
            res.status(409).json({
                message: "Username already taken"
            })
        } else {

            if (req.body.type === "user") {
                const token = jwt.sign({user: username}, config.get('jwt-secret'))

                const insertSql = `
                    INSERT INTO users (username, password, email) VALUES (?,?,?)
                `
                conn.query(insertSql, [username, password, email], (err2, results2, fields2) =>{
                    res.json({
                        message: "User Created",
                        token: token,
                        user: username,
                        email: email
                    })
                })
            }

            if (req.body.type === "truck"){
                const token = jwt.sign({user: username}, config.get('jwt-secret'))

                const companyname = req.body.typedata.companyName
                const companylogo = req.body.typedata.companyLogo
                const menuurl = req.body.typedata.menu
                const aboutus = req.body.typedata.aboutus

                const insertSql = `
                    INSERT INTO trucks (username, password, email, companyname, companylogo, menuurl, aboutus) VALUES (?,?,?,?,?,?,?)
                `

                conn.query(insertSql, [username, password, email, companyname, companylogo, menuurl, aboutus], (err2, results2, fields2) =>{
                    res.json({
                        message: "Truck Created",
                        token: token,
                        user: username,
                        email: email
                    })
                })
            }
        }
    })
})


router.post('/login', (req, res, next) => {
    const username = req.body.username
    const password = sha512(req.body.password)
    // const password = req.body.username

    const sql = `SELECT username, companyname, menuurl, aboutus, lon, lat, tempaddress, datecreated FROM trucks as truckInfo WHERE username = ? AND password = ? 
                 UNION
                 SELECT username, Null as companyname, Null as menuurl, Null as aboutus, Null as lon, Null as lat, Null as tempaddress, Null as datecreated FROM users as userInfo WHERE username = ? AND password = ?
                `
    conn.query(sql, [username, password, username, password], (err, results, fields) => {
      // console.log('login results ' + JSON.stringify(results))
        if(results.length > 0) {
            console.log('username and password returned match')
            const token = jwt.sign({user: username}, config.get('jwt-secret'))
            res.json({
                message: "Login Successful",
                token: token,
                user: username, //username also attached to token
            })
        } else {
            res.status(401).json({
                message: "Bad Username and/or Password"
            })
        }
    })
})

export default router
// module.exports = router
