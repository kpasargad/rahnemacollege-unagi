# Team One

<!-- TOC -->

- [Team One](#team-one)
    - [Server API](#server-api)
    - [General Rules](#general-rules)
        - [Requests format](#requests-format)
        - [Activities](#activities)
        - [/api](#api)
    - [Sign Up](#sign-up)
    - [Sign In](#sign-in)
    - [Seeing posts](#seeing-posts)
        - [General Rules](#general-rules-1)
        - [`/api/posts`](#apiposts)
            - [example](#example)
        - [`/api/hot`](#apihot)
            - [example](#example-1)
        - [`/api/myposts`](#apimyposts)
            - [example](#example-2)
        - [`/api/mylikes`](#apimylikes)
            - [example](#example-3)
        - [`/api/posts/:postId`](#apipostspostid)
            - [example](#example-4)
    - [Posting a post and replying](#posting-a-post-and-replying)
        - [Posting a post](#posting-a-post)
                - [example](#example-5)
        - [Replying to a post](#replying-to-a-post)
            - [example](#example-6)
    - [Actions on posts](#actions-on-posts)
                - [example](#example-7)
    - [Server's answers' rules](#servers-answers-rules)
        - [List of posts](#list-of-posts)
            - [Example](#example)
        - [Accessing a single post](#accessing-a-single-post)
                - [example](#example-8)

<!-- /TOC -->

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
* `/api/posts/:postId`

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

### `/api/posts/:postId`

This method is used to see a post and all of it's parents and it's direct children.

#### example

```HTTP
GET /api/posts/12?token=yourtoken
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

When the device wants to send a reply post to another post the `parent_id` field has to be filled.

#### example

```HTTP
POST /posts
Content-Type: application/json;

{
	"text" : "Hello Server",
	"Latitude" : 80.1232,
	"Longitude" : 12.13453,
	"parent_id" : 12
}
```


## Actions on posts

The client has to send a POST request to `/posts/activity` with `token` as it's header and send the `ActionType` and `postId` in body.

Available actions:

* like
* unlike

##### example

```HTTP
POST /posts/activity
Content-Type: application/json;

{
	"action" : "like",
	"postId" : "1"
}
```

```HTTP
POST /posts/activity
Content-Type: application/json;

{
	"action" : "unlike",
	"postId" : "1"
}
```

## Server's answers' rules

Each post consists of the following fields:


* `id: Number`
* `text: String`
* `author_id: Number`
* `location: {
            coordinates: [
                Latitude,
                Longitude
            ],
            type: "Point"
        }`
* `is_liked: Boolean`
* `like_id: Number` (If the post is liked) 
* `number_of_likes: Number`
* `parent_id` (If exists)
* `parent_text: String` (If exists)
* `number_of_replies: Number`
* `hotness: Number`
* `timestamp: Number`


### List of posts

The results are sent in an array of posts.

#### Example


```HTTP
[
    {
        "id": 1007,
        "text": "salamh",
        "author_id": 1,
        "location": {
            "coordinates": [
                35,
                50
            ],
            "type": "Point"
        },
        "hotness": 8191.5961221,
        "number_of_likes": 2,
        "timestamp": 1502636282144,
        "number_of_replies": 0,
        "is_liked": true,
        "like_id": 2005,
        "parent_text": "salamh"
    },
    {
        "id": 1008,
        "text": "salamh",
        "author_id": 1,
        "location": {
            "coordinates": [
                35,
                50
            ],
            "type": "Point"
        },
        "hotness": 8191.2951058,
        "number_of_likes": 0,
        "timestamp": 1502636282762,
        "number_of_replies": 0,
        "is_liked": false,
        "parent_text": "salamh"
    },
    {
        "id": 1006,
        "text": "salamh",
        "author_id": 1,
        "location": {
            "coordinates": [
                35,
                50
            ],
            "type": "Point"
        },
        "hotness": 8191.2950836,
        "number_of_likes": 0,
        "timestamp": 1502636281761,
        "number_of_replies": 0,
        "is_liked": false,
        "parent_text": "salamh"
    }
    .
    .
    .
]
```

### Accessing a single post

The Server's result has the following fields:

* `main_post`: a single post
* `children`: array of posts
* `fathers`: array of posts

These posts do not have `parent_text` field since.

##### example
```HTTP
{
    "main_post": {
        "id": 23,
        "text": "salamh",
        "author_id": 1,
        "location": {
            "coordinates": [
                35,
                50
            ],
            "type": "Point"
        },
        "hotness": 8189.365409,
        "number_of_likes": 1,
        "timestamp": 1502549446403,
        "parent_id": 1,
        "number_of_replies": 20,
        "is_liked": false
    },
    "children": [
        {
            "id": 24,
            "text": "salamh",
            "author_id": 1,
            "location": {
                "coordinates": [
                    35,
                    50
                ],
                "type": "Point"
            },
            "hotness": 8189.8430496,
            "number_of_likes": 3,
            "timestamp": 1502549469776,
            "parent_id": 23,
            "number_of_replies": 0,
            "is_liked": false
        },
        {
            "id": 25,
            "text": "salamh",
            "author_id": 1,
            "location": {
                "coordinates": [
                    35,
                    50
                ],
                "type": "Point"
            },
            "hotness": 8189.3659442,
            "number_of_likes": 0,
            "timestamp": 1502549470488,
            "parent_id": 23,
            "number_of_replies": 0,
            "is_liked": false
        },
        {
            "id": 26,
            "text": "salamh",
            "author_id": 1,
            "location": {
                "coordinates": [
                    35,
                    50
                ],
                "type": "Point"
            },
            "hotness": 8189.3659589,
            "number_of_likes": 0,
            "timestamp": 1502549471152,
            "parent_id": 23,
            "number_of_replies": 0,
            "is_liked": false
        }
        .
        .
        .
    ],
    "fathers": [
        {
            "id": 1,
            "text": "salamh",
            "author_id": 1,
            "location": {
                "coordinates": [
                    35,
                    50
                ],
                "type": "Point"
            },
            "hotness": 8189.3646053,
            "number_of_likes": 1,
            "timestamp": 1502549410237,
            "number_of_replies": 4,
            "is_liked": false
        }
    ]
}

```
