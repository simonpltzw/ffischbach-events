using Microsoft.EntityFrameworkCore;

namespace FFischbach.Events.API.Data
{
    public class DatabaseContext : DbContext
    {
        public DatabaseContext(DbContextOptions options) : base(options)
        {
        }
    }
}
