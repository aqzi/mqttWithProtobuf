namespace Dotnet.Mqtt;

public class MqttSettings
{
    public string? Host { get; set; }
    public int Port { get; set; }
    public bool IsTlsEnabled { get; set; }
    public string? User { get; set; }
    public string? Password { get; set; }
    public double RetryIntervalInSec { get; set; }
    public string? ClientId { get; set; }
}