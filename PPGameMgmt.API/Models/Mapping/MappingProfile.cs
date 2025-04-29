using AutoMapper;
using PPGameMgmt.API.Models.DTOs;
using PPGameMgmt.Core.Entities;
using System;

namespace PPGameMgmt.API.Models.Mapping
{
    /// <summary>
    /// AutoMapper profile for mapping between domain entities and DTOs
    /// </summary>
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Player mappings
            CreateMap<Player, PlayerDto>()
                .ForMember(dest => dest.PlayerValue, 
                    opt => opt.MapFrom(src => src.TotalDeposits - src.TotalWithdrawals))
                .ForMember(dest => dest.DaysSinceRegistration, 
                    opt => opt.MapFrom(src => (int)(DateTime.UtcNow - src.RegistrationDate).TotalDays))
                .ForMember(dest => dest.DaysSinceLastLogin, 
                    opt => opt.MapFrom(src => (int)(DateTime.UtcNow - src.LastLoginDate).TotalDays));
            
            CreateMap<PlayerDto, Player>();
            
            // Game mappings
            CreateMap<Game, GameDto>();
            CreateMap<GameDto, Game>();
            
            // Bonus mappings
            CreateMap<Bonus, BonusDto>();
            CreateMap<BonusDto, Bonus>();
        }
    }
}