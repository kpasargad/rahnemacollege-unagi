# Team_One
Team One's repository

## UI requests rules

### Tokens

The tokens are generated in the device and sent to the server; If they do not exist they will be added to the database otherwise their associated user-data will be passed to the called method.

The server recieves the tokens in any request's query. Here is a sample request to send a post:

*The token has to be in 32 characters but this is not checked in the server deliberately for development ease.*

##### Headers:

```
POST : localhost:3000/posts?token=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
```

##### Body:

```
{
	"text" : "Hello Server",
	"Latitude" : 80.1232,
	"Longitude" : 12.13453	
}

```

### Latitude and Longitude

Latitude and longitude have to be sent to the server in two types of requests:

#### 1. Posting a post

When the device is posting a post the location has to be sent in the body.

##### Example

```
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

```
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