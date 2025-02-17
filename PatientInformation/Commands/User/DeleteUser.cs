using Dapper;
using MediatR;
using PatientInformationHelper.Commands;
using PatientInformationHelper.Models;

namespace PatientInformation.Commands.User
{
    public class DeleteUser : IRequest<ResponseMessage>
    {
        public string id = "";
    }

    public class DeleteUserHandler : IRequestHandler<DeleteUser, ResponseMessage>
    {
        private readonly Repository _repo;
        private readonly Logs _log;

        public DeleteUserHandler(Repository repo, Logs log)
        {
            _repo = repo;
            _log = log;
        }

        public async Task<ResponseMessage> Handle(DeleteUser request, CancellationToken cancellationToken)
        {
            try
            {
                var dbparams = new DynamicParameters();
                dbparams.Add("userid", request.id);

                var res = _repo.Execute("SPDeleteUser", dbparams);

                return (new ResponseMessage { StatusCode = 200, Message = "Message", Data = res });
            }
            catch (Exception ex)
            {

                return (new ResponseMessage { StatusCode = 500, Message = ex.Message, Data = null });
            }

        }
    }
}
