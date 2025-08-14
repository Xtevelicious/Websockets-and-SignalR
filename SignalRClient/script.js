let connectionUrl = document.getElementById("connectionUrl");
let stateLabel = document.getElementById("stateLabel");
let connectButton = document.getElementById("connectButton");
let closeButton = document.getElementById("closeButton");
let sendMessage = document.getElementById("sendMessage");
let sendButton = document.getElementById("sendButton");
let connId = document.getElementById("connIDLabel");
let recipients = document.getElementById("recipients");
let commsLog = document.getElementById("commsLog");

connectionUrl.value = "http://localhost:5166/chatHub";

const hubConnection = new signalR.HubConnectionBuilder().withUrl(connectionUrl.value).build();

connectButton.onclick = function () {
    stateLabel.innerHTML = "Attempting to connect...";

    hubConnection.start().then(function (event) {
        updateState();
        commsLog.innerHTML += 
            `<tr>
                <td colspan="3">Connection opened.</td>
            </tr>`;
    });

    // socket.onmessage = function (event) {
    //     if(isConnId(event.data)) {
    //         connId.innerHTML = event.data;
    //         return;
    //     }
    //     commsLog.innerHTML += 
    //         `<tr>
    //             <td colspan="3"><b>Message Received: </b>${htmlEscape(event.data)}</td>
    //         </tr>`;
    // };
};

closeButton.onclick = function () { 
    if(!hubConnection || hubConnection.state !== signalR.HubConnectionState.Connected)
        alert("Hub not already connected.");

    hubConnection.stop().then(function () {
        console.debug("Stop request sent.");
    });
};

hubConnection.onclose(function (event) {
    updateState();
    commsLog.innerHTML += 
            `<tr>
                <td colspan="3">Connection stoppped.</td>
            </tr>`;
});

hubConnection.on("ReceiveConnId", function (connid) {
    connId.innerHTML = `Connection ID: ${connid}`;
});

hubConnection.on("ReceiveMessage", function(message) {
    let jsonMessage = JSON.parse(message);
    commsLog.innerHTML += 
            `<tr>
                <td colspan="3"><b>Message Received: </b>${htmlEscape(jsonMessage.Message)}</td>
            </tr>`;
});

sendButton.onclick = function () {
    let data = constructJSON();

    hubConnection.invoke("SendMessageAsync", data);

    commsLog.innerHTML += "Message sent!"
            // `<tr>
            //     <td>Server</td>
            //     <td>Client</td>
            //     <td>${htmlEscape(data)}</td>
            // </tr>`;
};

function constructJSON() {
    return JSON.stringify({
        "From": connId.innerHTML.substring(15, connId.innerHTML.length),
        "To": recipients.value,
        "Message": sendMessage.value
    });
}

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

    if(!hubConnection)
        disable();
    else {
        switch (hubConnection.state) {
            case signalR.HubConnectionState.Disconnected:
                stateLabel.innerHTML = "Disconnected";
                connId.innerHTML = "Connection ID: N/A";
                disable();
                connectionUrl.disabled = false;
                connectButton.disabled = false;
                break;
            
            case signalR.HubConnectionState.Connecting:
                stateLabel.innerHTML = "Connecting...";
                disable();
                break;

            case signalR.HubConnectionState.Connected:
                stateLabel.innerHTML = "Connected";
                enable();
                break;

            default:
                stateLabel.innerHTML = `Unknown socket state: ${htmlEscape(hubConnection.state)}`;
                disable();
                break;

        }
    }
}