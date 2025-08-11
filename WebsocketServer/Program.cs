using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWebSockets();

app.Use(async (context, next) =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
        Console.WriteLine("Websocket connected.");

        await ReceiveMessage(webSocket, async (result, buffer) =>
        {
            if (result.MessageType == WebSocketMessageType.Text)
            {
                System.Console.WriteLine("Message received.");
                return;
            }
            else if (result.MessageType == WebSocketMessageType.Close)
            {
                System.Console.WriteLine("Received close message.");
                return;
            }
        });
    }
    else
    {
        // await context.Response.WriteAsync("Hello from the 2nd request delegate.");
        await next();
    }
});

async Task ReceiveMessage(WebSocket socket, Action<WebSocketReceiveResult, byte[]> handleMessage)
{
    var buffer = new byte[1024 * 4];

    while (socket.State == WebSocketState.Open)
    {
        var result = await socket.ReceiveAsync(buffer: new ArraySegment<byte>(buffer), cancellationToken: CancellationToken.None);

        handleMessage(result, buffer);
    }
}

// app.Run(async context => await context.Response.WriteAsync("Hello from the 3rd request delegate."));

app.Run();
