using System.ComponentModel.DataAnnotations;

namespace PPGameMgmt.API.Models.DTOs
{
    /// <summary>
    /// Model for updating a user's profile information
    /// </summary>
    public class UpdateProfileRequest
    {
        /// <summary>
        /// User's first name
        /// </summary>
        [StringLength(50)]
        public string FirstName { get; set; }

        /// <summary>
        /// User's last name
        /// </summary>
        [StringLength(50)]
        public string LastName { get; set; }
    }
}