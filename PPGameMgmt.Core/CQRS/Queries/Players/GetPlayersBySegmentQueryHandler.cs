using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.CQRS.Queries.Players
{
    public class GetPlayersBySegmentQueryHandler : IRequestHandler<GetPlayersBySegmentQuery, IEnumerable<Player>>
    {
        private readonly IPlayerRepository _repository;
        
        public GetPlayersBySegmentQueryHandler(IPlayerRepository repository)
        {
            _repository = repository;
        }
        
        public async Task<IEnumerable<Player>> Handle(GetPlayersBySegmentQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetPlayersBySegmentAsync(request.Segment);
        }
    }
}
