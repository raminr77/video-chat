const toastOption = {
    error: {
        style: {
            main: {
                'color': "#fff",
                'max-width': "200px",
                'box-shadow': 'unset',
                'background': "#f44336",
            },
        },
    },
    success: {
        style: {
            main: {
                'color': "#fff",
                'max-width': "200px",
                'box-shadow': 'unset',
                'background': "#43A047",
            },
        },
    }
}

// Document Elements
const grid = document.querySelector('.video-grid')
const copyBtn = document.querySelector('.js-copy')
const startCallTime = document.querySelector('.start-call')
const callDuration = document.querySelector('.call-duration')

// Local Video
const video = document.createElement('video')
video.style.borderColor = '#fff'
video.muted = true

// Socket
const socket = io('/')

// PeerJS Config
const myPeer = new Peer(undefined, {
    host: '/',
    port: '8001'
})
const peers = {}
myPeer.on('open', id => {
    socket.emit('join-room', ROOM_ID, id)
})

// Set Date Time
const d = new Date()
callDuration.innerHTML = ` 00:00:00`
startCallTime.innerHTML = ` ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`


// Main Function ( first: Get User Perm )
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    // Append User Video
    appendVideo(video, stream)

    // Answer Call And Append
    myPeer.on('call', call => {
        call.answer(stream)
        const video = document.createElement('video')
        call.on('stream', userVideoStream => {
            appendVideo(video, userVideoStream)
        })
    })

    // Connect To New User
    socket.on('user-connected', userId => {
        iqwerty.toast.toast('A new user has joined.' , toastOption.success)
        connectToNewUser(userId, stream)
    })

    // Close Call After Left User
    socket.on('user-disconnected', userId => {
        if (peers[userId]) {
            iqwerty.toast.toast('User Left !' , toastOption.error)
            peers[userId].close()
        }
    })

}).catch(error => console.log('Get User Media Error :', error))


// Append User Video To The Room List
function appendVideo(video, stream) {
    video.srcObject = stream
    video.addEventListener('loadedmetadata', () => video.play())
    grid.appendChild(video)
}

// Connect Or Close Calls
function connectToNewUser(userId, stream) {
    const call = myPeer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        appendVideo(video, userVideoStream)
    })
    call.on('close', () => video.remove())
    peers[userId] = call
}

// Copy Room Link
copyBtn.addEventListener('click', () => {
    var copyText = document.querySelector(".roomId")
    copyText.select()
    copyText.setSelectionRange(0, 99999)
    document.execCommand("copy")
    copyText.blur()
    iqwerty.toast.toast('Copied' , toastOption.success)
})

// Call Counter
let h = 0
let m = 0
let s = 0
setInterval(() => {
    s++
    if(s > 59){
        s = 0
        m++
    }
    if(m > 59){
        m = 0
        h++
    }
    let H = h.toString().length === 1 ? '0' + h : h
    let M = m.toString().length === 1 ? '0' + m : m
    let S = s.toString().length === 1 ? '0' + s : s
    callDuration.innerHTML = ` ${H}:${M}:${S}`
} , 1000)