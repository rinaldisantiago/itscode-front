public class FollowRequestDTO
{
    public int userFollowingId { get; set; }
    public int userFollowedId { get; set; }
    
}

public class FollowResponseDTO 
{
    public string Message { get; set; }
    public string UserFollowing { get; set; }
    public string UserFollowed { get; set; }
}

public class UnfollowRequestDTO
{
    public int userFollowingId { get; set; }
    public int userFollowedId { get; set; }
}

public class UnfollowResponseDTO 
{
    public string message { get; set; }
    public string userFollowing { get; set; }
    public string userFollowed { get; set; }
}

public class SearchUsersRequestDTO
{
    public string searchTerm { get; set; }
    public int idUserLogger { get; set; }
    public int page { get; set; }
    public int pageSize { get; set; }
}

public class SearchUsersResponseDTO
{
    public List<UserSuggestionDto> users { get; set; }
}

public class UserSuggestionDto
{
    public string UserName { get; set; }
    public string Avatar { get; set; }
}

   [HttpPost]
        public IActionResult FollowUser([FromQuery] FollowRequestDTO request)
        {
            User userFollowing = this.df.CreateDAOUser().GetUser(request.userFollowingId);
            User userFollowed = this.df.CreateDAOUser().GetUser(request.userFollowedId);

            if (userFollowing == null || userFollowed == null)
            {
                return NotFound("User not found");
            }

            Following following = new Following
            {
                UserFollowing = userFollowing,
                UserFollowed = userFollowed
            };

            this.df.CreateDAOFollowing().CreateFollowing(following);

            FollowResponseDTO response = new FollowResponseDTO
            {
                message = "Followed successfully",
                userFollowing = userFollowing.UserName,
                userFollowed = userFollowed.UserName
            };

            return Ok(new { response });
        }
        

        [HttpDelete]
        public IActionResult UnfollowUser([FromQuery] UnfollowRequestDTO request)
        {
            User? userFollowing = this.df.CreateDAOUser().GetUser(request.userFollowingId);
            User? userFollowed = this.df.CreateDAOUser().GetUser(request.userFollowedId);

            if (userFollowing == null || userFollowed == null)
            {
                return NotFound("User not found");
            }

            this.df.CreateDAOFollowing().DeleteFollowing(request.userFollowingId, request.userFollowedId);

            UnfollowResponseDTO response = new UnfollowResponseDTO
            {
                message = "Unfollow successfully",
                userFollowing = userFollowing.UserName,
                userFollowed = userFollowed.UserName
            };

            return Ok(response);
        }
    } 
