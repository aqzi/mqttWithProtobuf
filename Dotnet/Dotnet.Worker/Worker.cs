using Dotnet.Mqtt;
using MQTTnet.Client;
using Google.Protobuf;

namespace Dotnet.Worker;

public class Worker(IMqttService mqttService, ILoggerFactory loggerFactory, AppSettings appSettings, IMqttRegistry mqttRegistry) : BackgroundService
{
    private readonly ILogger<Worker> logger = loggerFactory.CreateLogger<Worker>();
    private readonly IMqttService mqttService = mqttService;
    private readonly AppSettings appSettings = appSettings;
    private readonly IMqttRegistry mqttRegistry = mqttRegistry;


    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        InitializeMqtt(stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            if (logger.IsEnabled(LogLevel.Information))
            {
                logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
            }
            await Task.Delay(1000, stoppingToken);
        }
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        try
        {
            mqttService.StopAsync().Wait();
        }
        catch (Exception ex)
        {
            logger.LogError($"Err in StopAsync: {ex.Message}");
        }

        return Task.CompletedTask;
    }

    private async void InitializeMqtt(CancellationToken stoppingToken)
    {
        logger.LogInformation($"MQTT: connecting to {appSettings.Mqtt!.Host}");
        mqttService.OnMessageReceived += OnMqttMessageReceived;
        mqttService.OnConnected += OnMqttConnected;
        mqttService.OnDisconnect += OnMqttDisconnect;

        await mqttService.StartAsync(stoppingToken);
    }

    private void OnMqttDisconnect(object? sender, EventArgs e)
    {
        //send disconnect info if needed
    }

    private void OnMqttConnected(object? sender, EventArgs e)
    {
        mqttService.Subscribe(mqttRegistry.GetAllSubscriptions());

        //send connect info if needed
    }

    private void OnMqttMessageReceived(object? sender, MqttApplicationMessageReceivedEventArgs e)
    {
        var arrTopic = e.ApplicationMessage.Topic.Split('/');

        Console.WriteLine($"Received: {e.ApplicationMessage.Topic}");
        string messageTypeName = arrTopic[^1];
        string actorId = arrTopic[^2];

        if (mqttRegistry.TryGetParser(messageTypeName, out MessageParser? parser) && parser != null)
        {
            var message = parser.ParseFrom(e.ApplicationMessage.PayloadSegment);

            if(mqttRegistry.TryGetHandlers(e.ApplicationMessage.Topic, out List<IMqttHandler>? handlers) && handlers != null)
            {
                foreach (var handler in handlers)
                {
                    handler.OnMessageReceive(e.ApplicationMessage.Topic, message);
                }
            }
        }
    }
}
