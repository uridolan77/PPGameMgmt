using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("users")]
    public class User
    {
        [Column("id")]
        public required string Id { get; set; }

        [Column("username")]
        public required string Username { get; set; }

        [Column("email")]
        public required string Email { get; set; }

        [Column("password_hash")]
        public required string PasswordHash { get; set; }

        [Column("password_salt")]
        public required string PasswordSalt { get; set; }

        [Column("first_name")]
        public string? FirstName { get; set; }

        [Column("last_name")]
        public string? LastName { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("is_email_verified")]
        public bool IsEmailVerified { get; set; } = false;

        [Column("verification_token")]
        public string? VerificationToken { get; set; }

        [Column("reset_password_token")]
        public string? ResetPasswordToken { get; set; }

        [Column("reset_password_expires")]
        public DateTime? ResetPasswordExpires { get; set; }

        [Column("last_login_date")]
        public DateTime? LastLoginDate { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [Column("role")]
        public required string Role { get; set; } = "User";

        [Column("player_id")]
        public string? PlayerId { get; set; }

        // Navigation properties
        public Player? Player { get; set; }

        // Collection of refresh tokens associated with this user
        public ICollection<RefreshToken> RefreshTokens { get; set; } = [];
    }
}