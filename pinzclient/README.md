== Using yeoman to scaffold angular, bootstrap, etc 

http://www.sitepoint.com/kickstart-your-angularjs-development-with-yeoman-grunt-and-bower/
http://stackoverflow.com/questions/18422020/how-to-update-and-include-twitter-bootstrap-3-on-webapp-or-yo-angular

=== Steps to Recreate

> yo
(install the angular generator, then run it. Choose 'N' when it asks if you want Bootstrap)

> bower install --save bootstrap
> bower install --save bootswatch
> bower install --save angular-strap

then follow instructions from above SO post:
npm install --save-dev grunt-bower-install
grunt bower-install
