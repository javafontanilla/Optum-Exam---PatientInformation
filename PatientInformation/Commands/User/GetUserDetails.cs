using Dapper;
using MediatR;
using PatientInformationHelper.Commands;
using PatientInformationHelper.Models;

namespace PatientInformation.Commands.User
{
    public class GetUserDetails : IRequest<ResponseMessage>
    {
        public string id = "";
    }

    public class GetUserDetailsHandler : IRequestHandler<GetUserDetails, ResponseMessage>
    {
        private readonly Repository _repo;
        private readonly Logs _log;

        public GetUserDetailsHandler(Repository repo, Logs log)
        {
            _repo = repo;
            _log = log;
        }

        public async Task<ResponseMessage> Handle(GetUserDetails request, CancellationToken cancellationToken)
        {
            var dbparams = new DynamicParameters();
            dbparams.Add("userid", request.id);

            var res = await _repo.GetJsonPathListAsync<UserAccountDetails>("SPGetUserAccount", dbparams);

            var data = res.FirstOrDefault();

            return (new ResponseMessage { StatusCode = 200, Message = "Message", Data = data });
        }
    }
}
