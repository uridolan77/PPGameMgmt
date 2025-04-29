using System.Collections.Generic;
using MediatR;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.CQRS.Queries.Players
{
    public class GetPlayersBySegmentQuery : IRequest<IEnumerable<Player>>
    {
        public PlayerSegment Segment { get; set; }
    }
}
