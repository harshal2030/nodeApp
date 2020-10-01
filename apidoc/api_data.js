define({ "api": [
  {
    "type": "GET",
    "url": "/users/:username/avatar",
    "title": "Get user avatar image",
    "name": "avatar_image",
    "group": "MEDIA_FILES",
    "description": "<p>Get user avatar image file</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":username",
            "description": "<p>username of the user whose avatar file is to be fetched</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "404",
            "description": "<p>if user or image is not found</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "png",
            "optional": false,
            "field": "200",
            "description": "<p>Use this url in img tag to auto display image</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/multimedia.js",
    "groupTitle": "MEDIA_FILES"
  },
  {
    "type": "GET",
    "url": "/media/posts/:postId/thumbnail",
    "title": "Get thumbnails",
    "name": "get_thumbnails",
    "group": "MEDIA_FILES",
    "description": "<p>Get thumbnails of a post if exists. Usefull for placeholder while original image is loaded. Max size of this files is 25kb</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":postId",
            "description": "<p>postId of the post whose thumbnail id to be fetched</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "jpeg",
            "optional": false,
            "field": "200",
            "description": "<p>Image thumbnail file</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/multimedia.js",
    "groupTitle": "MEDIA_FILES",
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      }
    }
  },
  {
    "type": "GET",
    "url": "/media/posts/:postId/images",
    "title": "Get image of a post",
    "name": "image_post",
    "group": "MEDIA_FILES",
    "description": "<p>it will return the any images assciated with the post</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":postId",
            "description": "<p>postId of post whose images are to be fetched</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "png",
            "optional": false,
            "field": "200",
            "description": "<p>a image associated with given post id</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/multimedia.js",
    "groupTitle": "MEDIA_FILES",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/media/posts/:postId/video",
    "title": "Get video of a post",
    "name": "post_video",
    "group": "MEDIA_FILES",
    "description": "<p>Get video associated with post if any.</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":postId",
            "description": "<p>postId of the post whose video is to be fetched</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "video",
            "optional": false,
            "field": "200",
            "description": "<p>video of the post</p>"
          },
          {
            "group": "Success",
            "type": "stream",
            "optional": false,
            "field": "206",
            "description": "<p>returns the chunk of requested video. Only applicable when <i>Content-Range</i> header is present.</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": true,
            "field": "Content-Range",
            "description": "<p>usefull for streaming video instead of downloading full video</p>"
          },
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/multimedia.js",
    "groupTitle": "MEDIA_FILES",
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/posts/:username/stars?skip=0&limit=20",
    "title": "Get user stars",
    "name": "Get_user_stars",
    "description": "<p>Route for getting user stars</p>",
    "group": "POST",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":username",
            "description": "<p>username of user whose stars are to fetched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "array",
            "description": "<p>array of posts which user stared</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n....\n{\n     avatarPath: \"\", // name of avatar file\n     name: \"\",\n     id: number,\n     postId: \"wetwse+f\" // id of post,\n     username: \"\"\n     title: \"\",\n     description: \"\",\n     mediaIncluded: \"\" //type of media included in post,\n     likes: number,\n     comments: number,\n     createdAt: Date, // date on which post was created,\n     bookmarked: bool, // if user has bookmarked post,\n     liked: bool, // if user has liked post\n}\n....\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/post",
    "title": "Posting the content",
    "description": "<p>Route for registering the post of user in database</p>",
    "name": "Post",
    "group": "POST",
    "parameter": {
      "fields": {
        "Body": [
          {
            "group": "Body",
            "type": "Object",
            "optional": false,
            "field": "info",
            "description": "<p>must contain the post content</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": true,
            "field": "info.title",
            "description": "<p>title of the post</p>"
          },
          {
            "group": "Body",
            "type": "String",
            "optional": false,
            "field": "info.description",
            "description": "<p>description of the post</p>"
          },
          {
            "group": "Body",
            "type": "multipart",
            "optional": true,
            "field": "image",
            "description": "<p>optional image attachement</p>"
          },
          {
            "group": "Body",
            "type": "multipart",
            "optional": true,
            "field": "video",
            "description": "<p>optional video attachement</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "attachement and info:",
          "content": "{\n \"info\": {\n \"title\": \"this is title\"\n \"description\": \"this is description\"\n },\n \"image\": //attachement\n \"video\": //attachement\n}",
          "type": "multipart"
        },
        {
          "title": "only info:",
          "content": "{\n \"info\": {\n \"title\": \"\" // this is optional\n \"description\": \"lorem de isput\"\n }\n}",
          "type": "multipart"
        },
        {
          "title": "only attachement",
          "content": "{\n \"info\": {// this can be empty if you have attachemet}\n \"image\": // attachement\n \"video\": //attachement\n}",
          "type": "multipart"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "201",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          },
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "400",
            "description": "<p>when the request doesn't adhere above standards</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        },
        {
          "title": "Error-response:",
          "content": "{\n \"error\": \"description of what went wrong\" // only apply to 400 status code\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/posts?skip=0&limit=20",
    "title": "Get user home feed",
    "name": "User_home_feed",
    "description": "<p>Get user home feed.</p>",
    "group": "POST",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "data",
            "description": "<p>array of posts</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "likeIds",
            "description": "<p>array of ids which user liked</p>"
          },
          {
            "group": "Success 200",
            "type": "string[]",
            "optional": false,
            "field": "bookmarkIds",
            "description": "<p>array of ids which user bookmarked</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "maxDate",
            "description": "<p>latest date present in data</p>"
          },
          {
            "group": "Success 200",
            "type": "Date",
            "optional": false,
            "field": "minDate",
            "description": "<p>lowest date present in data</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n data: [\n   ....\n   {\n     avatarPath: \"\", // name of avatar file\n     name: \"\",\n     id: number,\n     postId: \"wetwse+f\" // id of post,\n     username: \"\"\n     title: \"\",\n     description: \"\",\n     mediaIncluded: \"\" //type of media included in post,\n     likes: number,\n     comments: number,\n     createdAt: Date, // date on which post was created,\n     bookmarked: bool, // if user has bookmarked post,\n     liked: bool, // if user has liked post\n   }\n   ....\n ],\n likeIds: [],\n bookmarkIds: [],\n maxDate: Date,\n minDate: Date,\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "parameter": {
      "fields": {
        "url query": [
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/posts/:postId/comments?skip=0&limit=20",
    "title": "Get comments on a post",
    "name": "get_comments",
    "description": "<p>Get comments of a post based by it's ID</p>",
    "group": "POST",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":postId",
            "description": "<p>postId whose comments are to be fetched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Array",
            "optional": false,
            "field": "array",
            "description": "<p>get array of comments on taht post</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n....\n{\n \"postId\": \"\",\n  username: \"\",\n  title: \"\",\n  id: 6,\n  description: ,\n  mediaIncluded: \"\",\n  likes: 0,\n  comments: 0,\n  createdAt: Date,\n  name: \"\",\n  avatarPath: \"default.png\"\n}\n....\n]",
          "type": "type"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/posts/:username/media?skip=0&limit=20",
    "title": "Get user post media",
    "name": "media_route",
    "description": "<p>Route for getting the any media posts.</p>",
    "group": "POST",
    "parameter": {
      "fields": {
        "url params": [
          {
            "group": "url params",
            "type": "String",
            "optional": false,
            "field": ":username",
            "description": "<p>username of user whose media is to be fetched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "array",
            "description": "<p>array of posts</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n....\n{\n    likes: number,\n    comments: number,\n    postid: \"\",\n    id: \"\",\n    mediaIncluded: \"\",\n}\n....\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/posts/:postId/comment",
    "title": "Post comment on a post",
    "name": "post_comment",
    "description": "<p>Register a comment on a post</p>",
    "group": "POST",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": "postId",
            "description": "<p>of the post on which comment is to be registered</p>"
          }
        ],
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "info",
            "description": "<p>contains comment content</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "info.description",
            "description": "<p>description of the comment</p>"
          },
          {
            "group": "body",
            "type": "multipart",
            "optional": false,
            "field": "commentMedia",
            "description": "<p>media attachement to comment body</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "example:",
          "content": "{\n info: { // this can be empty if commentMedia is not empty\n description: \"\" // comment body\n},\ncommentMedia: // attachements\n}",
          "type": "multipart"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "optional": false,
            "field": "201",
            "description": ""
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "400",
            "description": "<p>when the request doesn't adhere above standards</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        },
        {
          "title": "Error-response:",
          "content": "{\n \"error\": \"description of what went wrong\" // only apply to 400 status code\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "PATCH",
    "url": "/posts/like",
    "title": "Register like on a post",
    "name": "star_a_post",
    "description": "<p>atuomatically register/unregister like on a post</p>",
    "group": "POST",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "postId",
            "description": "<p>postId of post on which like is to be updated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Example:",
          "content": "{\n    postId: \"ert34-sdfg\" // id of the post\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "String",
            "optional": false,
            "field": "likes",
            "description": "<p>no. of likes on the post</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n    likes: number\n}",
          "type": "type"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          },
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    },
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    }
  },
  {
    "type": "GET",
    "url": "/posts/:postId/stargazers?skip=0&limit=20",
    "title": "Get stargazers on a post",
    "name": "stargazers",
    "group": "POST",
    "description": "<p>Get user who starred a post by its postId</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":postId",
            "description": "<p>postId whose stargazers are to be fetched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "array",
            "description": "<p>array of users who liked that post</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n username: \"\",\n avatarPath: default.png,\n name: \"\",\n id: 1,\n isFollowing: bool,\n follows_you: bool\n}",
          "type": "type"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/posts/:username?skip=0&limit=20",
    "title": "Get posts by certain user",
    "name": "user_posts",
    "group": "POST",
    "description": "<p>Get posts posted by specific user</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":username",
            "description": "<p>username whose posts are to be fetched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object[]",
            "optional": false,
            "field": "array",
            "description": "<p>array of posts posted by user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n....\n{\n \"postId\": \"\",\n  username: \"\",\n  title: \"\",\n  id: 6,\n  description: ,\n  mediaIncluded: \"\",\n  likes: 0,\n  comments: 0,\n  createdAt: Date,\n  name: \"\",\n  avatarPath: \"default.png\"\n}\n....\n]",
          "type": "type"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/posts.js",
    "groupTitle": "POST",
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      }
    }
  },
  {
    "type": "GET",
    "url": "/mention/:term?what=people",
    "title": "deepsearch for a term",
    "name": "deepsearch",
    "group": "SEARCH",
    "description": "<p>Search for mentions present in posts and users bio.</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":term",
            "description": "<p>term which you want to search in database.</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "String",
            "allowedValues": [
              "images",
              "videos",
              "people",
              "posts"
            ],
            "optional": false,
            "field": "what",
            "defaultValue": "posts",
            "description": "<p>what to return from searched term"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "Array",
            "optional": false,
            "field": "200",
            "description": "<p>array of posts and people according to <code>what</code> query</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Example:",
          "content": "[ // when what=posts | images | videos\n  ....\n {\n    \"id\": 1,\n    \"postId\": \"8zqc7eRxlIj1W0UfRTho-\",\n    \"username\": \"\",\n    \"title\": \"\",\n    \"description\": \"lorem ipsum de isput\",\n    \"mediaIncluded\": null,\n    \"mediaPath\": null,\n    \"likes\": 0,\n    \"comments\": 0,\n    \"createdAt\": \"2020-06-14T09:34:37.476Z\",\n    \"name\": \"\",\n    \"avatarPath\": \"default.png\",\n    \"bookmarked\": false,\n    \"liked\": false\n  },\n  ....\n]\n\n\n[ // when what=people\n   ....\n  {\n    \"id\": 1,\n    \"name\": \"\",\n    \"username\": \"\",\n    \"avatarPath\": \"default.png\",\n    \"bio\": \"in it to\",\n    \"isFollowing\": false,\n    \"follows_you\": false\n  }\n  ....\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/search.js",
    "groupTitle": "SEARCH",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/search/:query?criteria=&skip=0&limit=20",
    "title": "Search for a query",
    "name": "search",
    "group": "SEARCH",
    "description": "<p>endpoint for searching for tags and people. usefull for giving quick overview of user searched query</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":query",
            "description": "<p>term which you want to be searched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "String",
            "optional": false,
            "field": "criteria",
            "description": "<p>choose on which basis you want to search. Supported criteria includes <code>hashtag</code>, <code>people</code>. Any other will run default algorithm</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "people",
            "description": "<p>contains user info with matching query</p>"
          },
          {
            "group": "Success 200",
            "type": "Array",
            "optional": false,
            "field": "tags",
            "description": "<p>conatins tags of searched query.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "success-example:",
          "content": "{\n  \"people\": [\n      ....\n      {\n          \"username\": \"\",\n          \"name\": \"\",\n          \"avatarPath\": \"default.png\"\n      }\n      ....\n  ],\n  \"tags\": [ // tags will be empty if criteria=people\n       ....\n      {\n          \"tag\": \"query\",\n          \"posts\": 3 // no. of posts with the given tag\n      }\n      ....\n   ]\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/search.js",
    "groupTitle": "SEARCH",
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      }
    }
  },
  {
    "type": "GET",
    "url": "/hashtag/:tag?what=people",
    "title": "Search for hashtags",
    "name": "search_hashtags",
    "group": "SEARCH",
    "description": "<p>Search for hashtags present in posts and users bio.</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":tag",
            "description": "<p>tag which is to be searched exclude # symbol</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "String",
            "allowedValues": [
              "images",
              "videos",
              "people",
              "posts"
            ],
            "optional": false,
            "field": "what",
            "defaultValue": "posts",
            "description": "<p>what to return from searched tag"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "Array",
            "optional": false,
            "field": "200",
            "description": "<p>array of posts and people according to <code>what</code> query</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Example:",
          "content": "[ // when what=posts | images | videos\n  ....\n {\n    \"id\": 1,\n    \"postId\": \"8zqc7eRxlIj1W0UfRTho-\",\n    \"username\": \"\",\n    \"title\": \"\",\n    \"description\": \"lorem ipsum de isput\",\n    \"mediaIncluded\": null,\n    \"mediaPath\": null,\n    \"likes\": 0,\n    \"comments\": 0,\n    \"createdAt\": \"2020-06-14T09:34:37.476Z\",\n    \"name\": \"\",\n    \"avatarPath\": \"default.png\",\n    \"bookmarked\": false,\n    \"liked\": false\n  },\n  ....\n]\n\n\n[ // when what=people\n   ....\n  {\n    \"id\": 1,\n    \"name\": \"\",\n    \"username\": \"\",\n    \"avatarPath\": \"default.png\",\n    \"bio\": \"in it to\",\n    \"isFollowing\": false,\n    \"follows_you\": false\n  }\n  ....\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/search.js",
    "groupTitle": "SEARCH",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/mention/:user?what=people",
    "title": "Search for mentions",
    "name": "search_mentions",
    "group": "SEARCH",
    "description": "<p>Search for mentions present in posts and users bio.</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":user",
            "description": "<p>username of the mentioned user to be searched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "String",
            "allowedValues": [
              "images",
              "videos",
              "people",
              "posts"
            ],
            "optional": false,
            "field": "what",
            "defaultValue": "posts",
            "description": "<p>what to return from searched username"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "Array",
            "optional": false,
            "field": "200",
            "description": "<p>array of posts and people according to <code>what</code> query</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Example:",
          "content": "[ // when what=posts | images | videos\n  ....\n {\n    \"id\": 1,\n    \"postId\": \"8zqc7eRxlIj1W0UfRTho-\",\n    \"username\": \"\",\n    \"title\": \"\",\n    \"description\": \"lorem ipsum de isput\",\n    \"mediaIncluded\": null,\n    \"mediaPath\": null,\n    \"likes\": 0,\n    \"comments\": 0,\n    \"createdAt\": \"2020-06-14T09:34:37.476Z\",\n    \"name\": \"\",\n    \"avatarPath\": \"default.png\",\n    \"bookmarked\": false,\n    \"liked\": false\n  },\n  ....\n]\n\n\n[ // when what=people\n   ....\n  {\n    \"id\": 1,\n    \"name\": \"\",\n    \"username\": \"\",\n    \"avatarPath\": \"default.png\",\n    \"bio\": \"in it to\",\n    \"isFollowing\": false,\n    \"follows_you\": false\n  }\n  ....\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/search.js",
    "groupTitle": "SEARCH",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "PUT",
    "url": "/settings/profile",
    "title": "Update profile",
    "name": "update_profile",
    "group": "SETTINGS",
    "description": "<p> This api is used to update a user profile. However, this API will only update following fields <ol> <li>name</li> <li>bio</li> <li>location</li> <li>website</li> <li>dob</li> <li>avatarPath</li> <li>headerPhoto</li> </ol> </p>",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "info",
            "description": "<p>this object must contain user text realted content</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "info.name",
            "description": "<p>name of the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "info.bio",
            "description": "<p>bio of the user. max length is 160 characters</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "info.location",
            "description": "<p>location of the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "info.website",
            "description": "<p>website of the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "info.dob",
            "description": "<p>Birth Date of the user. Must be in yyyy-mm-dd</p>"
          },
          {
            "group": "body",
            "type": "multipart",
            "optional": false,
            "field": "avatar",
            "description": "<p>user avatar image</p>"
          },
          {
            "group": "body",
            "type": "multipart",
            "optional": false,
            "field": "user",
            "description": "<p>header photo</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n info: {\n   name: 'user',\n   bio: 'this is user bio',\n   location: 'my location',\n   dob: ''\n },\n avatar: // avatar image\n header: // header image\n}",
          "type": "multipart"
        }
      ]
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "null",
            "optional": false,
            "field": "200",
            "description": "<p>if profile update was successfull</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/settings.js",
    "groupTitle": "SETTINGS",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "400",
            "description": "<p>when the request doesn't adhere above standards</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        },
        {
          "title": "Error-response:",
          "content": "{\n \"error\": \"description of what went wrong\" // only apply to 400 status code\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/users/logoutAll",
    "title": "Logout user from all devices",
    "name": "alogoutAll",
    "description": "<p>logoutAll user from all device</p>",
    "group": "USER",
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "null",
            "optional": false,
            "field": "200",
            "description": "<p>if user is successfully loggedout</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/users/follow",
    "title": "Follow a user",
    "name": "follow_user",
    "description": "<p>Route for following a user. Your body must follow tese standards:-</p> <ol> <li>Must not be identical pair</li> <li>Must be valid username who is registered</li> </ol>",
    "group": "USER",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>username of the user whom to follow</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "request-example:",
          "content": "{\n \"username\": \"username.of.user\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "null",
            "optional": false,
            "field": "201",
            "description": ""
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "400",
            "description": "<p>if your request does not adhere above standards</p>"
          },
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    }
  },
  {
    "type": "GET",
    "url": "/users/:username/followers?skip=0&limit=20",
    "title": "Get user followers",
    "name": "get_user_followers",
    "group": "USER",
    "description": "<p>Route for getting followers of a user.</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":username",
            "description": "<p>username of the user whose followers are to be fetched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "type",
            "optional": false,
            "field": "array",
            "description": "<p>array of users with their props</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n ....\n {\n   \"username\": \"k\",\n   \"name\": \"k\",\n   \"avatarPath\": \"default.png\",\n   \"id\": 2,\n   \"isFollowing\": false, // if you are following user\n   \"follows_you\": true // if user is following you\n  }\n ....\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "GET",
    "url": "/users/:username/following?skip=0&limit=20",
    "title": "Get user followings",
    "name": "get_user_following",
    "group": "USER",
    "description": "<p>Route for getting followings of a user.</p>",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":username",
            "description": "<p>username of the user whose followings are to be fetched</p>"
          }
        ],
        "url query": [
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "skip",
            "defaultValue": "0",
            "description": "<p>no. of posts to be skiped</p>"
          },
          {
            "group": "url query",
            "type": "number",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>no. of posts to be returned in request</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "type",
            "optional": false,
            "field": "array",
            "description": "<p>array of users with their props</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "[\n ....\n {\n   \"username\": \"k\",\n   \"name\": \"k\",\n   \"avatarPath\": \"default.png\",\n   \"id\": 2,\n   \"isFollowing\": false, // if you are following user\n   \"follows_you\": true // if user is following you\n  }\n ....\n]",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/users/login",
    "title": "Log In",
    "name": "log_in",
    "group": "USER",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>must contain the user info.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "user.username",
            "description": "<p>Username of the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "user.password",
            "description": "<p>password of the user</p>"
          },
          {
            "group": "body",
            "type": "Object",
            "optional": true,
            "field": "device",
            "description": "<p>contain device info of user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.os",
            "description": "<p>OS used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.osVersion",
            "description": "<p>Version of OS used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.deviceBrand",
            "description": "<p>Brand brand used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.buildNumber",
            "description": "<p>build number of device used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.fontScale",
            "description": "<p>font scale of the device used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.uniqueId",
            "description": "<p>uniqueId of the device used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.notificationToken",
            "description": "<p>notification token of device used by user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-example",
          "content": "{\n user: {\n   username: \"username\",\n   password: \"shh..supersecret\"\n },\n device: { // totally optional\n   os: \"\",\n   osVersion: \"\",\n   deviceBrand: \"\",\n   buildNumber: \"\",\n   fontScale: \"\",\n   uniqueId: \"\",\n   notificationToken: \"\",\n }\n}",
          "type": "json"
        }
      ]
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "optional": false,
            "field": "404",
            "description": "<p>cannot find user with above credentials</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>user profile info</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.name",
            "description": "<p>name of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.username",
            "description": "<p>username of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.dob",
            "description": "<p>DOB of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.createdAt",
            "description": "<p>date on which user registered</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.avatarPath",
            "description": "<p>avatar file name of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.bio",
            "description": "<p>bio of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.location",
            "description": "<p>location of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.headerPhoto",
            "description": "<p>header photo file name of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.website",
            "description": "<p>website of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "user.followers",
            "description": "<p>followers of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "user.following",
            "description": "<p>following of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>A token to be stored and must include in every request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "success-response:",
          "content": "{\n  \"user\": {\n      \"name\": \"name\",\n      \"username\": \"\",\n      \"adm_num\": null,\n      \"dob\": \"2003-01-19\",\n      \"createdAt\": \"2020-06-14T09:32:57.413Z\",\n      \"avatarPath\": \"default.png\",\n      \"bio\": \"I'm in it to\",\n      \"location\": \"\",\n      \"headerPhoto\": null,\n      \"website\": \"\",\n      \"followers\": 2,\n      \"following\": 0\n  },\n  \"token\": \"fgdfg43-dfdfgdfg.dfgerewf.sdgsdggdfg\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/users/logout",
    "title": "Logout user",
    "name": "logout_user",
    "group": "USER",
    "description": "<p>logout user from a device</p>",
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "null",
            "optional": false,
            "field": "200",
            "description": "<p>if user is successfully loggedout</p>"
          }
        ]
      }
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          },
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "POST",
    "url": "/users",
    "title": "Create Account",
    "name": "sign_up",
    "group": "USER",
    "description": "<p>Register a user for using services provided by us</p>",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>must contain the user info.</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "user.name",
            "description": "<p>Name of the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "user.username",
            "description": "<p>username of the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "user.email",
            "description": "<p>Mail of the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "user.dob",
            "description": "<p>Birth Date of the user. Must be in yyyy-mm-dd format</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "user.password",
            "description": "<p>Pasword for the account. Must have atleast 6 characters</p>"
          },
          {
            "group": "body",
            "type": "Object",
            "optional": true,
            "field": "device",
            "description": "<p>contain device info of user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.os",
            "description": "<p>OS used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.osVersion",
            "description": "<p>Version of OS used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.deviceBrand",
            "description": "<p>Brand brand used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.buildNumber",
            "description": "<p>build number of device used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.fontScale",
            "description": "<p>font scale of the device used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.uniqueId",
            "description": "<p>uniqueId of the device used by the user</p>"
          },
          {
            "group": "body",
            "type": "String",
            "optional": true,
            "field": "device.notificationToken",
            "description": "<p>notification token of device used by user</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request Example:",
          "content": "{\n user: {\n   name: \"name\",\n   username: \"username\",\n   email: \"somebody@example.com\",\n   dob: \"2003-01-19\",\n   password: \"shh..supersecret\"\n },\n device: { // totally optional\n   os: \"\",\n   osVersion: \"\",\n   deviceBrand: \"\",\n   buildNumber: \"\",\n   fontScale: \"\",\n   uniqueId: \"\",\n   notificationToken: \"\",\n }\n}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "500",
            "description": "<p>when the server is busy or unable to process request</p>"
          },
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "400",
            "description": "<p>when the request doesn't adhere above standards</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Error-response:",
          "content": "{\n \"error\": \"description of what went wrong\" // only apply to 400 status code\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>user profile info</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.name",
            "description": "<p>name of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.username",
            "description": "<p>username of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.dob",
            "description": "<p>DOB of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.createdAt",
            "description": "<p>date on which user registered</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.avatarPath",
            "description": "<p>avatar file name of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.bio",
            "description": "<p>bio of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.location",
            "description": "<p>location of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.headerPhoto",
            "description": "<p>header photo file name of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.website",
            "description": "<p>website of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "user.followers",
            "description": "<p>followers of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "Number",
            "optional": false,
            "field": "user.following",
            "description": "<p>following of the user</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>A token to be stored and must include in every request</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "success-response:",
          "content": "{\n  \"user\": {\n      \"name\": \"name\",\n      \"username\": \"\",\n      \"adm_num\": null,\n      \"dob\": \"2003-01-19\",\n      \"createdAt\": \"2020-06-14T09:32:57.413Z\",\n      \"avatarPath\": \"default.png\",\n      \"bio\": \"I'm in it to\",\n      \"location\": \"\",\n      \"headerPhoto\": null,\n      \"website\": \"\",\n      \"followers\": 2,\n      \"following\": 0\n  },\n  \"token\": \"fgdfg43-dfdfgdfg.dfgerewf.sdgsdggdfg\"\n}",
          "type": "json"
        }
      ]
    }
  },
  {
    "type": "DELETE",
    "url": "/users/follow",
    "title": "Unfollow a user",
    "name": "unfollow_user",
    "group": "USER",
    "description": "<p>Route for unfollowing a user. your body must follow these standards</p> <ol> <li>Must not be identical pair</li> <li>Must be valid username who is registered</li> <li>User making request must be following the described user</li> </ol>",
    "parameter": {
      "fields": {
        "body": [
          {
            "group": "body",
            "type": "String",
            "optional": false,
            "field": "username",
            "description": "<p>username of user to unfollow.</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Request-Example:",
          "content": "{\n    \"username\": \"username.of.user\"\n}",
          "type": "json"
        }
      ]
    },
    "success": {
      "fields": {
        "Success": [
          {
            "group": "Success",
            "type": "null",
            "optional": false,
            "field": "200",
            "description": ""
          }
        ]
      }
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "400",
            "description": "<p>if your request doesn't adhere above standards</p>"
          },
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    }
  },
  {
    "type": "GET",
    "url": "/users/:username",
    "title": "Get user profile",
    "description": "<p>Get user profile</p>",
    "name": "user_profile",
    "group": "USER",
    "parameter": {
      "fields": {
        "url param": [
          {
            "group": "url param",
            "type": "String",
            "optional": false,
            "field": ":username",
            "description": "<p>username of the user whose profile is to be fetched</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "200": [
          {
            "group": "200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p>object with user props</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "Success-Response:",
          "content": "{\n  name: \"\",\n  username: \"\",\n  adm_num: null,\n  dob: \"2003-01-19\",\n  createdAt: \"\",\n  avatarPath: \"default.png\",\n  bio: \"I'm in it to\",\n  location: \"\",\n  headerPhoto: null,\n  website: \"\",\n  followers: 2,\n  following: 0\n}",
          "type": "type"
        }
      ]
    },
    "error": {
      "fields": {
        "Error": [
          {
            "group": "Error",
            "type": "null",
            "optional": false,
            "field": "404",
            "description": "<p>if user is not found</p>"
          },
          {
            "group": "Error",
            "type": "Object",
            "optional": false,
            "field": "401",
            "description": "<p>if user can't be authenticated</p>"
          }
        ]
      },
      "examples": [
        {
          "title": "AuthError:",
          "content": "{error: \"Please authenticate\"}",
          "type": "json"
        }
      ]
    },
    "version": "0.0.0",
    "filename": "src/router/user.js",
    "groupTitle": "USER",
    "header": {
      "fields": {
        "Headers": [
          {
            "group": "Headers",
            "type": "String",
            "optional": false,
            "field": "Authorization",
            "description": "<p>auth token for checking user.</p>"
          }
        ]
      }
    }
  }
] });
