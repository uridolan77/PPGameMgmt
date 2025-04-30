using System;
using System.Data;
using MySqlConnector;

namespace DBConnectionTest
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Testing MySQL database connection...");

            // Updated connection string with port 3306
            string connectionString = "Server=localhost;Port=3306;Database=pp_recommeder_db;User=root;Password=Dt%g_9W3z0*!I;";

            try
            {
                using (var connection = new MySqlConnection(connectionString))
                {
                    Console.WriteLine("Opening connection...");
                    connection.Open();
                    Console.WriteLine("Connection successful!");

                    // Check database version
                    using (var command = new MySqlCommand("SELECT VERSION()", connection))
                    {
                        string version = command.ExecuteScalar().ToString();
                        Console.WriteLine($"MySQL version: {version}");
                    }

                    // Check if the players table exists and get count
                    try
                    {
                        using (var command = new MySqlCommand("SELECT COUNT(*) FROM players", connection))
                        {
                            int count = Convert.ToInt32(command.ExecuteScalar());
                            Console.WriteLine($"Number of records in players table: {count}");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Error querying players table: {ex.Message}");
                        Console.WriteLine("Checking if players table exists...");

                        using (var command = new MySqlCommand(
                            "SELECT COUNT(*) FROM information_schema.tables " +
                            "WHERE table_schema = 'pp_recommeder_db' AND table_name = 'players'",
                            connection))
                        {
                            int exists = Convert.ToInt32(command.ExecuteScalar());
                            if (exists > 0)
                                Console.WriteLine("Players table exists but there may be permission issues or structure problems.");
                            else
                                Console.WriteLine("Players table does not exist in the database.");
                        }
                    }

                    // List all tables in the database
                    Console.WriteLine("\nListing all tables in the database:");
                    using (var command = new MySqlCommand(
                        "SELECT table_name FROM information_schema.tables " +
                        "WHERE table_schema = 'pp_recommeder_db'",
                        connection))
                    {
                        using (var reader = command.ExecuteReader())
                        {
                            if (!reader.HasRows)
                            {
                                Console.WriteLine("No tables found in the database.");
                            }
                            else
                            {
                                while (reader.Read())
                                {
                                    Console.WriteLine($"- {reader.GetString(0)}");
                                }
                            }
                        }
                    }
                }
            }
            catch (MySqlException ex)
            {
                Console.WriteLine($"MySQL Error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                Console.WriteLine($"Error Code: {ex.Number}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
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
