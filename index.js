var express = require('express')
var AWS = require('aws-sdk')
var fs = require('fs')
var s3 = new AWS.S3();

// For details and examples about AWS Node SDK,
// please see https://aws.amazon.com/sdk-for-node-js/
var myBucket = 'cs499lab1hackathon';
var app = express();

// This is how your enable CORS for your web service
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// file system api in node, watches folder for any changes
fs.watch('/Users/Richard/Desktop/CS_499_Cloud/Lab1DropBox/folder', (eventType, filename) => {
  console.log(`event type is: ${eventType}`);
  if (filename) {
  	// checks the event type and if a file is created/deleted, it will signal it
  	if(eventType == 'rename') {
  		// file created
  		if(fs.existsSync('/Users/Richard/Desktop/CS_499_Cloud/Lab1DropBox/folder/' + filename)) {
  			  console.log('file created');
          // uploadFileToS3(filename);
  		} else {    // file was deleted
  			  console.log('file deleted');
          deleteFileFromS3(filename);
  		}  
  	} else if(eventType == 'change') {
        console.log('filed modified');
        uploadFileToS3(filename);
    }
    console.log(`filename provided: ${filename}`);
  } else {
    console.log('filename not provided');
  }
});

app.get('/list', function(req, res){
  var params = {
    Bucket: myBucket    
  };
  s3.listObjects(params,  function(err, data){  
    console.log(data);
    for(var i = 0; i < data.Contents.length; i++) {
      data.Contents[i].Url = 'https://s3-us-west-1.amazonaws.com/' + data.Name + '/' + data.Contents[i].Key;
    }   
    res.send(data.Contents);
  })
})

function uploadFileToS3(filename) {
	fs.readFile('/Users/Richard/Desktop/CS_499_Cloud/Lab1DropBox/folder/' + filename, function (err, data) {
	  	  Bucket: myBucket,	 /* required */ 
  	  	Key: filename, //filename,
        Body: data,
        ACL: 'public-read'
		};

		s3.putObject(params, function(err, data) {
  			if (err) {
          console.log(err, err.stack); // an error occurred
        }
  			else {
          console.log("successfully uploaded data to " + myBucket, data);      // successful response
        }    
		});
	});
}

function deleteFileFromS3(filename) {
    var params = {
        Bucket: myBucket,  /* required */ 
        Key: filename,
    };

    s3.deleteObject(params, function(err, data) {
        if (err) {
          console.log(err, err.stack); // an error occurred
        }
        else {
          console.log("successfully deleted data from " + myBucket, data);        // successful response
        }    
    });
}

app.listen(5000, function () {
  console.log('Example app listening on port 5000!')
});