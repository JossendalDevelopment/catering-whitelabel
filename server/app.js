import express from 'express'
import path from 'path'
import favicon from 'serve-favicon'
import logger from 'morgan'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import ejwt from 'express-jwt'
import config from 'config'
import conn from './lib/conn'
import publicRouter from './routes/public'
import privateRouter from './routes/private'
import clientRouter from './routes/client'

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const port = 'process.env.PORT'
// Set up Express middlewares
// After placing favicon, uncomment favicon import and usage
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

server.listen(port || 3001, () => {
  console.log('listening on port ' + port)
})

//socket section

// let namespace = io.of('/orders')
let idList = []
let emitAuth = false

// io.on('connection', (socket) => {
 

//   socket.on('order', order => {
//     console.log('idList',idList)
//     console.log('received order of',order.cart)
//     // const truckId = order[0].itemTruckId
//     // idList.filter(listItem => listItem.id == order.cart[0].itemTruckId)
//     idList.map((id, i) => {
//       if (id.id == order.cart[0].itemTruckId) {

//         console.log("Socket Connected, sent through socket : " +id.socketId)
//         // io.sockets.connected[id.socketId].emit('order', {order, emitAuth})
//         // socket.broadcast.to(id.socketId).emit('order', {order, emitAuth})
//         // io.to(id.socketId).emit('order', {order, emitAuth})
//         socket.to(id.socketId).emit('order', order)
//         // socket.emit('order', order)
//         // io.sockets.sockets(id.socketId).emit('order', {order, emitAuth})

//         const sql=`
//           INSERT INTO  orders (userId, itemName, itemPrice, itemType, itemDescription, truckId)
//           VALUES (?, ?, ?, ?, ?, ?)
//         `
//         conn.query(sql, [order.cart[i].id, order.cart[i].itemName, order.cart[i].itemPrice, order.cart[i].ItemType, order.cart[i].itemDescription, order.cart[i].itemTruckId, order.cart[i].truckUserName], (err, results, fields) => {

//         })
//       } else {
//         emitAuth = false
//         console.log('failed to emit')
//       }
//     })
//   })
//   socket.on('create truck', id => {
//     id.socketId = socket.id //name has truck id and socket.id
//     console.log('creating truck: ',id)
//     idList.push(id)
//   })

//   socket.on('disconnect', () => {
//     console.log('user disconnected')
//     // socket.removeAllListeners('order');
//     // socket.removeAllListeners('disconnect');
//     // io.removeAllListeners('connection');
//   })
// })


//constinually checks for newly active trucks
setInterval(() => {
  const sql = `
    SELECT id, timeopen, timeclose FROM trucks
  `
  conn.query(sql, (err, results, fields) => {   
     
    results.map((truck, i) => {
      
      let rightNow = new Date()
      if(truck.timeopen !== null) {
        var timeopen = new Date(truck.timeopen)
        var timeclose = new Date(truck.timeclose)
        if (timeopen < rightNow && timeclose > rightNow) {
          const sqlUpdate = `
            UPDATE trucks SET isActive = ? WHERE id = ?
          `
          conn.query(sqlUpdate, [true, results[i].id], (err2, results2, fields2) => {

          })
        } else {
          const sqlUpdate = `
            UPDATE trucks SET isActive = ? WHERE id = ?
          `
          conn.query(sqlUpdate, [false, results[i].id], (err3, results3, fields3) => {
            
          })
        }
      }  
    })
  })
}, 5000) 

app.use('/api', publicRouter)
app.use('/api', ejwt({secret: config.get('jwt-secret')}), privateRouter)


// Client needs to be the last route handled
// ALL OTHER EXPRESS ROUTES GO ABOVE THIS LINE
app.use('/', clientRouter)

app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
      error: err
    })
  })
}

if (app.get('env') === 'production') {
  app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.json({
      message: 'Oops. Our bad.'
    })
  })
}

export default app
