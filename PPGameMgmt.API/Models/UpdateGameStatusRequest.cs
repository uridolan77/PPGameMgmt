namespace PPGameMgmt.API.Models
{
    /// <summary>
    /// Request model for updating a game's status
    /// </summary>
    public class UpdateGameStatusRequest
    {
        /// <summary>
        /// Whether the game is active or not
        /// </summary>
        public bool IsActive { get; set; }
    }
}
