using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PatientInformationHelper.Models
{
    public class clsUserAccount
    {
        public int TotalRecords { get; set; }
        public List<UserAccount> UserAccount { get; set; }
    }

    public class UserAccountDetails : UserAccount
    {
        public List<UserModuleAccess> modules { get; set; }
    }

    public class UserAccount
    {
        public string userId { get; set; }
        public string userName { get; set; }
        public string password { get; set; }
        public string userType { get; set; }
    }
    public class UserModuleAccess
    {
        public string UserAccessID { get; set; }
        public string UserId { get; set; }
        public string ModuleAccess { get; set; }
    }
}
