using System.Threading;
using System.Threading.Tasks;
using MediatR;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.CQRS.Queries.Players
{
    public class GetPlayerByIdQueryHandler : IRequestHandler<GetPlayerByIdQuery, Player>
    {
        private readonly IPlayerRepository _repository;
        
        public GetPlayerByIdQueryHandler(IPlayerRepository repository)
        {
            _repository = repository;
        }
        
        public async Task<Player> Handle(GetPlayerByIdQuery request, CancellationToken cancellationToken)
        {
            return await _repository.GetByIdAsync(request.PlayerId);
        }
    }
}
