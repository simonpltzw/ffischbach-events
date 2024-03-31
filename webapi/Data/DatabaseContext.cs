using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FFischbach.Event.API.Data
{
    public class DatabaseContext : IdentityDbContext<IdentityUser>
    {
        /// <summary>
        /// Overloaded constructor.
        /// </summary>
        /// <param name="options"></param>
        public DatabaseContext(DbContextOptions<DatabaseContext> options)
            : base(options)
        {
        }
    }
}
