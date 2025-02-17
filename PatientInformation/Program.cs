using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PatientInformationHelper.Commands;
using PatientInformationHelper.Models;
using MediatR;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Access configuration
var configuration = builder.Configuration;

// Add services to the container
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

builder.Services.AddControllersWithViews();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie();
builder.Services.AddMvc(options => options.EnableEndpointRouting = false).AddSessionStateTempDataProvider();
builder.Services.AddSession();
builder.Services.AddHttpContextAccessor();
builder.Services.AddSingleton(configuration);
builder.Services.AddHttpClient();
builder.Services.AddScoped<Repository>();
builder.Services.AddScoped<Logs>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();

app.UseCookiePolicy();
app.UseAuthentication();
app.UseAuthorization();

app.UseSession();
app.UseEndpoints(endpoints =>
{
    endpoints.MapControllerRoute(
        name: "default",
        pattern: "{controller=User}/{action=Index}/{id?}");
});

// Configure logger
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("Logging from the main project.");
Logs.ConfigureLogger(logger);

app.Run();
