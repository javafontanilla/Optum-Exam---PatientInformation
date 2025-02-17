using Dapper;
using MediatR;
using PatientInformationHelper.Commands;
using PatientInformationHelper.Models;
using System.Data;

namespace PatientInformation.Commands.User
{
    public class GetAllUser : IRequest<ResponseMessage>
    {
        public int pageIndex;
        public int pageSize;
        public string filterBy = "";
        public string filter = "";
    }

    public class GetAllUserHandler : IRequestHandler<GetAllUser, ResponseMessage>
    {
        private readonly Repository _repo;
        private readonly Logs _log;

        public GetAllUserHandler(Repository repo, Logs log)
        {
            _repo = repo;
            _log = log;
        }

        public async Task<ResponseMessage> Handle(GetAllUser request, CancellationToken cancellationToken)
        {
            var dbparams = new DynamicParameters();
            dbparams.Add("pageIndex", request.pageIndex);
            dbparams.Add("pageSize", request.pageSize);
            dbparams.Add("totalCount", dbType: DbType.Int32, direction: ParameterDirection.Output);

            var res = await _repo.GetAll<UserAccount>("SPGetAllUserAccount", dbparams);
            var total = dbparams.Get<int>("totalCount");

            var data = new clsUserAccount();
            data.TotalRecords = total;
            data.UserAccount = (List<UserAccount>)res;

            return (new ResponseMessage { StatusCode = 200, Message = "Message", Data = data });
        }
    }
}
