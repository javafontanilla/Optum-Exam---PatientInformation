using Dapper;
using MediatR;
using PatientInformationHelper.Commands;
using PatientInformationHelper.Models;

namespace PatientInformation.Commands.User
{
    public class UpdateUserDetails : IRequest<ResponseMessage>
    {
        public UserAccountDetails user;
    }

    public class UpdateUserDetailsHandler : IRequestHandler<UpdateUserDetails, ResponseMessage>
    {
        private readonly Repository _repo;
        private readonly Logs _log;

        public UpdateUserDetailsHandler(Repository repo, Logs log)
        {
            _repo = repo;
            _log = log;
        }

        public async Task<ResponseMessage> Handle(UpdateUserDetails request, CancellationToken cancellationToken)
        {
            try
            {
                var dbparams = new DynamicParameters();
                dbparams.Add("UserID", request.user.userId);
                dbparams.Add("NewPassword", request.user.password);
                dbparams.Add("UserType", request.user.userType);

                var data = _repo.Insert<string>("SPUpdateUserAccount", dbparams);

                return (new ResponseMessage { StatusCode = 200, Message = "Message", Data = data });
            }
            catch (Exception ex)
            {
                return (new ResponseMessage { StatusCode = 500, Message = ex.Message, Data = null });
            }

        }
    }
}
