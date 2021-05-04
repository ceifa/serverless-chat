import './reset.css';
import './index.css';

const RELAY_BASE_LINK = "https://demo.httprelay.io/link/ceifa-chat-";

const peerConnection = new RTCPeerConnection({
    iceServers: [{
        url: "stun:stun.gmx.net"
    }]
}, {
    optional: [{
        DtlsSrtpKeyAgreement: true
    }]
});

let dataChannel, isClient;

const $createRoom = document.getElementById('create-room');
const $enterRoom = document.getElementById('enter-room');
const $roomKey = document.getElementById('room-key');
const $name = document.getElementById('name');
const $image = document.getElementById('image');

const onSetDataChannel = () => {
    dataChannel.onopen = () => {
        dataChannel.send(JSON.stringify({
            name: $name.value,
            image: $image.value
        }))
    }

    let receivedMetadata = false;
    dataChannel.onmessage = async ev => {
        if (!receivedMetadata) {
            const receiver = JSON.parse(ev.data);
            document.body.removeChild(document.body.firstElementChild)
            window.chatEmbed({
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
        }
    }
}

$createRoom.addEventListener('click', async ev => {
    $createRoom.disabled = true;
    $enterRoom.disabled = true;
    isClient = false;

    dataChannel = peerConnection.createDataChannel('chat', {
        reliable: true
    })

    onSetDataChannel();

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer)

    const data = await fetch(RELAY_BASE_LINK + $roomKey.value + "-answer").then(r => r.json());

    const answerDesc = new RTCSessionDescription(JSON.parse(data))
    await peerConnection.setRemoteDescription(answerDesc);
});

peerConnection.onicecandidate = async ev => {
    if (!ev.candidate) {
        const offer = JSON.stringify(peerConnection.localDescription);
        await fetch(RELAY_BASE_LINK + $roomKey.value + (isClient ? '-answer' : '-offer'), {
            method: 'POST',
            body: JSON.stringify(offer)
        })
    }
}


peerConnection.ondatachannel = ev => {
    dataChannel = ev.channel || ev;
    onSetDataChannel();
}

$enterRoom.addEventListener('click', async ev => {
    $createRoom.disabled = true;
    $enterRoom.disabled = true;
    isClient = true;

    const data = await fetch(RELAY_BASE_LINK + $roomKey.value + "-offer").then(r => r.json());

    const offerDesc = new RTCSessionDescription(JSON.parse(data));
    await peerConnection.setRemoteDescription(offerDesc);

    const answerDesc = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDesc);
});