using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using PPGameMgmt.Infrastructure.Data.Contexts;
using PPGameMgmt.Core.Entities;

namespace TestApiDbConnection
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Testing API's connection to MySQL database...");
            
            // Building configuration from appsettings.json
            var configuration = new ConfigurationBuilder()
                .SetBasePath(AppDomain.CurrentDomain.BaseDirectory)
                .AddJsonFile("appsettings.json")
                .Build();
            
            var connectionString = configuration.GetConnectionString("MySqlConnection");
            Console.WriteLine($"Using connection string: {connectionString}");
            
            try
            {
                // Create options for CasinoDbContext
                var options = new DbContextOptionsBuilder<CasinoDbContext>()
                    .UseMySql(connectionString, ServerVersion.AutoDetect(connectionString))
                    .Options;
                
                // Use the CasinoDbContext to query the database
                using (var context = new CasinoDbContext(options))
                {
                    // Check connection
                    if (await context.Database.CanConnectAsync())
                    {
                        Console.WriteLine("Successfully connected to MySQL database!");
                        
                        // Query the bonuses table
                        var bonuses = await context.Bonuses.Take(5).ToListAsync();
                        
                        Console.WriteLine($"\nFound {bonuses.Count} bonuses:");
                        Console.WriteLine("----------------------------");
                        
                        foreach (Bonus bonus in bonuses)
                        {
                            Console.WriteLine($"ID: {bonus.Id}");
                            Console.WriteLine($"Name: {bonus.Name}");
                            Console.WriteLine($"Description: {bonus.Description}");
                            Console.WriteLine($"Type: {bonus.Type}");
                            Console.WriteLine("----------------------------");
                        }
                    }
                    else
                    {
                        Console.WriteLine("Failed to connect to the database.");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error connecting to MySQL: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
            }
            
            Console.WriteLine("\nPress any key to exit...");
            Console.ReadKey();
        }
    }
}