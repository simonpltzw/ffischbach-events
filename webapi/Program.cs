
using FFischbach.Event.API.Data;
using FFischbach.Event.API.Services;
using FFischbach.Event.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Serilog;

namespace FFischbach.Event.API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Host.UseSerilog((context, configuration) =>
            {
                configuration.WriteTo.Console();
                if (context.HostingEnvironment.IsDevelopment()) configuration.MinimumLevel.Debug();
                else configuration.MinimumLevel.Information();
            });

            // Add services to the container.

            // Add database.
            builder.Services.AddDbContext<DatabaseContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Add authorization.
            builder.Services.AddAuthorization();

            // Add auth endpoints.
            builder.Services.AddIdentityApiEndpoints<IdentityUser>()
                .AddEntityFrameworkStores<DatabaseContext>();

            builder.Services.Configure<IdentityOptions>(options =>
            {
                options.SignIn.RequireConfirmedEmail = false;
            });

            // Add health checks.
            builder.Services.AddHealthChecks()
                .AddDbContextCheck<DatabaseContext>();

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1",
                    new Microsoft.OpenApi.Models.OpenApiInfo
                    {
                        Title = "FFischbach.Event.API",
                        Version = "v1",
                        Description = "WebAPI for managing events and participants for Freiwillige Feuerwehr Fischbach.<br/>" +
                            "<h4>Identity</h4>" +
                            "<p>Users are managed using Microsoft's generic authentication endpoints.</p>" +
                            "<p>Use <code>/register</code>, <code>/login</code>, <code>/refresh</code>, <code>/manage/2fa</code>, <code>/manage/info</code> as described <a href='https://learn.microsoft.com/en-us/aspnet/core/security/authentication/identity-api-authorization?view=aspnetcore-8.0#the-mapidentityapituser-endpoints' target='blank'>here</a>.</p>" +
                            "<p>Sending emails does not work for now which means that email confirmation and password resets can not be used.</p>",
                        Contact = new Microsoft.OpenApi.Models.OpenApiContact
                        {
                            Name = "Freiwillige Feuerwehr Fischbach",
                            Url = new Uri("https://www.feuerwehr-fischbach.de/")
                        }
                    });
            });

            // Add custom services.
            builder.Services.AddSingleton<IEncryptionService, EncryptionService>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();

            app.UseAuthorization();


            app.MapControllers();

            app.MapIdentityApi<IdentityUser>();

            app.MapHealthChecks("/health");

            app.Run();
        }
    }
}
