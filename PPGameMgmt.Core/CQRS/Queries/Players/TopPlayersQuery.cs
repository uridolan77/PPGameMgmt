using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Specifications;

namespace PPGameMgmt.Core.CQRS.Queries.Players
{
    /// <summary>
    /// Query to get top players by total deposits
    /// </summary>
    public class TopPlayersQuery : IQuery<List<Player>>
    {
        public int Count { get; }
        public decimal MinimumDeposit { get; }

        public TopPlayersQuery(int count = 10, decimal minimumDeposit = 0)
        {
            Count = count;
            MinimumDeposit = minimumDeposit;
        }
    }

    /// <summary>
    /// Handler for the TopPlayersQuery
    /// </summary>
    public class TopPlayersQueryHandler : IQueryHandler<TopPlayersQuery, List<Player>>
    {
        private readonly IPlayerRepository _playerRepository;

        public TopPlayersQueryHandler(IPlayerRepository playerRepository)
        {
            _playerRepository = playerRepository;
        }

        public async Task<List<Player>> HandleAsync(TopPlayersQuery query)
        {
            // Create a specification for high-value players
            var highValueSpec = new PlayerSpecifications.HighValuePlayers(query.MinimumDeposit);

            // Get players matching the specification using ListAsync instead of FindAsync
            var players = await _playerRepository.ListAsync(highValueSpec.ToExpression());

            // Sort and take the top N players
            return players
                .OrderByDescending(p => p.TotalDeposits)
                .Take(query.Count)
                .ToList();
        }
    }
}