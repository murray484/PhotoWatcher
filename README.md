# PhotoWatcher
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

1. Clone this repository into a folder on your server computer:
```
git clone https://github.com/murray484/PhotoWatcher.git
```
2. Run ```npm install```
