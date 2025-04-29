using MediatR;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.CQRS.Queries.Players
{
    public class GetPlayerByIdQuery : IRequest<Player>
    {
        public string PlayerId { get; set; }
    }
}
