using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientInformationHelper.Commands
{
    public class Logs
    {
        private static ILogger _log;

        public static void ConfigureLogger(ILogger log)
        {
            _log = log;
        }

        public void LogError(string _logs)
        {
            _log?.LogError($"{DateTimeHelper.GetPhilippineDateTime()} : {_logs}");
        }

        public void Log(string _logs)
        {
            _log?.LogInformation($"{DateTimeHelper.GetPhilippineDateTime()} : {_logs}");
        }
        public string GetCurrentMethodName()
        {
            // Get the current method name using the StackTrace
            var stackTrace = new System.Diagnostics.StackTrace();
            var methodBase = stackTrace.GetFrame(1).GetMethod();
            return methodBase.Name;
        }
    }
}
