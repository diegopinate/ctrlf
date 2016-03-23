/*
* Formats a full caption text into a list of strings
* Containing the following format:
*
* 	{ "0:01:23.000,0:01:25.000
* 	   This text displays for two seconds starting
* 	   1 minute and 23 seconds into the video.",
*	...,...,
*	}
*
*/
function formatCaption(captionText)
{
	var result = captionText.split("\n\n");
	return result;
}

/*
* Searches a captionTrack (Array of strings)
* for a string field
* Returns an array with all times in a string with format:
* {"0:01:23.000,0:01:25.000", ...}
*/
function searchCaption(field, captionTrack)
{
	var times = [];
	var caption = formatCaption(captionTrack);

	for (i = 0; i < caption.length; i++)
	{
		var n = caption[i].search(field);

		if (n != -1)
		{
			times.push(caption[i].split("\n")[0]);
		}
	}

	return times;
}

/*
* Gets a caption track from a youtube video using the Video ID
* and the Track ID
*/
function getCaptionTrack(videoId, trackId)
{
	var accessToken = "ACCESS_TOKEN";
	var devKey		= "DEVELOPER_KEY";

	var host = 'gdata.youtube.com/feeds/api/videos/' + videoId + '/captiondata/' + trackId;
	var auth = 'Bearer ' + accessToken;

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
}

// Test code
var captionTest = "0:01:23.000,0:01:25.000\nThis text displays for two seconds starting\n1 minute and 23 seconds into the video.\n\n0:02:20.250,0:02:23.8\nThis text displays from 2 minutes and 20.25 seconds after the start\nof the video until 2 minutes and 23.8 seconds after the start of the video.\n\n0:03:14.159\nThis text displays beginning 3 minutes and 14.159 seconds\nafter the start of the video for an undefined length of time.";

var data = formatCaption(captionTest);
console.log(data);

var search = searchCaption("This", captionTest);
console.log(" 'This' Search: ");
console.log(search);

var search = searchCaption("ElMikrix", captionTest);
console.log(" 'ElMikrix' Search: ");
console.log(search);
