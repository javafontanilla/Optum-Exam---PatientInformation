using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientInformationHelper.Commands
{
    public static class DateTimeHelper
    {
        public static DateTime GetPhilippineDateTime()
        {
            DateTime pacific = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Taipei Standard Time");
            return pacific;
        }

        public static DateTime GetUTCDateTime() => DateTime.UtcNow;

        public static bool CheckIfDateIsInRange(DateTime From, DateTime To, DateTime ToBeChecked)
        {
            var a = From <= ToBeChecked;
            var b = To >= ToBeChecked;
            return (From <= ToBeChecked && To >= ToBeChecked);
        }

        public static bool Checkif30MinutesAlreadyPassed(DateTime date)
        {
            var dateTimePhilippineTimeNow = GetPhilippineDateTime();
            return date.AddMinutes(30) <= dateTimePhilippineTimeNow;
        }

        public static DateTime AddBusinessDays(this DateTime current, int days)
        {
            var sign = Math.Sign(days);
            var unsignedDays = Math.Abs(days);
            for (var i = 0; i < unsignedDays; i++)
            {
                do
                {
                    current = current.AddDays(sign);
                } while (current.DayOfWeek == DayOfWeek.Saturday ||
                         current.DayOfWeek == DayOfWeek.Sunday);
            }
            return current;
        }
        public static bool IsOnSale(DateTime start, DateTime end)
        {
            return GetPhilippineDateTime() >= start && GetPhilippineDateTime() <= end;
        }
        public static bool IsExpiredSale(DateTime end)
        {
            return GetPhilippineDateTime() > end;
        }


    }
}
