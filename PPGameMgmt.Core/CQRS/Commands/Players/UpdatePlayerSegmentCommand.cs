using MediatR;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.CQRS.Commands.Players
{
    public class UpdatePlayerSegmentCommand : IRequest<bool>
    {
        public string PlayerId { get; set; }
        public PlayerSegment Segment { get; set; }
    }
}
