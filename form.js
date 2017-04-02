function submitForm() {
    validateForm();
    addItem();
}

// -----------------------------------------------------------------------------
// Add availabilities
// -----------------------------------------------------------------------------

function addAvailability() {
    var list = "availability-list";
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
    var newDiv = document.createElement("div");
    newDiv.className = "input-field col s12 l3";
    newDiv.id = "item"+n;

    var html = "<select id='day"+n+"' class='validate'>";
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    html += "<option value='' selected disabled>Day of Week</option>";
    for (var i = 0; i < 7; i++) {
        html += "<option value='"+i+"'>"+days[i]+"</option>"; 
    }
    html += "</select>";
    html += "<label>Day</label>";
    html += "</div>";
    
    newDiv.innerHTML = html;
    
    document.getElementById(divname).appendChild(newDiv);
}

function addTimeFrom(divname, n) {
    var newDiv = document.createElement("div");
    newDiv.className = "input-field col s6 l2";
    newDiv.id = "item"+n;

    var html = "<input id='timeFrom"+n+"' type='text' class='validate' placeholder='00:00' />";
    html += "<label for='timeFrom"+n+"'>Time From</label>";

    newDiv.innerHTML = html;

    document.getElementById(divname).appendChild(newDiv);
}

function addTimeTo(divname, n) {
    var newDiv = document.createElement("div");
    newDiv.className = "input-field col s6 l2";
    newDiv.id = "item"+n;

    var html = "<input id='timeTo"+n+"' type='text' class='validate' placeholder='00:00' />";
    html += "<label for='timeTo"+n+"'>Time From</label>";

    newDiv.innerHTML = html;

    document.getElementById(divname).appendChild(newDiv);
}

function addLocation(divname, n) {
    var newDiv = document.createElement("div");
    newDiv.className = "input-field col s7 l4";
    newDiv.id = "item"+n;

    var html = "<input id='location"+n+"' type='text' class='validate' />";
    html += "<label for='location"+n+"'>Location</label>";

    newDiv.innerHTML = html;

    document.getElementById(divname).appendChild(newDiv);
}

function addRemoveButton(divname, n) {
    var newDiv = document.createElement("div");
    newDiv.className = "input-field col s5 l1";
    newDiv.id = "item"+n;

    var html="<a class='waves-effect waves-teal btn-flat' onClick='removeAvailability(this.parentNode.id);'>Remove</a>";
    newDiv.innerHTML = html;

    document.getElementById(divname).appendChild(newDiv);
}

// -----------------------------------------------------------------------------
// Remove availabilities
// -----------------------------------------------------------------------------

function removeAvailability(clickedID) {
    var id = "#"+clickedID;
    $(document).ready(function(){
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
    var cloud_name = "markitplace";
    var preset_name = "xaznpkyt";
    
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
        })).append("<a class='waves-effect waves-teal btn-flat cloudinary-delete'>Remove</a><br>"),

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
	var availabilities = $("#availability-list").find("select");
	var numOfAvailabilities = availabilities.length;

	// Contact
	var contactType = document.getElementById("contactType");
	var contactTypeValue = contactType.options[contactType.selectedIndex].value;
	if (contactTypeValue == "") {
		alert("Please choose a contact type");
		return false;
	}
	var contactInformation = document.getElementById("contactInformation").value;
	if (contactInformation == "") {
		alert("Please input contact information");
		return false;
	}
	if (contactTypeValue == "phone") {
		if (contactInformation.length != 12) {
			alert("Please input phone number in the format of 000-000-0000");
			return false;
		}
	}

	// Item
	var product = document.getElementById("item").value;
	if (product == "") {
		alert("Please input item name");
		return false;
	}
	var price = document.getElementById("price").value;
	if (price == "") {
		alert("Please input price");
		return false;
	}
	else if (isNaN(price)) {
		alert("Please input valid price (must be a number)");
		return false;
	}
	var category = document.getElementById("category");
	var categoryValue = category.options[category.selectedIndex].value;
	if (category == "") {
		alert("Please select a category");
		return false;
	}
	var category = document.getElementById("category");
	var categoryValue = category.options[category.selectedIndex].value;
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
	for (var i = 1; i < id+1; i++) {
		var select = document.getElementById("day"+i);
		if (select !== undefined) {
			availability++;
			var timeFrom = document.getElementById("timeFrom"+i).value;
			var timeTo = document.getElementById("timeTo"+i).value;
			var location = document.getElementById("location"+i).value;
			
			var selectValue = select.options[select.selectedIndex].value;
			
			if (selectValue == "") {
				alert("Please fill out 'Day of Week' for Availability " + availability);
				return false;
			}
			if (timeFrom == "") {
				alert("Please fill out 'Time From' for Availability " + availability);
				return false;
			}
			if (timeTo == "") {
				alert("Please fill out 'Time To' for Availability " + availability);
				return false;
			}
			if (location == "") {
				alert("Please fill out 'Location' for Availability " + availability);
				return false;
			}

            // Check for semicolon
            if (timeFrom.contains(';')) {
                alert("Please do not use semicolon(s) in 'Time From' for Availibility " + availability);
                return false;
            }
            else if (timeTo.contains(';')) {
                alert("Please do not use semicolon(s) in 'Time To' for Availibility " + availability);
                return false;
            }
            else if (location.contains(';')) {
                alert("Please do not use semicolon(s) in 'Location' for Availibility " + availability);
                return false;
            }
		}
	}

    // Check for semicolon
    if (contactInformation.contains(';')) {
        alert("Please do not use semicolon(s) in the Contact Information");
        return false;
    }
    else if (product.contains(';')) {
        alert("Please do not use semicolon(s) in the Item Name");
        return false;
    }
    else if (description.contains(';')) {
        alert("Please do not use semicolon(s) in the Description");
        return false;
    }
	return true;
}
			
// -----------------------------------------------------------------------------
// Submit Form
// -----------------------------------------------------------------------------
	
function addItem() {
	var availabilities = [];
	var numOfAvailabilities = $("#availability-list").find("select").length;
	for ( a = 1; a < numOfAvailabilities + 1; a++){
		var location = $("#location" + a).val();
		var timeFrom = $("#timeFrom" + a).val().replace(':', '');
		var timeTo = $("#timeTo" + a).val().replace(':', '');
		var timeLocation = {"day":$("#day" + a).val(), "timeFrom":timeFrom, "timeTo":timeTo, "location":location};
		availabilities.push(JSON.stringify(timeLocation,null,2));
	}
	console.log(userId, [
		userName,
		availabilities.join(';'),
		document.getElementById("item").value,
		document.getElementById("price").value,
		document.getElementById("description").value,
		document.getElementById("category").value,
		document.getElementById("contactType").value,
		document.getElementById("contactInformation").value,
		imageID
	]);
	appendRow(userId, [
		userName,
		// username, [time:location] pairs, title, price, description, category, contact type, contact information, image ID
		availabilities.toString(),
		document.getElementById("item").value,
		document.getElementById("price").value,
		document.getElementById("description").value,
		document.getElementById("category").value,
		document.getElementById("contactType").value,
		document.getElementById("contactInformation").value,
		imageID
		], function onSuccess(response) {
		Materialize.toast('You have successfully marked an item.', 5000);
	});
}