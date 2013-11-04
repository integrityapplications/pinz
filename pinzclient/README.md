## Using yeoman to scaffold angular, bootstrap, etc 

[Kickstart your development with yeoman, grunt and bower](http://www.sitepoint.com/kickstart-your-angularjs-development-with-yeoman-grunt-and-bower/) - an overview of doing this from scratch. Slightly different than this part of the pinz.

[How to update and include Bootstrap 3 in an Angular and yeoman app](http://stackoverflow.com/questions/18422020/how-to-update-and-include-twitter-bootstrap-3-on-webapp-or-yo-angular) - yeoman's angular generators use bootstrap 2 by default, so if you need 3 you need to do a few different things.

### Other Resources

[Example Angular & D3 project](https://github.com/AngularJSDenver/DataVisualizationAngularJS) - sample project that uses Angular and a custom D3 directive to draw an animated bar chart. You'll need grunt/bower/yeoman to run it.

### Steps to Recreate

If you want to 'restart' follow these steps. If you just want to use this, see below.

> yo
(install the angular generator, then run it. Choose 'N' when it asks if you want Bootstrap)

> bower install --save bootstrap
> bower install --save bootswatch
> bower install --save angular-strap

then follow instructions from above SO post:
	npm install --save-dev grunt-bower-install
	grunt bower-install

Your index.html should have CSS that looks something like:
    <!-- build:css(.tmp) styles/main.css -->
        <link rel="stylesheet" href="styles/main.css">
           <!-- css from bower -->
           <!-- bower:css -->
           <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css" />
           <link rel="stylesheet" href="bower_components/bootstrap-datepicker/css/datepicker.css" />
           <link rel="stylesheet" href="bower_components/bootstrap-timepicker/css/bootstrap-timepicker.min.css" />
           <link rel="stylesheet" href="bower_components/bootstrap-select/bootstrap-select.css" />
           <!-- endbower -->
        <!-- endbuild -->
        <link rel="stylesheet" href="bower_components/bootswatch/flatly/bootstrap.css" />
But you'll have to include the bootswatch (if you want it) separately (see the last line). Not sure how to fix that yet.

The JS should look something like:
     <!-- build:js scripts/modules.js -->
        <script src="bower_components/angular-resource/angular-resource.js"></script>
        <script src="bower_components/angular-cookies/angular-cookies.js"></script>
        <script src="bower_components/angular-sanitize/angular-sanitize.js"></script>
        <!-- endbuild -->

        <!-- build:js({.tmp,app}) scripts/scripts.js -->
          <!-- bower:js -->
          <!-- endbower -->

        <script src="scripts/app.js"></script>
        <script src="scripts/controllers/main.js"></script>
        <!-- endbuild -->

## Using the yeoman generated scaffold

    npm install -g yo grunt-cli bower

That will install yeoman, grunt and bower. 
Then just run npm install as you normally would. 
Then run grunt bower-install

### Development and testing

Instructions for development and testing.

#### Front End Only via Grunt

To run the grunt-based development server (and only edit/test the html/javascript on the client), run
	grunt server

This will open it in a browser, give you live reloading (change a js/html file and it will reload for you), etc. This won't allow you to test the api (yet).

#### Full Stack Testing

Easy option
    npm install -g nodemon
    nodemon server.js

This will kick off the node server that hosts the API and the client. nodemon will watch your filesystem for changes, so if you edit/save a file it should restart node.
You can also just run 
	```npm start```
or
   ```node server.js```

If you want to run the artifacts that are built via grunt (minified and uglified JS), run ```grunt build```
This will produce build files in /dist.
Edit your server.js file to point to "/pinzclient/dist" as a static source so that node can serve up these files.
Then run 
	npm start
or
	nodemon server.js 
to run the server.
