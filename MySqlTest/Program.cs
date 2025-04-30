using Microsoft.EntityFrameworkCore;
using System;
using System.IO;
using MySqlConnector;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("MySQL Database Setup");
        Console.WriteLine("--------------------");
        
        try
        {
            // Base connection string without database specified
            string serverConnectionString = "Server=localhost;User=root;Password=Dt%g_9W3z0*!I";
            
            // Create the database
            using (var connection = new MySqlConnection(serverConnectionString))
            {
                connection.Open();
                Console.WriteLine("MySQL server connection established!");
                
                // Drop database if it exists
                var dropDbCommand = new MySqlCommand("DROP DATABASE IF EXISTS pp_recommender_db;", connection);
                dropDbCommand.ExecuteNonQuery();
                Console.WriteLine("Dropped database if it existed");
                
                // Create database
                var createDbCommand = new MySqlCommand("CREATE DATABASE pp_recommender_db;", connection);
                createDbCommand.ExecuteNonQuery();
                Console.WriteLine("Database created");
            }
            
            // Use the new database and create tables
            string dbConnectionString = "Server=localhost;Database=pp_recommender_db;User=root;Password=Dt%g_9W3z0*!I";
            
            using (var connection = new MySqlConnection(dbConnectionString))
            {
                connection.Open();
                Console.WriteLine("Connected to new database!");
                
                // Create tables - read SQL script and extract table creation statements
                string scriptPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "pp_recommender_db.sql");
                string sqlScript = File.ReadAllText(scriptPath);
                
                // Split the script by semicolons to get individual commands
                string[] commands = sqlScript.Split(new[] { ";" }, StringSplitOptions.RemoveEmptyEntries);
                
                // Execute each command
                foreach (string command in commands)
                {
                    string trimmedCommand = command.Trim();
                    
                    // Skip empty commands and comments
                    if (string.IsNullOrWhiteSpace(trimmedCommand) || 
                        trimmedCommand.StartsWith("--") ||
                        trimmedCommand.StartsWith("DROP DATABASE") ||
                        trimmedCommand.StartsWith("CREATE DATABASE") ||
                        trimmedCommand.StartsWith("USE") ||
                        trimmedCommand.StartsWith("ALTER DATABASE"))
                    {
                        continue;
                    }
                    
                    try
                    {
                        using (var cmd = new MySqlCommand(trimmedCommand, connection))
                        {
                            cmd.ExecuteNonQuery();
                            Console.WriteLine($"Executed SQL command successfully");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error executing command: {trimmedCommand.Substring(0, Math.Min(50, trimmedCommand.Length))}...");
                        Console.WriteLine($"Error: {ex.Message}");
                    }
                }
                
                Console.WriteLine("Database setup completed!");
            }
            
            Console.WriteLine("Database created and tables set up successfully!");
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