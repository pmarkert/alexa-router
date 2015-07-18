// Usage: var router = new alexa.Router();
// router.add(function(null, session, callback, request) {}); // LaunchRequest
// router.add("intent_name", function(params, session, callback, request) {}); // IntentRequest

module.exports = { 
	Router: Router,
}

function Router() {
	var self = this;	
	self.intents = {};
	self.applicationId = null;
	self.add = function(intent_name, callback) {
		if(callback==null) {
			callback = intent_name;
			intent_name = "";
		}
		self.intents[intent_name] = callback;
	}
	self.handler = handler;

	function handler(event, context) {
		try {
			console.log("event.session.application.applicationId=" + event.session.application.applicationId);
			if(self.applicationId && !validateApplicationId(event.session.application.applicationId)) {
				return context.fail("Invalid Application ID");
			}
			console.log(JSON.stringify(event));

			if (event.session.new) {
				onSessionStarted({requestId: event.request.requestId}, event.session);
			}

			if (event.request.type === "LaunchRequest") {
				onLaunch(event.request, event.session, function callback(text, title, reprompt, endSession) {
					console.log("LaunchRequest done.");
					return context.succeed(buildResponse(text, title, reprompt, endSession, event.session));
				});
			}
			else if (event.request.type === "IntentRequest") {
				onIntent(event.request, event.session, function callback(text, title, reprompt, endSession) {
					return context.succeed(buildResponse(text, title, reprompt, endSession, event.session));
				});
			}
			else if (event.request.type === "SessionEndedRequest") {
				onSessionEnded(event.request, event.session);
				context.succeed();
			}
		} 
		catch (e) {
			console.log("Caught global error: " + e);
			context.fail("Exception: " + e);
		}
	};

	function validateApplicationId(applicationId) {
		var requestingApplicationId = applicationId.replace("^amzn1.echo-sdk-ams.app.","");
		if(Array.isArray(self.applicationId)) {
			if(self.applicationId.indexOf(requestingApplicationId)==-1) {
				return false;
			}
		}
		else if(typeof self.applicationId === "string") {
			if(requestingApplicationId !== self.applicationId) {
				return false;
			}
		}
		return true;
	}

	function onSessionStarted(request, session) {
		console.log("onSessionStarted requestId=" + request.requestId + ", sessionId=" + session.sessionId);
		// TODO - setup for sync or async handling of session start
	}

	function onSessionEnded(request, session) {
		console.log("onSessionEnded requestId=" + request.requestId + ", sessionId=" + session.sessionId);
		// TODO - setup for sync or async handling of session cleanup
	}

	function onLaunch(request, session, callback) {
		var handler = self.intents[""];
		handler(null, session, callback, request);
	}

	function onIntent(request, session, callback) {
		var params = {};
		for(var key in request.intent.slots) {
			params[key] = request.intent.slots[key].value;
		}
		console.log("onIntent requestId=" + request.requestId + ", sessionId=" + session.sessionId + ", intent=" + JSON.stringify(request.intent.name));

		var handler = self.intents[request.intent.name] || self.intents[""];
		handler(params, session, callback, request);
	}

}

function buildResponse(output, title, reprompt, shouldEndSession, session) {
	var result = {
		version: "1.0",
		response: {
			outputSpeech: {
				type: "PlainText",
				text: output
			}
		}
	};
	if(session && session.attributes) {
		result.sessionAttributes = session.attributes;
	}
	if(title) {
		result.response.card = {
			type: "Simple",
			title: title,
			content: output
		};
	}
	if(reprompt) {
		result.response.reprompt = {
			outputSpeech: {
				type: "PlainText",
				text: reprompt
			}
		};
	}
	result.response.shouldEndSession = (typeof shouldEndSession === "undefined" ? true : false)
	return result;
}
