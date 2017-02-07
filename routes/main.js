const express = require('express');
const photo = require('../schemas/photo');
const customer = require('../schemas/customer');
const fs = require('fs');
const path = require('path');
const ip = require('ip');
const multer = require('multer');

var upload = multer({
  dest: './static/finals/',
});

module.exports = function(io) {

  const router = express.Router();

  router.get('/latestPhoto', (req, res) => {
    res.render('latestPhoto', {ipAddress: ip.address()});
  });

  router.get('/manage', (req, res) => {
    res.render('managePhotos', {ipAddress: ip.address()});
  });

  router.get('/signin', (req, res) => {
    res.render('signin', {ipAddress: ip.address()});
  });
  
  router.get('/overview', (req, res) => {
    res.render('overview', {ipAddress: ip.address()});
  });
  
  router.get('/movephotos', (req, res) => {
    res.render('movePhotos', {ipAddress: ip.address()});
  });
  
  router.get('/slideshow', (req, res) => {
    res.render('slideshow', {ipAddress: ip.address()});
  });
  
  router.get('/myphotos/', (req, res) => {
    res.render('getPhotos', {ipAddress: ip.address(), email: req.query.email});
  });
  
  router.get('/getlist', (req, res) => {
    customer.find({}).exec()
      .then((customersList) => {
        return makeCSV(customersList);
      })
      .then((csv) => {
        res.send(csv);
      });
  });
  
  function makeCSV(customerList){
    return new Promise((resolve, reject) => {
      var csv = "";
      var count = 0;
      customerList.forEach((object, index) => {
        var firstName = object.name.split(' ')[0];
        var lastName = object.name.split(' ')[1] || "";

        csv += `${firstName},${lastName},${object.email}\n`;
        count ++;
        if(count == customerList.length){
          resolve(csv);
        }
      });
    });
  }
  
  router.get('/', (req, res) => {
    res.render('index', {ipAddress: ip.address()});
  });
  
  router.post('/signin', (req, res) => {
    const newCustomer = new customer({
      name: req.body.name,
      email: req.body.email,
      paid: req.body.paid,
      releaseSigned: req.body.release,
    });

    newCustomer.save()
      .then((theCustomer) => {
        console.log(theCustomer);
        io.sockets.emit('new_customer', theCustomer);
        res.status(200).json({success: true});
      })
      .catch((err)=> {
        res.status(500).json({success: false});
      });
  });
  
  router.post('/movephoto', (req, res) => {
    let oldCustomer;
    let movedImage;
    customer.findById(req.body.from).exec()
      .then((theCustomer) => {
        oldCustomer = theCustomer;
        return findPhoto(theCustomer.photos, req.body.image);
      })
      .then((imageIndex) => {
        movedImage = oldCustomer.photos[imageIndex];
        oldCustomer.photos.splice(imageIndex, 1);
        return oldCustomer.save();
      })
      .then(() => {
        return customer.findById(req.body.to).exec();  
      })
      .then((theCustomer) => {
        theCustomer.photos.push(movedImage);
        return theCustomer.save();
      })
      .then((theCustomer) => {
        res.status(200).json({success: true, customer: theCustomer});
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({success: false});
      });
  });
  
  function findPhoto(photos, photoId){
    return new Promise((resolve, reject) => {
      console.log(photos);
      console.log(photoId);
      photos.forEach((item, index) => {
        if(item.equals(photoId)){
          resolve(index);
        }
      });
      reject("not found");
    });
  }
  
  router.put('/user/:userId/photo/:photoId', (req, res) => {
    var userId = req.params.userId;
    var photoId = req.params.photoId;
    
    photo.findById(photoId).exec()
      .then((thePhoto) => {
        thePhoto.selected = req.body.selected;
        return thePhoto.save();
      })
      .then((thePhoto) => {
        res.status(200).json({success: true});
        return null;
      })
      .then(() => {
        return customer.findById(userId).populate('photos').exec();
      })
      .then((theCustomer) => {
        io.sockets.emit('customer_updated', theCustomer);
        return null;
      })
      .catch((err) => {
        res.status(500).json({success: false});
      });
  });
  
  router.get('/users', (req, res) => {
    customer.find({}).populate('photos').exec()
      .then((theCustomers) => {
        res.status(200).json({success: true, users: theCustomers});
      })
      .catch((err) => {
        res.status(500).json({success: false});
      });
  });
  
  router.post('/user/:userId/photo/:photoId', (req, res) => {
    var userId = req.params.userId;
    var photoId = req.params.photoId;
    console.log("Adding photo");
    customer.findById(userId).exec()
      .then((user) => {
        user.photos.push(photoId);
        return user.save();
      })
      .then((user) => {
        console.log("Success");
        res.status(200).json({success: true});
        return null;
      })
      .catch((err) => {
        console.log("Fail");
        res.status(500).json({success: false});
      });
  });
  
  router.get('/lastPhoto', (req, res) => {
    photo.find({}).sort({_id: 1}).limit(1).exec()
      .then((latestPhoto) => {
        res.status(200).json({success: true, photo: latestPhoto});
      })
      .catch((err) => {
        console.log("Fail");
        res.status(500).json({success: false});
      });
  });
  
  router.post('/getphotos', (req, res) => {
    customer.findOne({email: req.body.email}).populate('photos').exec()
      .then((theUser) => {
        console.log(theUser.photos);
        res.status(200).json({success: true, photos: theUser.photos});
      })
      .catch((err) => {
        res.status(500).json({success: false});
      });
  });
  
  router.get('/photos/:id/final', (req, res, next) => {
    photo.findById(req.params.id, function(err, photo){
      if (err) return next(err)
      let filename = photo.filename.split('/');
      
      filename = filename[filename.length -1];

      filename = filename.split('.');

      filename = filename[0];
      
      res.download(path.join(photo.finalPhoto), `${filename}.jpg`);
    });
  })
  
  router.get('/photos', (req, res) => {
    photo.find({selected: true}).exec()
      .then((thePhotos) => {
      res.status(200).json({success: true, photos: thePhotos});
      })
      .catch((err) => {
        console.log("Fail");
        res.status(500).json({success: false});
      });
  });
  
  
  
  router.post('/photos/edit/:id', upload.single('file'), (req, res) => {
    photo.findById(req.params.id)
      .then((thePhoto) => {
        thePhoto.finalPhoto = req.file.path;
        thePhoto.finalMime = req.file.mimetype;
        res.status(200).json({success: true});
        io.sockets.emit('photo_edited', thePhoto);
        return thePhoto.save();
      })
      .catch((err) => {
        console.log("Fail");
        res.status(500).json({success: false});
      });;
  });
  
  
  
  return router;
  
}