/**
Controller for Ctrl-F app.
*/
var app = angular.module('ctrlfApp', []);
app.controller('mainPageController', [ '$scope', '$http', '$sce', function($scope,$http, $sce){
	// This will contain a list with all IDs of the available captions
	$scope.captionList = undefined;

	/**
	* Formats a full caption text into a list of strings
	* Containing the following format:
	*
	* 	{ "0:01:23.000,0:01:25.000
	* 	   This text displays for two seconds starting
	* 	   1 minute and 23 seconds into the video.",
	*	...,...,
	*	}
	*
	* @method formatCaption
	* @param {String} captionText text to extract caption from
	* @return {Array[String]} Returns the separated captions
	*/
	$scope.formatCaption = function(captionText)
	{
		var result = captionText.split("\n\n");
		return result;
	};

	/**
	* Searches a captionTrack (Array of strings)
	* for a string field
	* Returns an array with all times in a string with format:
	* {"0:01:23.000,0:01:25.000", ...}
	*
	* @method searchCaption
	* @param {String} field String to search for
	* @param {String} captionTrack Caption text unformatted
	* @return {Array[String]} Returns the times where the field was found
	*/
	searchCaption = function(field, captionTrack)
	{
		var times = [];
		var caption = $scope.formatCaption(captionTrack);
	
		// Search all captions for the field string
		for (i = 0; i < caption.length; i++)
		{
			var n = caption[i].search(field);
	
			// if the field string was found, add the time it is shown in the video
			if (n != -1)
			{
				times.push(caption[i].split("\n")[0]);
			}
		}
	
		return times;
	};

	/**
	* Oauth2 Callback
	* Saves the token to be used later on
	* @method oauthCallback
	*/
	$scope.oauthCallback = function()
	{
		console.log("Starting Oauth");
		var callbackResponse = (document.URL).split("#")[1];
		var responseParameters = (callbackResponse).split("&");
		var parameterMap = [];
		for(var i = 0; i < responseParameters.length; i++) {
			parameterMap[responseParameters[i].split("=")[0]] = responseParameters[i].split("=")[1];
		}
		if(parameterMap.access_token !== undefined && parameterMap.access_token !== null) {
			console.log("Got access tokens!");
			auth = {
				oauth: {
					access_token: parameterMap.access_token,
					expires_in: parameterMap.expires_in,
					account_username: parameterMap.account_username
				}
			};
			window.localStorage.setItem("auth", JSON.stringify(auth));
			window.location.href = "http://localhost/Ctrl-F/ctrlf/src/main.html";
		} else {
			alert("Problem authenticating");
		}
	};

	/**
	* Debug function
	*/
	$scope.printAuth = function()
	{
		console.log("$scope.auth: " + JSON.stringify($scope.auth));
		localAuth = window.localStorage.getItem("auth");
		console.log("Local storage: " + JSON.stringify(localAuth));
	};


	/**
	* Gets a caption track from a youtube video using the Video ID
	* and the Track ID. This method should asynchronously process the track
	* and add the clickable times to the site somehow
	*
	* @methodName requestCaptionTrack
	* @param videoId The youtube video ID
	* @param trackId The caption track ID (needs to be obtained from the track list)
	*/
	$scope.requestCaptionTrack = function(videoId, trackId)
	{
		// Debug msg
		console.log("Requesting track: " + trackId);

		// Get saved authorization data
		localAuth = JSON.parse(window.localStorage.getItem("auth"));
		// This token is obtained with OAuth2 through Google in each session
		var accessToken = localAuth.oauth.access_token;
		// Developer key from Google
		var devKey	= "AIzaSyDWuGMteyvJY65erI4Y_Iu0y5hgVSj2ESQ";
		// Host for youtube video data
		var host = 'https://www.googleapis.com/youtube/v3/captions/' + trackId + "&key=" + devKey + "?access_token=" + accessToken;

		//var host = "https://gdata.youtube.com/feeds/api/videos/" + videoId + "/captiondata/" + trackId;
		// Authorization string
		var auth = 'Bearer ' + accessToken;

		// Get the caption track
		$http({
			method : 	'GET',
			url : 		host,
			headers :	{
				'Authorization' : auth,
				'GData-Version' : '2',
				'X-GData-Key'	: devKey,
			}
					
		}).then(function success(response){
				console.log("CAPTION TRACK:\n" + JSON.stringify(response));
			}, function error(response) {
				console.log("REQ CT ERROR:\n" + JSON.stringify(response));
			});
	
		// TO-DO: Maybe this can be done with angular
		// GET request to obtain the Caption track
		/*
		$.ajax({
			'url' : host,
			'type' : 'GET',
			'data' : {
				'Authorization' : auth,
				'GData-Version' : '2',
				'X-GData-Key'	: devKey,
			},
	
			'success' : function(data) {
				// TO-DO: Get the caption track and return it somehow?
				console.log(data);
				alert('Request sent!');
			}
		});
		*/
	};


	/**
	* Obtains the list of caption tracks available for a video
	* @methodName requestCaptionList
	* @param videId The youtube video ID
	*/
	$scope.requestCaptionList = function(videoId)
	{
		// Get saved authorization data
		localAuth = JSON.parse(window.localStorage.getItem("auth"));
		// This token is obtained with OAuth2 through Google in each session
		var accessToken = localAuth.oauth.access_token;
		// Developer key from Google
		var devKey	= "AIzaSyDWuGMteyvJY65erI4Y_Iu0y5hgVSj2ESQ";
		// Authorization string
		var auth = 'Bearer ' + accessToken;
		// Host needed for obtaining captions
		var host = "https://www.googleapis.com/youtube/v3/captions?part=snippet&videoId=" + videoId + "&key=" + devKey;

		// Do a GET request to obtain the caption list of the video
		$http.get(host).then(function success(response){
				console.log("RESPONSE:\n" + JSON.stringify(response));
				$scope.captionList = response.data;

				// TEST:
				$scope.requestCaptionTrack(videoId, response.data.items[0].id);
			}, function error(response){
				console.log("ERROR:\n" + JSON.stringify(response));
				$scope.captionList = undefined;
			});
	}


	/*
	* Test function for functionality
	*/
	test_captionFormat = function()
	{
			var captionTest = "0:01:23.000,0:01:25.000\nThis text displays for two seconds starting\n1 minute and 23 seconds into the video.\n\n0:02:20.250,0:02:23.8\nThis text displays from 2 minutes and 20.25 seconds after the start\nof the video until 2 minutes and 23.8 seconds after the start of the video.\n\n0:03:14.159\nThis text displays beginning 3 minutes and 14.159 seconds\nafter the start of the video for an undefined length of time.";
	
			var data = $scope.formatCaption(captionTest);
			console.log(data);
	
			var search = $scope.searchCaption("This", captionTest);
			console.log(" 'This' Search: ");
			console.log(search);
	
			var search = $scope.searchCaption("ElMikrix", captionTest);
			console.log(" 'ElMikrix' Search: ");
			console.log(search);
	}

/*-----------------------------------------------------------------------------------------------------------------------------
*****************************************URL BAR **************************************************
--------------------------------------------------------------------------------------------------------------------------------*/
	/*
	*  Creates correct Url string for ng-src attribute in iframe tag
	*  @param String: searchValue, the youtube url the user enters in input box
	*/
	$scope.getUrl = function(input){
		var urlEnd = getEndOfUrl(input); //returns the end to be appended to the youtubeUrl
		var youtubeUrl = "https://www.youtube.com/embed/" + urlEnd;
		$scope.url = $sce.trustAsResourceUrl(youtubeUrl);
	};
	
	/*
	* Parses any of the two type of youtube url strings to get the video identifier
	* @param String: url, the url the user inputs in the input tag id="urlBar"
	*/
	function getEndOfUrl(url){
		if(url){ //to make sure it's defined
			if( url.substring(0, 17) === "https://youtu.be/"){ //shortened url
				return url.substring(17);
			} else if(url.substring(0, 32) === "https://www.youtube.com/watch?v="){
				return url.substring(32);
			} else{ 
				alert("You must enter a valid YouTube URL");
			}
		}
	}
}]);


