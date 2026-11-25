using FFischbach.Events.API.Data;
using FFischbach.Events.API.Services.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FFischbach.Events.API.Tests.Infrastructure
{
    /// <summary>
    /// Hosts the real API in memory (no network port) with test replacements for
    /// the database (SQLite in-memory), authentication (header based fake login) and email (recorder).
    /// </summary>
    /// <remarks>One instance is shared by all tests of a test class (see <see cref="ApiTestBase"/>).</remarks>
    public sealed class ApiFactory : WebApplicationFactory<Program>
    {
        private SqliteConnection? _connection;

        /// <summary>
        /// Records every mail the API tries to send.
        /// </summary>
        public FakeEmailService Emails { get; } = new();

        private SqliteConnection Connection => _connection
            ?? throw new InvalidOperationException($"Call {nameof(ResetAsync)} before using the API.");

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            // Program.cs only adds the production Seq log sink outside of "Development".
            builder.UseEnvironment(Environments.Development);

            builder.ConfigureTestServices(services =>
            {
                #region Database
                // Remove the Npgsql registration from Program.cs and use SQLite in-memory instead.
                services.RemoveAll<DbContextOptions<DatabaseContext>>();
                services.RemoveAll<IDbContextOptionsConfiguration<DatabaseContext>>();
                services.AddDbContext<DatabaseContext>(options => options.UseSqlite(Connection));
                #endregion Database

                #region Authentication
                // Replace the Auth0 JWT validation with a fake login (see TestAuthHandler).
                services.AddAuthentication(options =>
                    {
                        options.DefaultScheme = TestAuthHandler.SchemeName;
                        options.DefaultAuthenticateScheme = TestAuthHandler.SchemeName;
                        options.DefaultChallengeScheme = TestAuthHandler.SchemeName;
                    })
                    .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(TestAuthHandler.SchemeName, _ => { });
                #endregion Authentication

                #region Email
                services.RemoveAll<IEmailService>();
                services.AddSingleton<IEmailService>(Emails);
                #endregion Email

                #region Logging
                // Only show real errors in the test output.
                services.RemoveAll<ILoggerFactory>();
                services.AddSingleton<ILoggerFactory>(_ => LoggerFactory.Create(b => b
                    .SetMinimumLevel(LogLevel.Error)
                    .AddSimpleConsole()));
                #endregion Logging
            });
        }

        /// <summary>
        /// Replaces the database with a new, empty in-memory database and clears the recorded mails.
        /// </summary>
        public async Task ResetAsync()
        {
            // An in-memory SQLite database lives as long as its connection is open.
            if (_connection != null)
            {
                await _connection.DisposeAsync();
            }

            _connection = new SqliteConnection("DataSource=:memory:;Foreign Keys=True");
            await _connection.OpenAsync();

            await ExecuteDbAsync(db => db.Database.EnsureCreatedAsync());

            Emails.Clear();
        }

        /// <summary>
        /// Runs a query directly against the test database, e.g. to prepare or verify data.
        /// </summary>
        public async Task<T> QueryDbAsync<T>(Func<DatabaseContext, Task<T>> query)
        {
            using IServiceScope scope = Services.CreateScope();
            DatabaseContext db = scope.ServiceProvider.GetRequiredService<DatabaseContext>();
            return await query(db);
        }

        /// <summary>
        /// Runs an action directly against the test database, e.g. to prepare or verify data.
        /// </summary>
        public Task ExecuteDbAsync(Func<DatabaseContext, Task> action)
            => QueryDbAsync(async db => { await action(db); return true; });

        /// <summary>
        /// Creates a client that is logged in as the given user. Pass null for an anonymous client.
        /// </summary>
        public HttpClient CreateClientFor(string? email, bool emailVerified = true)
        {
            HttpClient client = CreateClient();

            if (email != null)
            {
                client.DefaultRequestHeaders.Add(TestAuthHandler.UserHeader, email);
                client.DefaultRequestHeaders.Add(TestAuthHandler.EmailVerifiedHeader, emailVerified ? "true" : "false");
            }

            return client;
        }

        public override async ValueTask DisposeAsync()
        {
            await base.DisposeAsync();

            if (_connection != null)
            {
                await _connection.DisposeAsync();
            }
        }
    }
}
