const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const Photo = require('./schemas/photo');
const config = require('./config');

const ip = require('ip');

const exphb = require('express-handlebars');

const watch = require('watch');

const Rawly = require('rawly').default;

var server = require('http').createServer(app);  
var io = require('socket.io')(server);

mongoose.connect('mongodb://localhost/photoWatch-dev');

app.engine('handlebars', exphb({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers',
             'X-Requested-With, Content-Type, X-Access-Token, content-type');
  res.header('Access-Control-Allow-Methods',
             'GET, POST, PUT, DELETE');
  next();
});

app.use(express.static(path.join(__dirname, 'static')));

const mainRoutes = require('./routes/main')(io);

app.use('/', mainRoutes);

const port = 6655;

mongoose.Promise = Promise;


watch.createMonitor(path.join(__dirname, 'static/watch_folder'), (monitor) => {
  monitor.on('created', (f, stat) => {
    const fileArray = f.split('/');
    //const filename = fileArray[fileArray.length - 1].split('.')[0];

    const pathIndex = fileArray.indexOf('watch_folder');
    const newPath = fileArray.slice(pathIndex+1, fileArray.length).join('/');
    const newFilename = newPath.split('.')[0];
    const rawly = new Rawly(f);
    
    rawly.extractPreview('1920x1080', '-preview')
      //.then((extracted) => {
        //return io.sockets.emit('new_photo', `${filename}-preview.jpg`);
      //})
      .then(() => {
        const newPhoto = new Photo({
          filename: newPath,
          previewUrl: `${newFilename}-preview.jpg`,
        });
      
        return newPhoto.save();
      })
      .then((thePhoto) => {
        return io.sockets.emit('new_photo_db', thePhoto);
      })
      .catch((err) => {
        console.log(err);
      });
  });
});


io.on('connection', (socket) => {
  socket.on('show_photo', (thePhoto) => {
    io.sockets.emit('display_photo', thePhoto);
  });
  
  socket.on('photo_selected', (data) => {
    io.sockets.emit('photo_selected_echo', data);
  })
})


console.log(ip.address());


module.exports = app;

if (!module.parent) {
  server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}
