using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Formatter;
using Microsoft.Extensions.Logging;

namespace Dotnet.Mqtt;

public enum MqttAction
{
    STATE,
    COMMAND,
    EVENT
}

public interface IMqttService
{
    event EventHandler<MqttApplicationMessageReceivedEventArgs>? OnMessageReceived;
    event EventHandler? OnConnected;
    event EventHandler? OnDisconnect;

    Task StartAsync(CancellationToken stoppingToken);
    Task StopAsync();

    Task Publish(MqttAction action, string target, string actorId, string messageType, byte[] bytes);

    void Subscribe(List<string> topics);
}

public class MqttService : IMqttService
{
    private readonly MqttSettings settings;
    private readonly ILogger<MqttService> logger;
    private IMqttClient? mqttClient;

    public MqttService(MqttSettings settings, ILogger<MqttService> logger)
    {
        this.settings = settings;
        this.logger = logger;

        if (settings == null)
        {
            throw new Exception("Missing appSettings.Mqtt");
        }

        if (string.IsNullOrEmpty(settings.Host))
        {
            logger.LogError("Missing appSettings.Mqtt.Host");
        }
    }

    public event EventHandler<MqttApplicationMessageReceivedEventArgs>? OnMessageReceived;
    public event EventHandler? OnConnected;
    public event EventHandler? OnDisconnect;

    [Obsolete] //TODO: fix this
    public async Task StartAsync(CancellationToken stoppingToken)
    {
        var factory = new MqttFactory();
        var optionsBuilder = new MqttClientOptionsBuilder()
            .WithTcpServer(settings.Host, settings.Port)
            .WithCredentials(settings.User, settings.Password)
            .WithClientId($"{settings.ClientId}-{DateTimeOffset.Now.ToUnixTimeSeconds()}")
            .WithKeepAlivePeriod(TimeSpan.FromSeconds(5))
            .WithProtocolVersion(MqttProtocolVersion.V500);

        if (settings.IsTlsEnabled == true)
        {
            MqttClientOptionsBuilderTlsParameters parameters = new()
            {
                AllowUntrustedCertificates = true,
                UseTls = true,
                IgnoreCertificateChainErrors = true,
                IgnoreCertificateRevocationErrors = true
            };

            optionsBuilder = optionsBuilder.WithTls(parameters);
        }

        var options = optionsBuilder.Build();


        mqttClient = factory.CreateMqttClient();
        logger.LogInformation("### ATTEMPTING MQTT CONNECTION ###");

        mqttClient.ConnectedAsync += e => 
        {
            logger.LogInformation("### CONNECTED WITH MQTT SERVER ###");

            OnConnected?.Invoke(this, new EventArgs());

            logger.LogInformation("### SUBSCRIBED ###");

            return Task.CompletedTask;
        };

        mqttClient.DisconnectedAsync += async e => 
        {
            logger.LogError("### DISCONNECTED FROM MQTT SERVER ###");

            await Task.Delay(TimeSpan.FromSeconds(settings.RetryIntervalInSec));

            try
            {
                await mqttClient.ConnectAsync(options, stoppingToken);
            }
            catch
            {
                logger.LogError("### RECONNECTING MQTT FAILED ###");
            }
        };

        mqttClient.ApplicationMessageReceivedAsync += e => {
            OnMessageReceived?.Invoke(this, e);
            return Task.CompletedTask;
        };

        await mqttClient.ConnectAsync(options, stoppingToken);
    }

    public async Task StopAsync()
    {
        OnDisconnect?.Invoke(this, new EventArgs());
        await mqttClient.DisconnectAsync();
    }

    public async Task Publish(MqttAction action, string target, string actorId, string messageType, byte[] bytes)
    {
        if (mqttClient != null && mqttClient.IsConnected)
        {
            try
            {
                var msg = new MqttApplicationMessageBuilder()
                    .WithTopic($"{action.ToString().ToLower()}/{target}/{actorId}/{messageType}")
                    .WithPayload(bytes)
                    .WithQualityOfServiceLevel(MQTTnet.Protocol.MqttQualityOfServiceLevel.AtLeastOnce)
                    .WithRetainFlag()
                    .Build();

                Console.WriteLine($"Sending:... {action}/{target}/{actorId}/{messageType}");

                await mqttClient.PublishAsync(msg);
            }
            catch (Exception e)
            {
                this.logger.LogError($"Mqtt Send {action.ToString().ToLower()}/{target}/{actorId}/{messageType} failed: {e.Message}");
            }
        }
    }

    public void Subscribe(List<string> topics)
    {
        if (mqttClient != null && mqttClient.IsConnected)
        {
            var subscriptionBuilder = new MqttClientSubscribeOptionsBuilder();

            foreach (var topic in topics)
            {
                subscriptionBuilder.WithTopicFilter(topic);
            }

            mqttClient.SubscribeAsync(subscriptionBuilder.Build());
        }
    }
}