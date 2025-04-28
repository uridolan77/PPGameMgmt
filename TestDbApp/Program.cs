using System;
using System.Threading.Tasks;
using MySql.Data.MySqlClient;

namespace TestDbApp
{
    class Program
    {
        static async Task Main(string[] args)
        {
            Console.WriteLine("Testing connection to MySQL database...");
            
            string connectionString = "Server=localhost;Database=pp_recommeder_db;User=root;Password=Dt%g_9W3z0*!I;";
            
            try
            {
                // Test connection
                using (var connection = new MySqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    Console.WriteLine("Successfully connected to MySQL database!");
                    
                    // Test query to get bonuses
                    string query = "SELECT id, name, description, type FROM bonuses LIMIT 5";
                    
                    using (var command = new MySqlCommand(query, connection))
                    {
                        using (var reader = await command.ExecuteReaderAsync())
                        {
                            Console.WriteLine("\nBonuses from database:");
                            Console.WriteLine("----------------------------");
                            
                            while (await reader.ReadAsync())
                            {
                                string id = reader.GetString(0);
                                string name = reader.GetString(1);
                                string description = reader.GetString(2);
                                string type = reader.GetString(3);
                                
                                Console.WriteLine($"ID: {id}");
                                Console.WriteLine($"Name: {name}");
                                Console.WriteLine($"Description: {description}");
                                Console.WriteLine($"Type: {type}");
                                Console.WriteLine("----------------------------");
                            }
                        }
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
