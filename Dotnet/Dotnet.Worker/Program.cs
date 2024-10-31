using System.Reflection;
using Dotnet.Mqtt;
using Dotnet.Mqtt.MqttHandlers;
using Dotnet.Worker;

var builder = Host.CreateApplicationBuilder(args);

var appSettings = builder.Configuration.GetSection("AppSettings").Get<AppSettings>() ?? throw new ArgumentException("Please provide AppSettings");

builder.Services.AddSingleton(appSettings);

if (appSettings.Mqtt != null) builder.Services.AddSingleton(appSettings.Mqtt);
builder.Services.AddSingleton<IMqttService, MqttService>();
builder.Services.AddSingleton<IMqttRegistry>(provider => 
{
    var messagesAssembly = Assembly.GetAssembly(typeof(TestHandler));
    var mqttService = provider.GetRequiredService<IMqttService>(); 

    return new MqttRegistry(messagesAssembly, mqttService);
});

builder.Services.AddHostedService<Worker>();

var host = builder.Build();
host.Run();
