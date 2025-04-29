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
        
        public async Task<IEnumerable<OutboxMessage>> GetUnprocessedMessagesAsync(int batchSize = 100)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting unprocessed outbox messages (max {batchSize})");
                    
                    return await _context.OutboxMessages
                        .Where(m => m.ProcessedAt == null)
                        .OrderBy(m => m.CreatedAt)
                        .Take(batchSize)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving unprocessed outbox messages",
                _logger
            );
        }
        
        public async Task AddAsync(OutboxMessage message)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Adding outbox message of type {message.Type}");
                    
                    await _context.OutboxMessages.AddAsync(message);
                    await _context.SaveChangesAsync();
                    
                    _logger?.LogInformation($"Added outbox message with ID: {message.Id}");
                },
                _entityName,
                $"Error adding outbox message",
                _logger
            );
        }
        
        public async Task MarkAsProcessedAsync(Guid id)
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