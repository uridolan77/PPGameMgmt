using MediatR;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.CQRS.Commands.Bonuses
{
    public class ClaimBonusCommand : IRequest<BonusClaim>
    {
        public string PlayerId { get; set; }
        public string BonusId { get; set; }
    }
}
