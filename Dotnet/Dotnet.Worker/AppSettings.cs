using Dotnet.Mqtt;

namespace Dotnet.Worker;

public class AppSettings
{
    public MqttSettings? Mqtt { get; set; }
    public string? CorsAllowedOrigins { get; set; }
}