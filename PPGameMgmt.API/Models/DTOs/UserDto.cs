using System;

namespace PPGameMgmt.API.Models.DTOs
{
    /// <summary>
    /// Data Transfer Object for User entity
    /// </summary>
    public class UserDto
    {
        /// <summary>
        /// User's unique identifier
        /// </summary>
        public string Id { get; set; }

        /// <summary>
        /// User's username
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// User's email address
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// User's first name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// User's last name
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// User's role
        /// </summary>
        public string Role { get; set; }

        /// <summary>
        /// Whether the user account is active
        /// </summary>
        public bool IsActive { get; set; }

        /// <summary>
        /// Whether the user's email is verified
        /// </summary>
        public bool IsEmailVerified { get; set; }

        /// <summary>
        /// Date the user account was created
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Date of the user's last login
        /// </summary>
        public DateTime? LastLoginDate { get; set; }

        /// <summary>
        /// The ID of the player associated with this user (if any)
        /// </summary>
        public string PlayerId { get; set; }
    }
}