using System;
using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MySql.Data.MySqlClient;
using PPGameMgmt.Core.Exceptions;

namespace PPGameMgmt.Infrastructure.Data
{
    /// <summary>
    /// Provides centralized exception handling for repository operations
    /// </summary>
    public static class RepositoryExceptionHandler
    {
        /// <summary>
        /// Executes a repository operation with standardized exception handling
        /// </summary>
        /// <typeparam name="T">The return type of the repository operation</typeparam>
        /// <param name="operation">The repository operation to execute</param>
        /// <param name="entityName">The name of the entity being operated on</param>
        /// <param name="errorMessage">A custom error message</param>
        /// <param name="logger">Optional logger for logging exceptions</param>
        /// <returns>The result of the repository operation</returns>
        public static T Execute<T>(Func<T> operation, string entityName, string errorMessage, ILogger logger = null)
        {
            try
            {
                return operation();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                logger?.LogError(ex, "Concurrency conflict detected with {EntityName}: {Message}", entityName, ex.Message);
                throw new ConcurrencyException(entityName, ex.Message, ex);
            }
            catch (DbUpdateException ex)
            {
                logger?.LogError(ex, "Database update error with {EntityName}: {Message}", entityName, ex.Message);
                
                // Handle specific database constraint violations
                if (IsDuplicateKeyException(ex))
                {
                    throw new BusinessRuleViolationException("DuplicateKey", $"A {entityName} with the same key already exists.", ex);
                }
                
                if (IsForeignKeyViolation(ex))
                {
                    throw new BusinessRuleViolationException("ForeignKeyViolation", $"Cannot perform operation on {entityName} because it would violate a relationship constraint.", ex);
                }
                
                throw new InfrastructureException("Database", errorMessage, ex);
            }
            catch (SqlException ex)
            {
                logger?.LogError(ex, "SQL error with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("SqlServer", errorMessage, ex);
            }
            catch (MySqlException ex)
            {
                logger?.LogError(ex, "MySQL error with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("MySql", errorMessage, ex);
            }
            catch (DataException ex)
            {
                logger?.LogError(ex, "Data error with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("Database", errorMessage, ex);
            }
            catch (OperationCanceledException ex)
            {
                logger?.LogError(ex, "Operation canceled with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("Database", "The database operation was canceled.", ex);
            }
            catch (TimeoutException ex)
            {
                logger?.LogError(ex, "Timeout with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("Database", "The database operation timed out.", ex);
            }
            catch (EntityNotFoundException)
            {
                // Just re-throw domain exceptions
                throw;
            }
            catch (Exception ex)
            {
                // For any other exception, log it and wrap it
                logger?.LogError(ex, "Unexpected error with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("Repository", errorMessage, ex);
            }
        }

        /// <summary>
        /// Executes an async repository operation with standardized exception handling
        /// </summary>
        /// <typeparam name="T">The return type of the repository operation</typeparam>
        /// <param name="operation">The async repository operation to execute</param>
        /// <param name="entityName">The name of the entity being operated on</param>
        /// <param name="errorMessage">A custom error message</param>
        /// <param name="logger">Optional logger for logging exceptions</param>
        /// <returns>The result of the repository operation</returns>
        public static async Task<T> ExecuteAsync<T>(Func<Task<T>> operation, string entityName, string errorMessage, ILogger logger = null)
        {
            try
            {
                return await operation();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                logger?.LogError(ex, "Concurrency conflict detected with {EntityName}: {Message}", entityName, ex.Message);
                throw new ConcurrencyException(entityName, ex.Message, ex);
            }
            catch (DbUpdateException ex)
            {
                logger?.LogError(ex, "Database update error with {EntityName}: {Message}", entityName, ex.Message);
                
                // Handle specific database constraint violations
                if (IsDuplicateKeyException(ex))
                {
                    throw new BusinessRuleViolationException("DuplicateKey", $"A {entityName} with the same key already exists.", ex);
                }
                
                if (IsForeignKeyViolation(ex))
                {
                    throw new BusinessRuleViolationException("ForeignKeyViolation", $"Cannot perform operation on {entityName} because it would violate a relationship constraint.", ex);
                }
                
                throw new InfrastructureException("Database", errorMessage, ex);
            }
            catch (SqlException ex)
            {
                logger?.LogError(ex, "SQL error with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("SqlServer", errorMessage, ex);
            }
            catch (MySqlException ex)
            {
                logger?.LogError(ex, "MySQL error with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("MySql", errorMessage, ex);
            }
            catch (DataException ex)
            {
                logger?.LogError(ex, "Data error with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("Database", errorMessage, ex);
            }
            catch (OperationCanceledException ex)
            {
                logger?.LogError(ex, "Operation canceled with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("Database", "The database operation was canceled.", ex);
            }
            catch (TimeoutException ex)
            {
                logger?.LogError(ex, "Timeout with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("Database", "The database operation timed out.", ex);
            }
            catch (EntityNotFoundException)
            {
                // Just re-throw domain exceptions
                throw;
            }
            catch (Exception ex)
            {
                // For any other exception, log it and wrap it
                logger?.LogError(ex, "Unexpected error with {EntityName}: {Message}", entityName, ex.Message);
                throw new InfrastructureException("Repository", errorMessage, ex);
            }
        }

        /// <summary>
        /// Executes a repository operation with no return value
        /// </summary>
        /// <param name="operation">The repository operation to execute</param>
        /// <param name="entityName">The name of the entity being operated on</param>
        /// <param name="errorMessage">A custom error message</param>
        /// <param name="logger">Optional logger for logging exceptions</param>
        public static void Execute(Action operation, string entityName, string errorMessage, ILogger logger = null)
        {
            Execute(() => 
            {
                operation();
                return true;
            }, entityName, errorMessage, logger);
        }

        /// <summary>
        /// Executes an async repository operation with no return value
        /// </summary>
        /// <param name="operation">The async repository operation to execute</param>
        /// <param name="entityName">The name of the entity being operated on</param>
        /// <param name="errorMessage">A custom error message</param>
        /// <param name="logger">Optional logger for logging exceptions</param>
        public static async Task ExecuteAsync(Func<Task> operation, string entityName, string errorMessage, ILogger logger = null)
        {
            await ExecuteAsync(async () => 
            {
                await operation();
                return true;
            }, entityName, errorMessage, logger);
        }

        /// <summary>
        /// Determines if an exception is related to duplicate key constraint
        /// </summary>
        private static bool IsDuplicateKeyException(DbUpdateException ex)
        {
            string innerMessage = ex.InnerException?.Message.ToLower() ?? "";
            return innerMessage.Contains("duplicate key") ||
                   innerMessage.Contains("unique constraint") ||
                   innerMessage.Contains("duplicate entry");
        }

        /// <summary>
        /// Determines if an exception is related to foreign key constraint
        /// </summary>
        private static bool IsForeignKeyViolation(DbUpdateException ex)
        {
            string innerMessage = ex.InnerException?.Message.ToLower() ?? "";
            return innerMessage.Contains("foreign key") ||
                   innerMessage.Contains("reference constraint");
        }
    }
}