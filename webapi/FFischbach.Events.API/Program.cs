using FFischbach.Events.API.AutoMapper;
using FFischbach.Events.API.Data;
using FFischbach.Events.API.Services;
using FFischbach.Events.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json.Converters;
using Serilog;
using System.Reflection;
using System.Security.Claims;

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
                configuration.Enrich.FromLogContext();
                configuration.WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3} ({RequestId} {TraceId})] {Message:lj}{NewLine}{Exception}");
                if (context.HostingEnvironment.IsDevelopment())
                {
                    configuration.MinimumLevel.Debug();
                }
                else
                {
                    configuration.MinimumLevel.Information();
                    configuration.WriteTo.Seq("https://ffischbach-events-seq-ingest.palzone.de", apiKey: builder.Configuration["Seq:ApiKey"]);
                }
            });
            #endregion Logging

            #region Authentication
            // Add services to the container.
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.Authority = builder.Configuration["Auth0:Authority"];
                    options.Audience = builder.Configuration["Auth0:Audience"];
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        NameClaimType = ClaimTypes.NameIdentifier
                    };
                });
            #endregion Authentication

            #region Routing
            builder.Services.AddControllers()
                .AddNewtonsoftJson(options =>
                    {
                        options.SerializerSettings.Converters.Add(new StringEnumConverter());
                        options.SerializerSettings.DateTimeZoneHandling = Newtonsoft.Json.DateTimeZoneHandling.Utc;
                    });
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

                c.AddSecurityDefinition("oauth2", new OpenApiSecurityScheme
                {
                    Type = SecuritySchemeType.OAuth2,
                    Flows = new OpenApiOAuthFlows
                    {
                        AuthorizationCode = new OpenApiOAuthFlow
                        {
                            AuthorizationUrl = new Uri($"{builder.Configuration["Auth0:Authority"]}authorize"),
                            TokenUrl = new Uri($"{builder.Configuration["Auth0:Authority"]}oauth/token"),
                            Scopes = new Dictionary<string, string>
                            {
                                { "access", "Full access" }
                            }
                        }
                    }
                });

                c.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "oauth2"
                            }
                        },
                        new[] { "access" }
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
            builder.Services.AddAutoMapper(
                cfg => cfg.LicenseKey = builder.Configuration["AutoMapper:LicenseKey"],
                typeof(AutoMapperProfile)
            );
            #endregion AutoMapper

            #region HealthChecks
            builder.Services.AddHealthChecks()
                .AddDbContextCheck<DatabaseContext>();
            #endregion HealthChecks

            #region Cors
            builder.Services.AddCors();
            #endregion Cors

            #region Services
            builder.Services.AddScoped<ICategoryService, CategoryService>();
            builder.Services.AddScoped<IEventService, EventService>();
            builder.Services.AddScoped<IEmailService, EmailService>();
            builder.Services.AddScoped<IEventManagerService, EventManagerService>();
            builder.Services.AddScoped<IGroupService, GroupService>();
            builder.Services.AddScoped<IParticipantService, ParticipantService>();
            builder.Services.AddScoped<IUserService, UserService>();
            #endregion Services

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
                c.RoutePrefix = "swagger";
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "FFischbach.Events.API");
                c.OAuthClientId(builder.Configuration["Auth0:SwaggerClientId"]);
                c.OAuthUsePkce();
                c.OAuthScopeSeparator(" ");
                
                // Auth0 requires the "audience" param to issue a proper API access token (not just an ID token) — 
                // this isn't part of the OpenAPI OAuthFlow spec, so it has to be injected as an additional query param
                c.OAuthAdditionalQueryStringParams(new Dictionary<string, string>
                {
                    { "audience", builder.Configuration["Auth0:Audience"] }
                });
            });
            #endregion Swagger

            #region Exception Handler Middleware
            app.UseExceptionHandler(a => a.Run(async context =>
            {
                var exceptionHandlerPathFeature = context.Features.Get<IExceptionHandlerPathFeature>();
                var exception = exceptionHandlerPathFeature?.Error;

                var problem = new ProblemDetails
                {
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
