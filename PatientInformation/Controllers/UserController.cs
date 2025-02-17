using MediatR;
using Microsoft.AspNetCore.Mvc;
using PatientInformation.Commands.User;
using PatientInformationHelper.Commands;
using PatientInformationHelper.Models;

namespace PatientInformation.Controllers
{
    public class UserController : Controller
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _config;
        private readonly IMediator _mediator;
        private readonly Logs _log;
        private readonly Repository _repo;

        public UserController(IWebHostEnvironment environment, IConfiguration config, IMediator mediator, Logs log, Repository repo)
        {
            _environment = environment;
            _mediator = mediator;
            _repo = repo;
            _config = config;
            _log = log;
        }

        public IActionResult Index()
        {
            ViewBag.UserIndex = "activeMenu";
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> GetAll(int draw, int start, int length, string search)
        {
            try
            {
                var page = (start / length) + 1;
                var res = await _mediator.Send(new GetAllUser { pageIndex = page, pageSize = length });
                var data = (clsUserAccount)res.Data;
                var totalRecords = data.TotalRecords;
                var totalRecordsAfterFilter = length;
                return Json(new
                {
                    draw = draw,
                    recordsTotal = totalRecords,
                    recordsFiltered = totalRecords,
                    data = data.UserAccount
                });
            }
            catch (Exception ex)
            {
                return Json(new { error = "An error occurred while processing the request." });
            }
        }

        [HttpGet]
        public async Task<UserAccountDetails> GetDetails(string id)
        {
            var data = (UserAccountDetails)(await _mediator.Send(new GetUserDetails { id = id })).Data;
            return data == null ? new UserAccountDetails() : data;
        }

        [HttpPost]
        public async Task<ResponseMessage> SaveInsert(UserAccountDetails data)
        {
            var res = await _mediator.Send(new CreateNewUser { user = data });

            return res;
        }

        [HttpPost]
        public async Task<ResponseMessage> SaveUpdate(UserAccountDetails data)
        {
            var res = await _mediator.Send(new UpdateUserDetails { user = data });

            return res;
        }

        [HttpPost]
        public async Task<ResponseMessage> DeleteUser(string id)
        {
            var res = await _mediator.Send(new DeleteUser { id = id });

            return res;
        }

    }
}
