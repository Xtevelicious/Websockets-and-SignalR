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
    let socket = new WebSocket(connectionUrl.value);

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
        sendButton.disable = true;
        sendMessage.disable = true;
        closeButton.disable = true;
        recipients.disable = true;
    }

    function enable () {
        sendButton.disable = false;
        sendMessage.disable = false;
        closeButton.disable = false;
        recipients.disable = false;
    }

    connectButton.disable = true;
    connectionUrl.disable = true;

    if(!socket)
        disable();
    else {
        switch (socket.readyState) {
            case WebSocket.CLOSED:
                stateLabel.innerHTML = "Closed";
                connId.innerHTML = "Connection ID: N/A";
                disable();
                connectionUrl.disable = false;
                connectButton.disable = false;
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

        }
    }
}