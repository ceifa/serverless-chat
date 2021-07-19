import './reset.css';
import Peer from 'peerjs';

const $createRoom = document.getElementById('create-room');
const $enterRoom = document.getElementById('enter-room');
const $roomKey = document.getElementById('room-key');
const $name = document.getElementById('name');
const $image = document.getElementById('image');

const onPeerConnection = (conn) => {
    console.log('batata')
    conn.send(JSON.stringify({
        name: $name.value,
        image: $image.value
    }))

    let receivedMetadata = false;
    let chat;

    conn.on('data', function (data) {
        if (!receivedMetadata) {
            const receiver = JSON.parse(data);
            document.body.removeChild(document.body.firstElementChild)
            chat = window.chatEmbed({
                embed: document.body,
                receiver: {
                    ...receiver,
                    preventShrink: true,
                    status: 'online',
                    round: '100%'
                },
                theme: {
                    primaryColor: "#3cb371",
                },
            })

            receivedMetadata = true;

            chat.addReceiver(msg => {
                if (msg.fromUser) {
                    dataChannel.send(msg.content)
                }
            })
        } else {
            chat.send(data)
        }
    });
}

$createRoom.addEventListener('click', async ev => {
    $createRoom.disabled = true;
    $enterRoom.disabled = true;

    const peer = new Peer('ceifa-chat-' + $roomKey.value, { debug: 3 })
    peer.on('connection', conn => onPeerConnection(conn))
});

$enterRoom.addEventListener('click', async ev => {
    $createRoom.disabled = true;
    $enterRoom.disabled = true;

    const peer = new Peer(undefined, { debug: 3 })
    const conn = peer.connect('ceifa-chat-' + $roomKey.value)

    conn.on('open', () => onPeerConnection(conn))
});