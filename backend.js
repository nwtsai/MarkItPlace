/*
MarkItPlace
backend.js

Kevin Hsieh
1 April 2017
LA Hacks 2017

Required from front-end:
- Include https://apis.google.com/js/client.js?onload=checkAuth"
- Include a function onAuth()
*/

// -----------------------------------------------------------------------------
// GOOGLE API AUTHORIZATION
// -----------------------------------------------------------------------------

const CLIENT_ID = "127586888994-75ecbcuv81qd8g4i3480tt512b7iulhe.apps.googleusercontent.com";
const SCOPES = ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/spreadsheets"];

// Check if current user has authorized this application.
function checkAuth() {
	gapi.auth.authorize({
		client_id: CLIENT_ID,
		scope: SCOPES,
		immediate: true,
		authuser: 1
	}, handleAuthResult);
}

// Initiate auth flow in response to user clicking authorize button.
function handleAuthClick() {
	gapi.auth.authorize({
		client_id: CLIENT_ID,
		scope: SCOPES, 
		immediate: false,
		authuser: -1
	}, handleAuthResult);
}

// Call a function on successful authentication.
function handleAuthResult(response) {
	if (response && !response.error)
		onAuth();
}

// -----------------------------------------------------------------------------
// BACKEND INTERFACE
// -----------------------------------------------------------------------------

const scriptId = "Mp2ZVT-Mdv0w0H3VnXtfCmouI75eCkdR7";

// response is an object.
function userinfo(onSuccess) {
	let op = gapi.client.request({
		root: "https://www.googleapis.com",
		path: "oauth2/v1/userinfo",
		method: "GET"
	});
	op.execute(function onReturn(response) {
		onSuccess(response);
	});
}

function call(func, params, onSuccess) {
	let op = gapi.client.request({
		root: "https://script.googleapis.com",
		path: "v1/scripts/" + scriptId + ":run",
		method: "POST",
		body: {
			"function": func,
			"parameters": params
		}
	});
	op.execute(function onReturn(response) {
		if (response.error && response.error.status) {
			// Encountered a problem before the script started executing.
			console.log("Error calling API: "
				+ JSON.stringify(response, null, 2));
			alert("Error calling API! "
				+ "Did you authenticate using a g.ucla.edu account?");
		}
		else if (response.error) {
			// The API executed, but the script returned an error.
			console.log("Script error! Message: " 
				+ response.error.details[0].errorMessage);
			alert("Script error!");
		}
		else 
			onSuccess(response.response.result);
	});
}

// response is a 2-D array.
function getValues(onSuccess) {
	call("getValues", [], onSuccess);
}

// response is true if successful, false otherwise.
function appendRow(userId, row, onSuccess) {
	call("appendRow", [userId, row], onSuccess);
}

// response is true if successful, false otherwise.
function deleteRow(userId, num, onSuccess) {
	call("deleteRow", [userId, parseInt(num) + 1], onSuccess);
}
