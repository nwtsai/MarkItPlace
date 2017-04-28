/*
Markitplace
backend.js

Kevin Hsieh
22 April 2017

Front end must import these scripts before importing this file:
	https://sdk.amazonaws.com/js/aws-sdk-2.2.18.min.js
	https://connect.facebook.net/en_US/all.js"

Front end should provide the following before importing this file:
	function async_onload()
		Calls login silently, updates the webpage accordingly, then calls 
		scan_wrapper.
	function login_wrapper()
		Calls login, updates the webpage accordingly, then calls scan_wrapper.
	function scan_wrapper()
		Calls scan and updates the webpage accordingly.
	function put_wrapper()
		Calls put, then scan_wrapper.
	function deleteItem_wrapper()
		Calls deleteItem, then scan_wrapper.

Interface:
	function login(callback, silent)
		Logs the user in using Facebook and calls callback() upon success.
		If silent, then gives up if user is not already connected. Populates 
		global variables fb_userId, fb_name, and fb_pfp.
	function scan(callback) 
		Reads all entries in the database and calls callback(response) upon 
		success, where response is an array of JavaScript objects representing 
		items on sale.
	function makeItem(title, category, description, image, location, price)
		Returns a JavaScript object suitable for use as an argument to put.
	function put(item, callback)
		Adds item to the database and calls callback() upon success.
	function deleteItem(title, callback)
		Deletes from the database the item with the specified title and 
		belonging to the current user, if it exists, and calls callback() upon 
		success, or if the item does not exist.
*/

// -----------------------------------------------------------------------------
// GLOBALS
// -----------------------------------------------------------------------------

var fb_appId = "147787075756148", fb_userId, fb_name, fb_pfp;
var roleArn = "arn:aws:iam::666164367628:role/markitplace_auth_MOBILEHUB_1457118861";

// -----------------------------------------------------------------------------
// FUNCTIONS
// -----------------------------------------------------------------------------

function login(callback, silent) {
	FB.getLoginStatus(function (response) {
		if (response.status == "connected")
			load_profile(response.authResponse, callback);
		else if (!silent)
			FB.login(function (response) { 
				if (response.authResponse)
					load_profile(response.authResponse, callback);
				else {
					console.log(response);
					alert("Error: Facebook login failed.");
				}
			});
	});
}

function scan(callback) {
	let db = new AWS.DynamoDB.DocumentClient({
		service: new AWS.DynamoDB({region: "us-west-1"})
	});
	let params = {
		TableName: "markitplace-mobilehub-1457118861-catalog"
	};
	db.scan(params, function (error, response) {
		if (error) {
			console.log(error);
			alert("Error: scan() failed.");
		}
		else
			callback(response.Items);
	});
}

function makeItem(title, category, description, image, location, price) {
	return {
		userId: fb_userId,
		title: title,
		category: category,
		description: description,
		image: image,
		location: location,
		price: price,
		seller: fb_name
	}
}

function put(item, callback) {
	let db = new AWS.DynamoDB.DocumentClient({
		service: new AWS.DynamoDB({region: "us-west-1"})
	});
	let params = {
		TableName: "markitplace-mobilehub-1457118861-catalog",
		Item: item
	};
	db.put(params, function (error, response) {
		if (error) {
			console.log(error);
			alert("Error: put() failed.");
		}
		else
			callback();
	});
}

function deleteItem(title, callback) {
	let db = new AWS.DynamoDB.DocumentClient({
		service: new AWS.DynamoDB({region: "us-west-1"})
	});
	let params = {
		TableName: "markitplace-mobilehub-1457118861-catalog",
		Key: {
			userId: fb_userId,
			title: title
		}
	};
	db.delete(params, function (error, response) {
		if (error) {
			console.log(error);
			alert("Error: delete() failed.");
		}
		else
			callback();
	});
}

// -----------------------------------------------------------------------------
// HELPERS
// -----------------------------------------------------------------------------

window.fbAsyncInit = function () {
	FB.init({appId: fb_appId});
	if (async_onload) async_onload();
};

function load_profile(authResponse, callback) {
	AWS.config.credentials = new AWS.WebIdentityCredentials({
		RoleArn: roleArn,
		ProviderId: "graph.facebook.com",
		WebIdentityToken: authResponse.accessToken
	});
	fb_userId = authResponse.userID;
	FB.api(fb_userId, function (response) {
		if (response && !response.error) {
			fb_name = response.name;
			FB.api(fb_userId + "/picture", function (response) {
				if (response && !response.error) {
					fb_pfp = response.data.url;
					callback();
				}
			});
		}
	});
}
