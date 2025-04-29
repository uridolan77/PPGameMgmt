using System;
using FluentValidation;
using PPGameMgmt.API.Models.Requests;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.API.Validators
{
    /// <summary>
    /// Validator for ClaimBonusRequest
    /// </summary>
    public class ClaimBonusRequestValidator : AbstractValidator<ClaimBonusRequest>
    {
        public ClaimBonusRequestValidator()
        {
            RuleFor(x => x.BonusId)
                .NotEmpty()
                .WithMessage("Bonus ID is required");
        }
    }
    
    /// <summary>
    /// Validator for CreateBonusRequest
    /// </summary>
    public class CreateBonusRequestValidator : AbstractValidator<CreateBonusRequest>
    {
        public CreateBonusRequestValidator()
        {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Bonus name is required")
                .MaximumLength(100)
                .WithMessage("Bonus name cannot exceed 100 characters");
                
            RuleFor(x => x.Description)
                .NotEmpty()
                .WithMessage("Bonus description is required")
                .MaximumLength(500)
                .WithMessage("Bonus description cannot exceed 500 characters");
                
            RuleFor(x => x.Type)
                .IsInEnum()
                .WithMessage("Invalid bonus type value");
                
            RuleFor(x => x.Value)
                .GreaterThan(0)
                .WithMessage("Bonus value must be greater than 0");
                
            RuleFor(x => x.StartDate)
                .NotEmpty()
                .WithMessage("Start date is required")
                .LessThan(x => x.EndDate)
                .WithMessage("Start date must be before end date");
                
            RuleFor(x => x.EndDate)
                .NotEmpty()
                .WithMessage("End date is required")
                .GreaterThan(x => x.StartDate)
                .WithMessage("End date must be after start date");
                
            RuleFor(x => x.TargetSegment)
                .IsInEnum()
                .When(x => x.TargetSegment.HasValue && !x.IsGlobal)
                .WithMessage("Invalid target segment value");
                
            RuleFor(x => x.TargetSegment)
                .NotNull()
                .When(x => !x.IsGlobal)
                .WithMessage("Target segment is required when bonus is not global");
        }
    }
}
