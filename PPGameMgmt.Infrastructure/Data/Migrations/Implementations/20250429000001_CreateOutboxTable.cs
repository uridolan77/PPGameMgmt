using Microsoft.Extensions.Logging;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Migrations.Implementations
{
    /// <summary>
    /// Migration to create the OutboxMessages table for the Outbox pattern
    /// </summary>
    public class CreateOutboxTableMigration : SqlMigration
    {
        public override string Id => "20250429000001_CreateOutboxTable";
        public override string Description => "Creates the OutboxMessages table for the Outbox pattern";

        protected override string UpSql => @"
            CREATE TABLE OutboxMessages (
                Id UNIQUEIDENTIFIER PRIMARY KEY,
                Type NVARCHAR(255) NOT NULL,
                Data NVARCHAR(MAX) NOT NULL,
                CreatedAt DATETIME2 NOT NULL,
                ProcessedAt DATETIME2 NULL
            );
            
            CREATE INDEX IX_OutboxMessages_ProcessedAt ON OutboxMessages(ProcessedAt);
            CREATE INDEX IX_OutboxMessages_CreatedAt ON OutboxMessages(CreatedAt);
        ";

        protected override string DownSql => @"
            DROP INDEX IF EXISTS IX_OutboxMessages_ProcessedAt ON OutboxMessages;
            DROP INDEX IF EXISTS IX_OutboxMessages_CreatedAt ON OutboxMessages;
            DROP TABLE IF EXISTS OutboxMessages;
        ";

        public CreateOutboxTableMigration(CasinoDbContext dbContext, ILogger<CreateOutboxTableMigration> logger = null)
            : base(dbContext, logger)
        {
        }
    }
}