using System.Net.WebSockets;
using WebsocketServer.Middleware;

var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseWebSockets();
app.UseWebSocketServer();

// Just to show that HTTP request also works
app.Run(async context => await context.Response.WriteAsync("Hello from the 3rd request delegate."));

app.Run();
