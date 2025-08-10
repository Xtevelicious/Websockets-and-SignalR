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
    }
    else
    {
        // await context.Response.WriteAsync("Hello from the 2nd request delegate.");
        await next();
    }
});

// app.Run(async context => await context.Response.WriteAsync("Hello from the 3rd request delegate."));

app.Run();
