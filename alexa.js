// Usage: var router = new alexa.Router();
// router.launch(function(session, callback, request) {}); // LaunchRequest
// router.intent("intent_name", function(params, session, callback, request) {}); // IntentRequest
// router.onSessionStarted(request, session, callback);
// router.onSessionEnded(request, session);

// Set router.applicationId to your application's ID if you want to verify the applicationId on each request.

module.exports = { 
	Router: require("./router"),
	Response: require("./response")
}
