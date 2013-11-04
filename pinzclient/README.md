== Using yeoman to scaffold angular, bootstrap, etc 

http://www.sitepoint.com/kickstart-your-angularjs-development-with-yeoman-grunt-and-bower/
http://stackoverflow.com/questions/18422020/how-to-update-and-include-twitter-bootstrap-3-on-webapp-or-yo-angular

=== Steps to Recreate

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

=== Using the yeoman generated scaffold

    npm install -g yo grunt-cli bower

That will install yeoman, grunt and bower. 
Then just run npm install as you normally would. 
Then run grunt bower-install
