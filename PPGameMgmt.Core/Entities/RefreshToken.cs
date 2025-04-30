using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("refresh_tokens")]
    public class RefreshToken
    {
        [Column("id")]
        public string Id { get; set; }

        [Column("user_id")]
        public string UserId { get; set; }

        [Column("token")]
        public string Token { get; set; }

        [Column("expires")]
        public DateTime Expires { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("revoked")]
        public bool Revoked { get; set; } = false;

        [Column("replaced_by_token")]
        public string ReplacedByToken { get; set; }

        // Navigation property
        public User User { get; set; }

        public bool IsExpired => DateTime.UtcNow >= Expires;
        public bool IsActive => !Revoked && !IsExpired;
    }
}