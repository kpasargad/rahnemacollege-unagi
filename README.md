# Team One

## Server API

## General Rules

### Requests format

We will demonstrate the requests in `JSON` format here but one can also send the requests in any other format like `x-www-form-urlencoded`.

### Activities 

Some requests need to get the server's success message to proceed (such as: like, unlike, signup, signin, etc.) so whenever that request has been successful the server sends a `JSON` object with a `success` field to the device; otherwise (if there is a problem with the request) the server sends a json object with a `pop-up-error` field to the device.

* If there __exists__ a `success` field and it's value equals `true` then the request has ended in success.

* A `pop_up_error` field contains a message that can be shown to the user.

### /api

Any request to any url that starts with `/api` has to provide `token`.

## Sign Up

A sign up request looks like:


```HTTP
POST /signup
Content-Type: application/json;
{
	"username" : username,
	"password" : password,
	"email" : email,
	"name" : name
}
```

## Sign In 

A sign in request looks like:

```HTTP
POST /signin
Content-Type: application/json;

{
	"username" : username,
	"password" : password,
	"imei" : imei
}
```

Result:

* __Success__

```HTTP
{
    "success": true,
    "message": "Enjoy your tokens!",
    "client_id": client_id,
    "refreshToken": refreshToken,
    "accessToken": accessToken
    }
```
* __Failure__

```HTTP
{
    "success": false,
    "message": "Authentication failed. Wrong password."
}
```

## Seeing posts

There are several urls that the user can request to, to see the posts

* `/api/posts`
* `/api/hot`
* `/api/myposts`
* `/api/mylikes`

In each request 20 posts are sent.

### General Rules


### `/api/posts`

This method is used to see the posts nearby.

One has to send `latitude`, `longitude` and `lastpost`(optional) to see the posts.
`lastpost` is the `id` of the last post which has been sent to the device.

If there is no `lastpost` provided the server will send the latest posts.

#### example

```HTTP
GET /api/posts?token=yourtoken&latitude=35&longitude=50&lastpost=12
```

### `/api/hot`

This method is used to see the hot posts nearby.

One has to send `latitude`, `longitude` and `lasthotness`(optional) to see the posts.
`lasthotness` is the `hotness` of the last post which has been sent to the device.

If there is no `lasthotness` provided the server will send the hottest posts.

#### example

```HTTP
GET /api/hot?token=yourtoken&latitude=35&longitude=50&lasthotness=9000
```

### `/api/myposts`

This method is used to see the recent posts of the user.

One has to send `lastpost`(optional) to see the posts.
`lastpost` is the `id` of the last post which has been sent to the device.

If there is no `lastpost` provided the server will send the latest posts.

#### example

```HTTP
GET /api/myposts?token=yourtoken&lastpost=12
```
### `/api/mylikes`

This method is used to see the posts that this user has recently liked.

One has to send `lastlikeid`(optional) to see the posts.
`lastpost` is the `like_id` of the last post which has been sent to the device.

If there is no `lastlikeid` provided the server will send the latest posts.

#### example

```HTTP
GET /api/mylikes?token=yourtoken&lastpost=12
```

## Posting a post and replying

### Posting a post

When the device is posting a post the location has to be sent in the body.

##### example

```HTTP
POST /posts
Content-Type: application/json;

{
	"text" : "Hello Server",
	"Latitude" : 80.1232,
	"Longitude" : 12.13453	
}
```

### Replying to a post






## Actions on posts

The client has to send a POST request to `/posts/activity` with `token` as it's header and send the `ActionType` and `postId` in body.

##### example

```javascript
POST:localhost:3000/posts/activity?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

{
	"action" : "like",
	"postId" : "1"
}
```

## Server's answers' rules

### Result posts:

The results are sent in an array of posts, and each post consists of the following fields:

* `id : Number`

* `text : String`

* `author_id : Number`

* `location: {
            coordinates: [
                Latitude,
                Longitude
            ],
            type: "Point"
        }`

* `is_liked : Boolean`

* `number_of_likes : number`

#### Example

```javascript
[
    {
        "id": 8,
        "text": "Hello another user",
        "author_id": 2,
        "location": {
            "coordinates": [
                50.00,
                50.00
            ],
            "type": "Point"
        },
        "is_liked": false,
        "number_of_likes": 0
    },
    {
        "id": 9,
        "text": "Hello Server",
        "author_id": 1,
        "location": {
            "coordinates": [
                12.13,
                13.213
            ],
            "type": "Point"
        },
        "is_liked": true,
        "number_of_likes": 1
    }
]
```