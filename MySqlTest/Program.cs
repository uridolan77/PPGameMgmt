using Microsoft.EntityFrameworkCore;
using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("MySQL Test Connection");
        Console.WriteLine("---------------------");
        Console.WriteLine($"Using Pomelo.EntityFrameworkCore.MySql version: {typeof(Pomelo.EntityFrameworkCore.MySql.MySqlDbContextOptionsBuilderExtensions).Assembly.GetName().Version}");
        Console.WriteLine($"Using Microsoft.EntityFrameworkCore version: {typeof(DbContext).Assembly.GetName().Version}");
        
        try
        {
            // Test with your actual connection string
            string connectionString = "Server=localhost;Database=pp_recommeder_db;User=root;Password=Dt%g_9W3z0*!I";
            
            var optionsBuilder = new DbContextOptionsBuilder();
            optionsBuilder.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString));
                
            Console.WriteLine("MySQL connection setup succeeded!");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error: {ex.Message}");
            if (ex.InnerException != null)
                Console.WriteLine($"Inner Error: {ex.InnerException.Message}");
        }
    }
}

// Simple DbContext for testing
public class TestDbContext : DbContext
{
    public TestDbContext(DbContextOptions options) : base(options) { }
}