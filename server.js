express = require('express')
const app = express()
const server = require('http').Server(app)
const { SocketAddress } = require('net')
const {v4: uuid} = require('uuid') //will do the job of generating room uuid so that many people may use the same port
const {ExpressPeerServer} = require('peer')
const p2pserver = ExpressPeerServer(server,{
    debug: true
})
app.set('view engine','ejs')
app.use('/peerjs',p2pserver)
app.use(express.static('public')) //serving the files from the server kyuki kaun script leke baithega
const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    }
  })
app.get('/',(req, res)=>
{
   res.redirect(`/${uuid()}`) //redirect user to random room and then that giy can share link may implement in front end
})

app.get('/:roomuuid',(req,res)=>
{
    //console.log(`hi ${req.params.roomuuid}`)  checked uuid works refer docs once more before submission
    res.render('room', {room_uuid : req.params.roomuuid}) //gotta pass the room id to the front end 
})

// A note for maintaining my sanity in future
// So basicallly what is happening over here is that the momemnt the user is redirected to the room we are making
// that id available in the front end logic via ejs and then we generate the event that a new user just joined 
// the room and here we wait for the socket connection and the backend server is just there for mainly facilitating
// these connections

io.on('connection',(socket)=>
{
    socket.on('newuserjoined',(roomuuid,pid,username)=>
    {
        //console.log("Testsocket")
        //console.log("new user with " + username)
        users[socket.id]=username
        socket.join(roomuuid)
        socket.broadcast.to(roomuuid).emit('joinevent',pid,username) //https://socket.io/docs/v3/rooms/index.html docs for future reference 
    })

    socket.on('send',(roomuuid,username,messagesent)=>
    {
        //console.log('Message recieved by the server' + messagesent)
        socket.broadcast.to(roomuuid).emit('incoming',`${username} : ${messagesent}`,username)
    })

    socket.on('disconnect',(socid)=>
    {
        delete users[socid]
    })

    socket.on('userl',(temp,roomuuid)=>
    {
        socket.broadcast.to(roomuuid).emit('ul',temp)
    })
})

//chat ki koshish

const users={}




server.listen(5000)
