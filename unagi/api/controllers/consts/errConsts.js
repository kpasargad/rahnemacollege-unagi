const LIKE_ERROR = "Like request has failed";
const ALREADY_LIKED_ERROR = "You have already liked this post";
const USER_ERROR = "User error has occurred";
const LOC_NOT_FOUND_ERROR = "No location has been sent.";
const LOC_NOT_VALID_ERROR = "Location is sent but is not valid";
const TEXT_ERROR = "No text has been sent";
const NUMBER_OF_CHARACTERS_ERROR = "Illegal number of characters, more than 160 characters has been sent";
const UNLIKE_ERROR = "Unlike request has failed";
const NOT_LIKED_UNLIKE_ERROR = "You have not liked this post but you had requested to unlike it";
const POST_NOT_FOUND_ERROR = "Your requested post doesn't exist";
const LAST_POST_NOT_FOUND_ERROR = "You have not sent the last post";
const LAST_POST_NOT_VALID_ERROR = "Lastpost is not an integer.";
const INVALID_TOKEN_ERROR = "Token doesn't satisfy server conditions";
const TOKEN_NOT_SENT_ERROR = "No token has been sent to server";
const ACTION_NOT_SENT_ERROR = "No action request has been sent";
const ACTION_INVALID_ERROR = "Action is not valid";
const ACTION_POST_ID_NOT_SENT_ERROR = "No postId is sent in action request";
const POST_PARENT_ERROR = "An error has occurred while getting the post's parent";
const POST_PARENT_NOT_EXISTING_ERROR = "The post you are replying to doesn't exist";

const LATITUDE_REQUIRED = "Latitude is required.";
const INVALID_LATITUDE = "Invalid Latitude.";
const LONGITUDE_REQUIRED = "Longitude is required.";
const INVALID_LONGITUDE = "Invalid Longitude.";
const INVALID_PARENT_ID_FORMAT = "Invalid parent_id format.";
const PARENT_POST_VALIDATION_ERROR = "Error validating parent post.";
const INVALID_POST_ID_FORMAT = "Invalid postId format.";
const USER_NOT_FOUND_FROM_TOKEN = "User identified by token not found.";

module.exports = {
    LIKE_ERROR: LIKE_ERROR,
    ALREADY_LIKED_ERROR: ALREADY_LIKED_ERROR,
    USER_ERROR: USER_ERROR,
    LOC_NOT_FOUND_ERROR: LOC_NOT_FOUND_ERROR,
    LOC_NOT_VALID_ERROR: LOC_NOT_VALID_ERROR,
    TEXT_ERROR: TEXT_ERROR,
    NUMBER_OF_CHARACTERS_ERROR: NUMBER_OF_CHARACTERS_ERROR,
    UNLIKE_ERROR: UNLIKE_ERROR,
    NOT_LIKED_UNLIKE_ERROR: NOT_LIKED_UNLIKE_ERROR,
    POST_NOT_FOUND_ERROR: POST_NOT_FOUND_ERROR,
    LAST_POST_NOT_FOUND_ERROR: LAST_POST_NOT_FOUND_ERROR,
    LAST_POST_NOT_VALID_ERROR: LAST_POST_NOT_VALID_ERROR,
    INVALID_TOKEN_ERROR: INVALID_TOKEN_ERROR,
    TOKEN_NOT_SENT_ERROR: TOKEN_NOT_SENT_ERROR,
    ACTION_NOT_SENT_ERROR: ACTION_NOT_SENT_ERROR,
    ACTION_INVALID_ERROR: ACTION_INVALID_ERROR,
    ACTION_POST_ID_NOT_SENT_ERROR: ACTION_POST_ID_NOT_SENT_ERROR,
    POST_PARENT_ERROR: POST_PARENT_ERROR,
    POST_PARENT_NOT_EXISTING_ERROR: POST_PARENT_NOT_EXISTING_ERROR,
    LATITUDE_REQUIRED: LATITUDE_REQUIRED,
    INVALID_LATITUDE: INVALID_LATITUDE,
    LONGITUDE_REQUIRED: LONGITUDE_REQUIRED,
    INVALID_LONGITUDE: INVALID_LONGITUDE,
    INVALID_PARENT_ID_FORMAT: INVALID_PARENT_ID_FORMAT,
    PARENT_POST_VALIDATION_ERROR: PARENT_POST_VALIDATION_ERROR,
    INVALID_POST_ID_FORMAT: INVALID_POST_ID_FORMAT,
    USER_NOT_FOUND_FROM_TOKEN: USER_NOT_FOUND_FROM_TOKEN
};