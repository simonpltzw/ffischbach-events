using FFischbach.Events.API.AutoMapper;
using FFischbach.Events.API.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web;
using Newtonsoft.Json.Converters;
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

            #region Add Services

            #region Logging
            builder.Host.UseSerilog((context, configuration) =>
            {
                configuration.WriteTo.Console();
                if (context.HostingEnvironment.IsDevelopment()) configuration.MinimumLevel.Debug();
                else configuration.MinimumLevel.Information();
            });
            #endregion Logging

            #region Authentication
            // Add services to the container.
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));
            #endregion Authentication

            #region Routing
            builder.Services.AddControllers()
                .AddNewtonsoftJson(options => options.SerializerSettings.Converters.Add(new StringEnumConverter()));
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            #endregion Routing

            #region Swagger
            builder.Services.AddSwaggerGenNewtonsoftSupport();
            builder.Services.AddSwaggerGen(c =>
            {
                c.SupportNonNullableReferenceTypes();

                c.MapType<DateOnly>(() => new Microsoft.OpenApi.Models.OpenApiSchema
                {
                    Type = "string",
                    Format = "date('yyyy-MM-dd')"
                });

                c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "Event-Management Freiwillige Feuerwehr Fischbach",
                    Contact = new Microsoft.OpenApi.Models.OpenApiContact { Email = "ffischbach-events.rhyme209@passmail.net" },
                    Version = "v1"
                });

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
            #endregion Swagger

            #region Database
            builder.Services.AddDbContext<DatabaseContext>(options => options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
            #endregion Database

            #region AutoMapper
            builder.Services.AddAutoMapper(typeof(AutoMapperProfile));
            #endregion AutoMapper

            #region HealthChecks
            builder.Services.AddHealthChecks()
                .AddDbContextCheck<DatabaseContext>();
            #endregion HealthChecks

            #region Cors
            builder.Services.AddCors();
            #endregion Cors

            #endregion Add Services

            var app = builder.Build();

            #region Use Services

            #region Swagger
            // Configure the HTTP request pipeline.
            //if (app.Environment.IsDevelopment())
            //{
            //    app.UseSwagger();
            //    app.UseSwaggerUI(c =>
            //    {
            //        c.SwaggerEndpoint("/swagger/v1/swagger.json", "FFischbach.Events.API");
            //        c.OAuthClientId("979c1c0e-193c-4bb7-8024-c24c493b2e41");
            //    });
            //}
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "FFischbach.Events.API");
                c.OAuthClientId("979c1c0e-193c-4bb7-8024-c24c493b2e41");
            });
            #endregion Swagger

            #region Exception Handler Middleware
            app.UseExceptionHandler(a => a.Run(async context =>
            {
                var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
                var exception = exceptionHandlerPathFeature?.Error;

                var problem = new ProblemDetails { 
                    Title = "Ein unerwarteter Fehler ist aufgetreten.", 
                    Detail = exception?.Message, 
                    Status = 500 
                };

                await context.Response.WriteAsJsonAsync(problem);
            }));
            #endregion Exception Handler Middleware

            #region Https Redirection
            //app.UseHttpsRedirection();
            #endregion Https Redirection

            #region Auth
            app.UseAuthentication();

            app.UseAuthorization();
            #endregion Auth

            #region Cors
            app.UseCors(builder => builder
                .AllowAnyHeader()
                .AllowAnyMethod()
                .SetIsOriginAllowed((host) => true)
                .AllowCredentials()
            );
            #endregion Cors

            #region Routing
            app.MapControllers();

            app.MapHealthChecks("/health");
            #endregion Routing

            #endregion Use Services

            app.Run();
        }
    }
}
