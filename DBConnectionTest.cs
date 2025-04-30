using System;
using MySqlConnector;
using System.Threading.Tasks;

public class DBConnectionTest
{
    public static async Task Main(string[] args)
    {
        string connectionString = "server=localhost;port=3306;database=pp_recommender_db;user=root;password=password;Allow User Variables=True";
        
        Console.WriteLine("Attempting to connect to MySQL database...");
        
        try
        {
            using (var connection = new MySqlConnection(connectionString))
            {
                await connection.OpenAsync();
                Console.WriteLine("Connection successful!");
                
                // Try to query the database
                using (var command = new MySqlCommand("SHOW TABLES;", connection))
                {
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        Console.WriteLine("Tables in database:");
                        while (await reader.ReadAsync())
                        {
                            Console.WriteLine(reader.GetString(0));
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error connecting to database: {ex.Message}");
            Console.WriteLine($"Connection string: {connectionString}");
        }
    }
}
