let connectionUrl = document.getElementById("connectionUrl");
let stateLabel = document.getElementById("stateLabel");
let connectButton = document.getElementById("connectButton");
let closeButton = document.getElementById("closeButton");
let sendMessage = document.getElementById("sendMessage");
let sendButton = document.getElementById("sendButton");
let connId = document.getElementById("connIDLabel");
let recipients = document.getElementById("recipients");
let commsLog = document.getElementById("commsLog");

connectionUrl.value = "ws://localhost:5000";

connectButton.onclick = function () {
    stateLabel.innerHTML = "Attempting to connect...";
    socket = new WebSocket(connectionUrl.value);

    socket.onopen = function (event) {
        updateState();
        commsLog.innerHTML += 
            `<tr>
                <td colspan="3">Connection opened.</td>
            </tr>`;
    };

    socket.onclose = function (event) {
        updateState();
        commsLog.innerHTML += 
            `<tr>
                <td colspan="3">Connection closed. Code: ${htmlEscape(event.code)} Reason: ${htmlEscape(event.reason)}</td>
            </tr>`;
    };

    socket.onerror = updateState();

    socket.onmessage = function (event) {
        commsLog.innerHTML += 
            `<tr>
                <td>Server</td>
                <td>Client</td>
                <td>${htmlEscape(event.data)}</td>
            </tr>`;
    };
};

closeButton.onclick = function () {
    if(!socket || socket.readyState !== WebSocket.OPEN)
        alert("Socket not already connected.");

    socket.close(1000, "Closing from client.");
};

sendButton.onclick = function () {
    if(!socket || socket.readyState !== WebSocket.OPEN)
        alert("Socket not connected.");

    let data = sendMessage.value;
    commsLog.innerHTML += 
            `<tr>
                <td>Server</td>
                <td>Client</td>
                <td>${htmlEscape(data)}</td>
            </tr>`;
};

function htmlEscape (str) {
    return str.toString()
     .replace(/&/g, '&amp;')
     .replace(/"/g, '&quot;')
     .replace(/'/g, '&#39;')
     .replace(/</g, '&lt;')
     .replace(/>/g, '&gt;');
}

function updateState () {
    function disable () {
        sendButton.disabled = true;
        sendMessage.disabled = true;
        closeButton.disabled = true;
        recipients.disabled = true;
    }

    function enable () {
        sendButton.disabled = false;
        sendMessage.disabled = false;
        closeButton.disabled = false;
        recipients.disabled = false;
    }

    connectButton.disabled = true;
    connectionUrl.disabled = true;

    if(!socket)
        disable();
    else {
        switch (socket.readyState) {
            case WebSocket.CLOSED:
                stateLabel.innerHTML = "Closed";
                connId.innerHTML = "Connection ID: N/A";
                disable();
                connectionUrl.disabled = false;
                connectButton.disabled = false;
                break;
            
            case WebSocket.CLOSING:
                stateLabel.innerHTML = "Closing...";
                disable();
                break;

            case WebSocket.OPEN:
                stateLabel.innerHTML = "Open";
                enable();
                break;

            default:
                stateLabel.innerHTML = `Unknown socket state: ${htmlEscape(socket.readyState)}`;
                disable();
                break;

        }
    }
}