# PhotoWatcher
![Photographer Console](https://s31.postimg.org/r2kbes3zf/photographer_console.png)
This project was created to help manage a photo day event we ran at our university.  It provides the following functions:

* Watches a folder for new images and adds them to the database
* Converts Camera RAW images into jpg thumbnails.
* Collects names and emails from each client
* Tracks the client of each photo
* Tracks the final selected images for each client
* Provides a slideshow of all final images
* Provides a full screen viewer of the latest photo taken
* Tracks which photos have been edited
* Allows clients to access their photos from a simple website with their email
* Exports a CSV list of names and emails that can be imported into a system such as MailChimp.

This project was created in a very short timeframe (~3 days), and as such, the code is a bit messy.  I am currently working
on refining the code to be cleaner, and to have more features.

# Requirements
To run this system, you need the following:
1. A computer with NodeJS/MongoDB installed - this must be the computer that the camera is connected to.
2. Adobe Lightroom, or some other program that allows you to tether your camera to your computer and download the photos into a folder
3. Devices with web browsers to run the various clients.

# Install Instructions
To install PhotoWatcher, follow these steps.

1. Clone this repository into a folder on your server computer: ```git clone https://github.com/murray484/PhotoWatcher.git```
2. Run ```npm install```
3. Edit the watchFolder variable in config.js to match the session name of your tethering session.  It must remain inside the static/watch_folder directory (this is required for Lightroom, you might have to alter this depending on the software you use).  
4. Start the server by running ```npm start```

# Usage
The application is divided into several components.  Their usage is detailed in the following sections.  Each screen is accessible from links on the main page (available at http://localhost:6655).

## Signin Kiosk
The sign in kiosk is a simple for that collects the name and email address of each client.  Once submitted, it adds the user to the database, and notifies the photographer console through a websocket connection.
![Signin Kiosk](https://s31.postimg.org/4rwget6p7/signin.png)

## Client Viewer
![Client Viewer](https://s31.postimg.org/523yy5lbf/viewer.png)
The client viewer is intended to run fullscreen on a large TV or other display.  By default, it will show the last image imported into the system.  By clicking anywhere on the screen, you can access the settings window.  Here, you can choose to enable "Follow Selector" mode, which will allow the photographer console to control the image shown on the display.
![Client Viewer Settings](https://s31.postimg.org/y38b7k5rf/viewer_settings.png)

## Photographer Console
![Photographer Console](https://s31.postimg.org/r2kbes3zf/photographer_console.png)
The photographer console is the main controller of the system.  To use it, you begin by selecting the name of the client you are about to photograph.  This can be done by cycling through the names using the arrows on the bottom bar, or by clicking the current name and selecting the desired name from the list.  New names will appear as they are added through the signin kiosk.

Once you have selected your client, any photos you take will automatically appear as thumbnails on the console.  If "follow selector" is enabled on the Client Viewer, you can click each thumbnail to make it appear on the viewer.  To select the final images, simply click the green "Select" button below each thumbnail.  The border will turn green, indicating that the image has been selected.

## Slideshow
![Slideshow View](https://s31.postimg.org/fwgtmcf1n/slideshow_view.png)
The slideshow view is a simple full screen slideshow of all of the "selected" images in the system.  Each image is shown for 5 seconds.  New photos are automatically added as they are selected, and photos are removed if they are deselected from the photographer console.

## Overview/Editor
![Overview](https://s31.postimg.org/i3pno09pn/editor_screen.png)
The Overview/Editor screen is a list of all of the clients and their selected photos.  It provides an easy interface to track and manage the photos as they are taken and edited.

Clicking on a thumbnail will open up the editor window.  Here, you are given a link to download the RAW photo, and an area to upload an edited jpg of the image.  These will be delivered to the client.  When a photo has been edited, it's thumbnail will turn green.  This also happens in real time.
![Editor](https://s31.postimg.org/9wt2iou97/edit_photo.png)

## Get Photos
![Get Photos](https://s31.postimg.org/e3dwy0tuz/get_photo_view.png)
This view is intended for clients.  When we ran this app, we ran the entire event off of localhost, and then uploaded just this view to a public web server to allow our clients to retreive their photos.  This required editing the main routes file in ```./routes/main.js``` and commenting out all of the other routes.  This page has two ways to access it.  The first method is to visit the page and enter your email address.  The other method is to include the email as a url parameter.  This allows you to programatically send links (we sent an email with MailChimp).  Once the user is authenticated with their email, they will see the following screen:
![My Photos](https://s31.postimg.org/5juj09lij/my_photos.png)

## Generate CSV
Finally, there is an option to generate a csv file of all of the names and email addresses.  We added this so that we could get a nice list to import into MailChimp.  Please note that as of now, there is no authentication on this route, and as such, it should only be enabled on localhost.  Simply visit ```localhost:6655/getlist```.  The contents of the file will be shown in the browser as plain text.  Copy and paste this as you please.



