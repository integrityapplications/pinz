## Notes from Angular Denver Meetup

Eric Internicola was nice enought to look through pinz and answer some questions we had. Here's a couple brief notes on his suggestions.

Use ```$log``` instead of ```console.log()```. 
Then you can do things like ```$log.info = error``` to ignore those in production or set other log levels for production.

If you're trashing DOM elements (or angular is) - there is a good opportunity for optimization.

angular cache-ing mechanism may be place for storing data across different services, components, etc.

angular.value - sort of global/shared values across the app.

Consider using route params/values to share data (if it's just a simple value). i.e. ```localhost:3000/:id``` where ":id" is a username, hash, etc.

[Angular and D3 youtube talk](https://github.com/lithiumtech/angular_and_d3) from Angular folks (on the [angular youtube channel](https://www.youtube.com/user/angularjs)) is worth watching.

