const express = require('express')
const streamifier = require('streamifier');
const { Readable } = require('stream');
const axios = require('axios')
var FormData = require('form-data');
var fs = require('fs');
var request = require('request');
const multer = require('multer')
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './tmp/')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({storage: storage})
const app = express()
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
const port = 3000

//requestBirdnetApi(fs.createReadStream("./assets/birdtest.wav"));

app.post('/upload', upload.single('audioData'), function (req, res, next) {
  const temporaryFilename = req.file.path,
  wavData = fs.createReadStream(temporaryFilename),
  bytes = fs.statSync(temporaryFilename)["size"];

  this.requestBirdnetApi(wavData, function(birdnet) {
    // Where "r" is the result of the callback
   // res.json({ ok: true, bytes, birdnet, at: new Date() });
    res.json(birdnet);
    deleteFolderRecursive("./tmp/");
});

  //return res.json({ ok: true, bytes, at: new Date() });
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

requestBirdnetApi = function(stream, returnFunction) {
  //console.log(stream);

  var data = {
    upload: stream,
		meta: "{\"deviceId\":\"6668948700\",\"appVersion\":\"1.83\",\"ts\":1616790316034,\"author\":{\"name\":\"\",\"email\":\"\"},\"recordingId\":15,\"gps\":{\"lat\":52.379189,\"lon\":4.899431,\"alt\":1},\"city\":\"\",\"eBird_threshold\":0.05999999865889549,\"week\":0,\"os\":\"Android\",\"sensitivity\":1.25}"
  };

  const options = {
    method: "POST",
    url: "https://birdnet.cornell.edu/api2/upload",
    port: 443,
    headers: {
        "Content-Type": "multipart/form-data"
    },
    formData : data
};

request(options, function (err, res, body) {
    if(err){ 
      console.log(err);
      returnFunction(err);
    }
    console.log(body);
    returnFunction(body);
});

}


app.get('/', (req, res) => {
  res.json("You should upload files to /upload!");
})


// Used for deleting all files and sub-folders from 'public/upload/*'
// Multer : stores temporary files in this folder
var deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function (file, index) {
          var curPath = path + "/" + file;
           if (fs.lstatSync(curPath).isDirectory()) { // recurse
              deleteFolderRecursive(curPath);
              fs.rmdirSync(curPath);
          } else { // delete file
              fs.unlinkSync(curPath);
          }
      });
  }
};