using System;
using FluentValidation;
using PPGameMgmt.API.Models.Requests;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.API.Validators
{
    /// <summary>
    /// Validator for PlayerSegmentUpdateRequest
    /// </summary>
    public class PlayerSegmentUpdateRequestValidator : AbstractValidator<PlayerSegmentUpdateRequest>
    {
        public PlayerSegmentUpdateRequestValidator()
        {
            RuleFor(x => x.Segment)
                .IsInEnum()
                .WithMessage("Invalid player segment value");
        }
    }
    
    /// <summary>
    /// Validator for CreatePlayerRequest
    /// </summary>
    public class CreatePlayerRequestValidator : AbstractValidator<CreatePlayerRequest>
    {
        public CreatePlayerRequestValidator()
        {
            RuleFor(x => x.Username)
                .NotEmpty()
                .WithMessage("Username is required")
                .MinimumLength(3)
                .WithMessage("Username must be at least 3 characters long")
                .MaximumLength(50)
                .WithMessage("Username cannot exceed 50 characters");
                
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required")
                .EmailAddress()
                .WithMessage("Invalid email format");
                
            RuleFor(x => x.Country)
                .NotEmpty()
                .WithMessage("Country is required")
                .Length(2)
                .WithMessage("Country must be a 2-letter ISO country code");
                
            RuleFor(x => x.Segment)
                .IsInEnum()
                .When(x => x.Segment.HasValue)
                .WithMessage("Invalid player segment value");
        }
    }
    
    /// <summary>
    /// Validator for UpdatePlayerRequest
    /// </summary>
    public class UpdatePlayerRequestValidator : AbstractValidator<UpdatePlayerRequest>
    {
        public UpdatePlayerRequestValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email is required")
                .EmailAddress()
                .WithMessage("Invalid email format");
                
            RuleFor(x => x.Country)
                .NotEmpty()
                .WithMessage("Country is required")
                .Length(2)
                .WithMessage("Country must be a 2-letter ISO country code");
        }
    }
}
