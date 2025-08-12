using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace WebsocketServer.Middleware
{
    public class WebSocketServerMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly WebSocketServerConnectionManager _manager;

        public WebSocketServerMiddleware(RequestDelegate next, WebSocketServerConnectionManager manager)
        {
            _next = next;
            _manager = manager;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            if (context.WebSockets.IsWebSocketRequest)
            {
                WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();
                Console.WriteLine("Websocket connected.");

                string connId = _manager.AddSocket(webSocket);
                await SendConnIdAsync(webSocket, connId);

                await ReceiveMessageAsync(webSocket, async (result, buffer) =>
                {
                    if (result.MessageType == WebSocketMessageType.Text)
                    {
                        var message = Encoding.UTF8.GetString(buffer, 0, result.Count);

                        Console.WriteLine("Message received.");
                        Console.WriteLine($"Message: {message}");

                        await RouteJSONMMessage(message);
                        return;
                    }
                    else if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine("Received close message.");
                        return;
                    }
                });
            }
            else
            {
                // await context.Response.WriteAsync("Hello from the 2nd request delegate.");
                await _next(context);
            }
        }

        private async Task ReceiveMessageAsync(WebSocket socket, Action<WebSocketReceiveResult, byte[]> handleMessage)
        {
            var buffer = new byte[1024 * 4];

            while (socket.State == WebSocketState.Open)
            {
                var result = await socket.ReceiveAsync(buffer: new ArraySegment<byte>(buffer), cancellationToken: CancellationToken.None);

                handleMessage(result, buffer);
            }
        }

        private async Task SendConnIdAsync(WebSocket socket, string connId)
        {
            var buffer = Encoding.UTF8.GetBytes("Connection ID: " + connId);
            await socket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }

        private async Task RouteJSONMMessage(string jsonMessage)
        {
            var routeObj = JsonSerializer.Deserialize<dynamic>(jsonMessage);
            var message = Encoding.UTF8.GetBytes(routeObj.GetProperty("Message").GetString());
            var recipient = routeObj.GetProperty("To").GetString();

            if (Guid.TryParse(recipient, out Guid guidOutput))
            {
                var socket = _manager.GetAllSockets().FirstOrDefault(s => s.Key == recipient);

                if (socket.Value == null)
                {
                    Console.WriteLine("Invalid recipient");
                    return;
                }
                
                if (socket.Value.State == WebSocketState.Open)
                    await socket.Value.SendAsync(message, WebSocketMessageType.Text, true, CancellationToken.None);
            }
            else
            {
                Console.WriteLine("Broadcasting message...");

                foreach (var socket in _manager.GetAllSockets())
                {
                    if (socket.Value.State == WebSocketState.Open)
                        await socket.Value.SendAsync(message, WebSocketMessageType.Text, true, CancellationToken.None);
                }
            }
        }
    }
}