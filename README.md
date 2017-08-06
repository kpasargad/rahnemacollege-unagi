# Team One Server
Team One's repository

## UI requests rules

### Tokens

The tokens are generated in the device and sent to the server; If they do not exist they will be added to the database otherwise their associated user-data will be passed to the called method.

The server recieves the tokens in any request's query. Here is a sample request to send a post:

*The token has to be in 32 characters but applying this restriction is controlled by changing `applyTokenSize` in `Server/unagi/api/controllers/consts/tokenConst.js`.*

##### Headers:

```
POST : localhost:3000/posts?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

##### Body:

```javascript
{
	"text" : "Hello Server",
	"Latitude" : 80.1232,
	"Longitude" : 12.13453	
}

```

### Latitude and Longitude

Latitude and longitude have to be sent to the server in two types of requests:

### Accessing a single post

To accsess a single post the post id has to be sent to the server in url params.

#### Example
``` 
POST : localhost:3000/posts/[postId]?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

POST : localhost:3000/posts/12?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

#### 1. Posting a post

When the device is posting a post the location has to be sent in the body.

##### Example

```javascript
{
	"text" : "Hello Server",
	"Latitude" : 80.1232,
	"Longitude" : 12.13453	
}

```

#### 2. Requesting to see posts

The device has to send the location in the header query when it wants to send a request to see the posts. 

#### Example

``` 
GET : localhost:3000/posts?latitude=50&longitude=50&token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```
### 3. Actions on posts

The client has to send a POST request to `/posts/activity` with `token` as it's header and send the `ActionType` and `postId` in body.

##### Example for liking a post
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

### Activities results

The server sends a JSON which it might contain one of the following fields:

`success` (which means the activity has been finished successfully)

`pop_up_error` (An error (mostly an exception) with a messege)

or none of the above which it might be because of database failures.