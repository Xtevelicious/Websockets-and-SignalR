using System.Text.Json;
using Microsoft.AspNetCore.SignalR;

namespace SignalRServer.Hubs
{
    public class ChatHub : Hub
    {
        public override Task OnConnectedAsync()
        {
            var connId = Context.ConnectionId;
            System.Console.WriteLine("Connection Established: " + connId);
            Clients.Client(connId).SendAsync("ReceiveConnId", connId);
            
            return base.OnConnectedAsync();
        }

        public async Task SendMessageAsync(string jsonMessage)
        {
            var routeObj = JsonSerializer.Deserialize<dynamic>(jsonMessage);
            var recipientId = routeObj.GetProperty("To").GetString();

            if (string.IsNullOrEmpty(recipientId))
                await Clients.All.SendAsync("ReceiveMessage", jsonMessage);
            else
                await Clients.Client(recipientId).SendAsync("ReceiveMessage", jsonMessage);
        }
    }
}