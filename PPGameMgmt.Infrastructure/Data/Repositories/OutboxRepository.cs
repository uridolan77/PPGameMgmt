using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class OutboxRepository : IOutboxRepository
    {
        private readonly CasinoDbContext _context;
        private readonly ILogger<OutboxRepository>? _logger;
        private const string _entityName = "OutboxMessage";
        
        public OutboxRepository(CasinoDbContext context, ILogger<OutboxRepository>? logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }
        
        // Implementation of IOutboxRepository methods
        public async Task AddMessageAsync(object message)
        {
            if (message is not OutboxMessage outboxMessage)
            {
                throw new ArgumentException("Message must be of type OutboxMessage", nameof(message));
            }
            
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Adding outbox message of type {outboxMessage.Type}");
                    
                    await _context.OutboxMessages.AddAsync(outboxMessage);
                    await _context.SaveChangesAsync();
                    
                    _logger?.LogInformation($"Added outbox message with ID: {outboxMessage.Id}");
                },
                _entityName,
                $"Error adding outbox message",
                _logger
            );
        }
        
        public async Task<IEnumerable<object>> GetPendingMessagesAsync(int batchSize)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting pending outbox messages (max {batchSize})");
                    
                    var messages = await _context.OutboxMessages
                        .Where(m => m.ProcessedAt == null)
                        .OrderBy(m => m.CreatedAt)
                        .Take(batchSize)
                        .ToListAsync();
                    
                    return messages.Cast<object>().ToList();
                },
                _entityName,
                $"Error retrieving pending outbox messages",
                _logger
            );
        }
        
        public async Task MarkMessageAsProcessedAsync(Guid id)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Marking outbox message {id} as processed");
                    
                    var message = await _context.OutboxMessages.FindAsync(id);
                    if (message != null)
                    {
                        message.MarkAsProcessed();
                        await _context.SaveChangesAsync();
                        
                        _logger?.LogInformation($"Marked outbox message {id} as processed");
                    }
                    else
                    {
                        _logger?.LogWarning($"Outbox message with ID {id} not found");
                    }
                },
                _entityName,
                $"Error marking outbox message {id} as processed",
                _logger
            );
        }
        
        // Additional helper methods (not part of the interface)
        public async Task CleanupProcessedMessagesAsync(DateTime before)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Cleaning up processed outbox messages before {before}");
                    
                    var messagesToDelete = await _context.OutboxMessages
                        .Where(m => m.ProcessedAt != null && m.ProcessedAt < before)
                        .ToListAsync();
                    
                    if (messagesToDelete.Any())
                    {
                        _context.OutboxMessages.RemoveRange(messagesToDelete);
                        await _context.SaveChangesAsync();
                        
                        _logger?.LogInformation($"Removed {messagesToDelete.Count} processed outbox messages");
                    }
                },
                _entityName,
                $"Error cleaning up processed outbox messages",
                _logger
            );
        }
    }
}