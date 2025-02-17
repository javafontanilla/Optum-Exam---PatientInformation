using Dapper;
using MediatR;
using PatientInformationHelper.Commands;
using PatientInformationHelper.Models;

namespace PatientInformation.Commands.User
{
    public class CreateNewUser : IRequest<ResponseMessage>
    {
        public UserAccountDetails user;
    }

    public class CreateNewUserHandler : IRequestHandler<CreateNewUser, ResponseMessage>
    {
        private readonly Repository _repo;
        private readonly Logs _log;

        public CreateNewUserHandler(Repository repo, Logs log)
        {
            _repo = repo;
            _log = log;
        }

        public async Task<ResponseMessage> Handle(CreateNewUser request, CancellationToken cancellationToken)
        {
            try
            {
                var dbparams = new DynamicParameters();
                dbparams.Add("UserName", request.user.userName);
                dbparams.Add("Password", request.user.password);
                dbparams.Add("UserType", request.user.userType);

                var data = _repo.Insert<string>("SPInsertUserAccount", dbparams);

                return (new ResponseMessage { StatusCode = 200, Message = "Message", Data = data });
            }
            catch (Exception ex)
            {
                return (new ResponseMessage { StatusCode = 500, Message = ex.Message, Data = null });
            }

        }
    }
}
