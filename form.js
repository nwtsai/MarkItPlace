/*
Markitplace
form.js

Frederick Kennedy, Linus Chen
2 April 2017
LA Hacks
*/

function submitForm() {
	if (validateForm())
		put_wrapper();
}

// -----------------------------------------------------------------------------
// Add availabilities
// -----------------------------------------------------------------------------

function addAvailability() {
	let list = "availability-list";
	id++;
	addSelect(list, id);
	addTimeFrom(list, id);
	addTimeTo(list, id);
	addLocation(list, id);
	addRemoveButton(list, id);
	$('select').material_select();
	Materialize.updateTextFields();
}

function addSelect(divname, n) {
	let newDiv = document.createElement("div");
	newDiv.className = "input-field col s12 l3";
	newDiv.id = "item" + n;
	let html = "<select id='day"+n+"' class='validate'>";
	let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", 
		"Friday", "Saturday"];
	html += "<option value='' selected disabled>Day of Week</option>";
	for (let i = 0; i < 7; i++) 
		html += "<option value='" + i + "'>" + days[i] + "</option>"; 
	html += "</select>";
	html += "<label>Day</label>";
	html += "</div>";
	newDiv.innerHTML = html;
	document.getElementById(divname).appendChild(newDiv);
}

function addTimeFrom(divname, n) {
	let newDiv = document.createElement("div");
	newDiv.className = "input-field col s6 l2";
	newDiv.id = "item"+n;
	let html = "<input id='timeFrom" + n
		+ "' type='text' class='validate' placeholder='00:00' />";
	html += "<label for='timeFrom" + n + "'>Time From (24-hr)</label>";
	newDiv.innerHTML = html;
	document.getElementById(divname).appendChild(newDiv);
}

function addTimeTo(divname, n) {
	let newDiv = document.createElement("div");
	newDiv.className = "input-field col s6 l2";
	newDiv.id = "item" + n;
	let html = "<input id='timeTo" + n 
		+ "' type='text' class='validate' placeholder='23:59' />";
	html += "<label for='timeTo" + n + "'>Time To (24-hr)</label>";
	newDiv.innerHTML = html;
	document.getElementById(divname).appendChild(newDiv);
}

function addLocation(divname, n) {
	let newDiv = document.createElement("div");
	newDiv.className = "input-field col s7 l4";
	newDiv.id = "item" + n;
	let html = "<input id='location" + n + "' type='text' class='validate' />";
	html += "<label for='location" + n + "'>Location</label>";
	newDiv.innerHTML = html;
	document.getElementById(divname).appendChild(newDiv);
}

function addRemoveButton(divname, n) {
	let newDiv = document.createElement("div");
	newDiv.className = "input-field col s5 l1";
	newDiv.id = "item" + n;
	var html = "<a class='waves-effect waves-teal btn-flat' "
	 + "onClick='removeAvailability(this.parentNode.id);'>Remove</a>";
	newDiv.innerHTML = html;
	document.getElementById(divname).appendChild(newDiv);
}

// -----------------------------------------------------------------------------
// Remove availabilities
// -----------------------------------------------------------------------------

function removeAvailability(clickedID) {
	var id = "#" + clickedID;
	$(document).ready(function () {
		$("div").remove(id);
	});
}

// -----------------------------------------------------------------------------
// Toggle functions
// -----------------------------------------------------------------------------

function selectItemType() {
	$("#item").toggle();
	$("#service").toggle();
}

// -----------------------------------------------------------------------------
// Image functions
// -----------------------------------------------------------------------------

$(document).ready(function() {
	let cloud_name = "markitplace";
	let preset_name = "xaznpkyt";
	$.cloudinary.config({
		cloud_name: cloud_name
	})
	$(".cloudinary-fileupload").unsigned_cloudinary_upload(preset_name, {
		cloud_name: cloud_name,
		// return_delete_token: true
	}, {
		multiple: false
	}).bind("cloudinarydone", function(e, data) {
		imageID = data.result.public_id;
		$(".imageHolder").append($.cloudinary.image(data.result.public_id, {
			format: "jpg",
			width: "100%",
			height: "auto"
		})).append("<a class='waves-effect waves-teal btn-flat "
			+ "cloudinary-delete'>Remove</a><br>"),
		$('.cloudinary-delete').click(function(){
			$.cloudinary.delete_by_token(data.result.delete_token);
			$(".imageHolder").empty();
		});
	});
});

// -----------------------------------------------------------------------------
// Validate Form
// -----------------------------------------------------------------------------

function validateForm() {
	let availabilities = $("#availability-list").find("select");
	let numOfAvailabilities = availabilities.length;

	// Item
	let product = document.getElementById("item").value;
	if (product == "") {
		alert("Please input item name");
		return false;
	}
	let price = document.getElementById("price").value;
	if (price == "") {
		alert("Please input price");
		return false;
	}
	else if (isNaN(price)) {
		alert("Please input valid price (must be a number)");
		return false;
	}
	let category = document.getElementById("category");
	let categoryValue = category.options[category.selectedIndex].value;
	if (category == "") {
		alert("Please select a category");
		return false;
	}
	
	// Availibility inputs
	if (id == 0) {
		alert("Please add an availability");
		return false;
	}
	else {
		var availability = 0;
	}
	for (let i = 1; i < id+1; i++) {
		let select = document.getElementById("day"+i);
		if (select !== undefined) {
			availability++;
			let timeFrom = document.getElementById("timeFrom" + i).value;
			let timeTo = document.getElementById("timeTo" + i).value;
			let location = document.getElementById("location" + i).value;
			var selectValue = select.options[select.selectedIndex].value;
			
			if (selectValue == "") {
				alert("Please fill out 'Day of Week' for Availability " 
					+ availability);
				return false;
			}
			if (timeFrom == "") {
				alert("Please fill out 'Time From' for Availability " 
					+ availability);
				return false;
			}
			if (timeTo == "") {
				alert("Please fill out 'Time To' for Availability " 
					+ availability);
				return false;
			}
			if (location == "") {
				alert("Please fill out 'Location' for Availability " 
					+ availability);
				return false;
			}
			
			// Check for semicolon
			if (timeFrom.indexOf(';') > -1) {
				alert("Please do not use semicolon(s) in 'Time From' for "
					+ "Availibility " + availability);
				return false;
			}
			else if (timeTo.indexOf(';') > -1) {
				alert("Please do not use semicolon(s) in 'Time To' for "
					+ "Availibility " + availability);
				return false;
			}
			else if (location.indexOf(';') > -1) {
				alert("Please do not use semicolon(s) in 'Location' for "
					+ "Availibility " + availability);
				return false;
			}
		}
	}

	// Check for semicolon
	if (product.indexOf(';') > -1) {
		alert("Please do not use semicolon(s) in the Item Name");
		return false;
	}
	else if (document.getElementById("description").value.indexOf(';') > -1) {
		alert("Please do not use semicolon(s) in the Description");
		return false;
	}
	return true;
}
			
// -----------------------------------------------------------------------------
// Submit Form
// -----------------------------------------------------------------------------

var imageID = 0;
function put_wrapper() {
	let availabilities = [];
	let toDecode = 0;
	function finishedDecoding() {
		console.log([
			document.getElementById("item").value,
			document.getElementById("category").value,
			document.getElementById("description").value,
			imageID,
			availabilities.join(';'),
			document.getElementById("price").value
		]);
		put(makeItem(
			document.getElementById("item").value,
			document.getElementById("category").value,
			document.getElementById("description").value,
			imageID,
			availabilities.join(';'),
			document.getElementById("price").value
		), function () {
			scan_wrapper();
			Materialize.toast("You have successfully marked an item.", 5000);
		});
	}
	
	let numOfAvailabilities = $("#availability-list").find("select").length;
	toDecode = numOfAvailabilities;
	for (let a = 1; a < numOfAvailabilities + 1; a++) {
		let location = $("#location" + a).val();
		
		// Find latitude, longitude from the given address
		let geocoder = new google.maps.Geocoder();
		geocoder.geocode({ "address": location }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				let latitude = results[0].geometry.location.lat();
				let longitude = results[0].geometry.location.lng();
				let timeFrom = $("#timeFrom" + a).val().replace(':', '');
				let timeTo = $("#timeTo" + a).val().replace(':', '');
				let timeLocation = {"day":$("#day" + a).val(), 
					"timeFrom" : timeFrom, "timeTo": timeTo, 
					"location": latitude + "," + longitude};
				availabilities.push(JSON.stringify(timeLocation, null, 2));
				if (--toDecode == 0)
					finishedDecoding();
			}
			else
				Materialize.toast("Invalid location.", 5000);
		});	
	}
}
