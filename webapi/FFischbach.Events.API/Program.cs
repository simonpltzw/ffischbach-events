using FFischbach.Events.API.Data;
using FFischbach.Events.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Serilog;
using System.Reflection;

namespace FFischbach.Events.API
{
    /// <summary>
    /// Program.
    /// </summary>
    public class Program
    {
        /// <summary>
        /// Good old main.
        /// </summary>
        /// <param name="args"></param>
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
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(c =>
            {
                c.AddSecurityDefinition("msid", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.OAuth2,
                    Flows = new Microsoft.OpenApi.Models.OpenApiOAuthFlows
                    {
                        Implicit = new Microsoft.OpenApi.Models.OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri("https://login.microsoftonline.com/a21b658e-30c5-4bc5-8409-1729b686c215/oauth2/v2.0/authorize"),
                            Scopes = new Dictionary<string, string>
                            {
                                { "api://ee995dcc-a9ec-4203-93ea-81b5f8621033/access_as_user", "access_as_user" }
                            }
                        }
                    }
                });

                c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "msid" }
                        },
                        new [] { "api://ee995dcc-a9ec-4203-93ea-81b5f8621033/access_as_user" }
                    }
                });

                // Set the comments path for the Swagger JSON and UI.
                var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                c.IncludeXmlComments(xmlPath);
            });

            builder.Services.AddDbContext<DatabaseContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

            builder.Services.AddAutoMapper(typeof(AutoMapperProfile));

            builder.Services.AddHealthChecks()
                .AddDbContextCheck<DatabaseContext>();

            builder.Services.AddCors(x => x.AddDefaultPolicy(c =>
            {
                c.AllowAnyOrigin();
                c.AllowAnyMethod();
                c.AllowAnyHeader();
            }));

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(c =>
                {
                    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FFischbach.Events.API");
                    c.OAuthClientId("979c1c0e-193c-4bb7-8024-c24c493b2e41");
                });
            }

            app.UseExceptionHandler(a => a.Run(async context =>
            {
                var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
                var exception = exceptionHandlerPathFeature?.Error;

                var problem = new ProblemDetails { 
                    Title = "An unexpected error occured.", 
                    Detail = exception?.Message, 
                    Status = 500 
                };

                await context.Response.WriteAsJsonAsync(problem);
            }));

            app.UseHttpsRedirection();

            app.UseAuthentication();

            app.UseAuthorization();

            app.UseCors();

            app.MapControllers();

            app.MapHealthChecks("/health");

            app.Run();
        }
    }
}
