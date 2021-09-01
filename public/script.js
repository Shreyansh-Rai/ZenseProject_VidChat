//https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
const socket = io("/");
//attempt to get vid running

const myvidfe = document.createElement("video"); //client sees this
myvidfe.muted = true;
const screen = document.getElementById("screen"); //this stuff is the grid
let mystream
let plist = []


navigator.mediaDevices
.getUserMedia({
    video: true,
    audio: true,
})
.then((stream) => {
    mystream = stream;
    addstream(mystream, myvidfe); //assign the video the stream
    socket.on("joinevent", (pid,username) => {
        //console.log("new user with " + username)
        //since we want to respond wit the stream
        //console.log(pid) //works peers are able to connect
        //console.log('joinuserFINALLYworks')
        if(username !== uname)
    {
        const newtext = document.createElement('div')
        newtext.innerText=`${username} has joined the meeting`
        newtext.classList.add('message')
        chatwindow.append(newtext)
    }
        sendstream2p(pid,stream)
    });
    //We also need access to the stream say we recieve the call event then we must also send stream
    
    p.on('call', (call)=>
    {
        //console.log(call.peer)
        call.answer(stream) //give peer your stream in exchange for his (he called)
        const pvid = document.createElement("video")
        //pvid.classList.add(call.peer)
        pvid.setAttribute('id',`${call.peer}`)
        call.on('stream',(stream)=>
        {
            addstream(stream,pvid) //When the stream event gets genereated
        })
    })
}); //a get media gives a promise




const sendstream2p = (pid,stream)=>
{
    const pvidfe = document.createElement('video')
    pvidfe.setAttribute('id',`${pid}`)
    //setting up the peer 
    const call = p.call(pid,stream) //call the guy and send him your feed
    call.on('stream', (stream)=>
    {
        //We get his stream
        addstream(stream,pvidfe)
    })
}




function addstream(mystream, myvidfe) {
    myvidfe.srcObject = mystream;
    myvidfe.addEventListener("loadedmetadata", () => {
        myvidfe.play();
    }); //callbacksetup to display the video if the metadata is loaded
    screen.append(myvidfe);
}

// socket.emit('newuserjoined',roomuuid)

const p = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "5000", //443 for heroku limited use very buggy on host
});



const uname = prompt("Enter your username")
p.on("open", (id) => {
    plist.push(id)
  socket.emit("newuserjoined", roomuuid, id,uname);
  //generate a new user joins event if peer js tells you
});


const textin= document.getElementById('chat_message')
const chatwindow = document.querySelector('.chatwindow')
const form = document.getElementById('messagearea')
const addtext = (mes)=>
{
    const newtext = document.createElement('div')
    newtext.innerText=mes
    newtext.classList.add('message')
    chatwindow.append(newtext)
}

form.addEventListener('submit',(ev)=>
{
    ev.preventDefault()
    const mes= textin.value
    //console.log("message:"+mes)
    addtext(`You: ${mes}`)
    socket.emit('send',roomuuid,uname,mes)
    textin.value=''
})

socket.on('incoming',(mes,uid)=>
{
    if(uid !== uname)
    {
        const newtext = document.createElement('div')
        newtext.innerText=mes
        newtext.classList.add('message')
        chatwindow.append(newtext)
    }
})

socket.on('ul',(un,pidl)=>
{

    //console.log(pidl)
    
    var vfe = document.getElementById(`${pidl}`)
    vfe.remove()
    const newtext = document.createElement('div')
    newtext.innerText=`${un} has left`
    newtext.classList.add('message')
    newtext.classList.add('re')
    chatwindow.append(newtext)
    
})


const bye = ()=>
{
    socket.emit('userl',uname,roomuuid,p.id)
    //console.log(`${p.id}`)
    myvidfe.srcObject=null
    p.destroy()
    //window.close()
}

const micprops= ()=>
{
    const status =mystream.getAudioTracks()[0].enabled 
    if(status)
    {
        mystream.getAudioTracks()[0].enabled = false
        buttonmute()
    }
    else
    {
        mystream.getAudioTracks()[0].enabled=true
        buttonunmute()
    }
}

const webcamprops = ()=>
{
    const status  = mystream.getVideoTracks()[0].enabled
    if(status)
    {
        mystream.getVideoTracks()[0].enabled = false
        hidevid()
    }
    else
    {
        mystream.getVideoTracks()[0].enabled=true
        playvid()
    }
}
const hidevid= ()=>
{
    const change =`<i class="fa fa-eye-slash fa-2x" aria-hidden="true"></i>`
    document.querySelector('.webcam').innerHTML = change
}
const playvid= ()=>
{
    const change =`<i class="fa fa-video-camera fa-2x" aria-hidden="true"></i>`
    document.querySelector('.webcam').innerHTML = change
}
const buttonunmute = () => {
    const change = `
    <i class="fa fa-microphone fa-2x" aria-hidden="true"></i>
    `
    document.querySelector('.mute').innerHTML = change;
  }
  
  const buttonmute = () => {
    const change = `
    <i class="fa fa-microphone-slash fa-2x" aria-hidden="true"></i>
    `
    document.querySelector('.mute').innerHTML = change;
  }
