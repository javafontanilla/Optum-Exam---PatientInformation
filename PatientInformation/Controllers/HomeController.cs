using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;

namespace PatientInformation.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly IWebHostEnvironment _env;

        public HomeController(ILogger<HomeController> logger, IWebHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }

        public IActionResult Index()
        {
            ViewBag.HomeIndex = "activeMenu";
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.SignOutAsync();
            return RedirectToAction("Index", "Home");
        }
    }
}
