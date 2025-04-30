using System;
using MySqlConnector;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Testing MySQL connection...");
        
        // The updated connection string with port 3306
        string connectionString = "Server=localhost;Port=3306;Database=pp_recommender_db;User=root;Password=Dt%g_9W3z0*!I;";
        
        try
        {
            using (var connection = new MySqlConnection(connectionString))
            {
                Console.WriteLine("Attempting to connect to MySQL...");
                connection.Open();
                Console.WriteLine("Successfully connected to MySQL database!");
                
                // Run a simple query to test further
                using (var command = new MySqlCommand("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'pp_recommender_db'", connection))
                {
                    var result = command.ExecuteScalar();
                    Console.WriteLine($"Number of tables in database: {result}");
                }
                
                // Try to query the players table if it exists
                try {
                    using (var command = new MySqlCommand("SELECT COUNT(*) FROM players", connection))
                    {
                        var result = command.ExecuteScalar();
                        Console.WriteLine($"Number of players in database: {result}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error querying players table: {ex.Message}");
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