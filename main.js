/*
Markitplace
main.js

Kevin Hsieh, Nathan Tsai
2 April 2017
LA Hacks
*/

// -----------------------------------------------------------------------------
// GLOBALS
// -----------------------------------------------------------------------------

var markers = {features: []};

var categories = {
	"Furniture": {
		"color": "blue",
		"marker_color": "#03A9F4",
		"marker_size": "medium",
		"marker_symbol": "lodging" 
	},
	"Technology": {
		"color": "orange",
		"marker_color": "#FF9800",
		"marker_size": "medium",
		"marker_symbol": "rocket"
	},
	"Clothing": {
		"color": "purple",
		"marker_color": "#673AB7",
		"marker_size": "medium",
		"marker_symbol": "clothing-store"
	},
	"Transportation": {
		"color": "yellow",
		"marker_color": "#FFEB3B",
		"marker_size": "medium",
		"marker_symbol": "car"
	},
	"Household": {
		"color": "teal",
		"marker_color": "#26A69A",
		"marker_size": "medium",
		"marker_symbol": "village"
	},
	"Food": {
		"color": "red",
		"marker_color": "#F44336",
		"marker_size": "medium",
		"marker_symbol": "restaurant"
	},
	"Pets": {
		"color": "brown",
		"marker_color": "#795548",
		"marker_size": "medium",
		"marker_symbol": "dog-park"
	},
	"Other": {
		"color": "grey",
		"marker_color": "#9E9E9E",
		"marker_size": "medium",
		"marker_symbol": "embassy"
	}
}

var checkboxes = {
	"category": [],
	"price": []
}

var priceranges = [
	[0, 10],
	[10, 25],
	[25, 100],
	[100, 9999]
];

class PriceRange {
	// ranges = array of pairs
	constructor(ranges) {
		this._ranges = ranges;
	}
	check(price) {
		for (let range of this._ranges)
			if (parseFloat(price) >= parseFloat(range[0]) 
				&& parseFloat(price) <= parseFloat(range[1]))
				return true;
		return false;
	}
}

var intervalID;

// -----------------------------------------------------------------------------
// BACK END INTERFACE
// -----------------------------------------------------------------------------

function async_onload() { login(uponLogin, true);}
function login_wrapper() { login(uponLogin);}
function uponLogin() {
	$("#userName").text(fb_name);
	$("#userProfilePicture").attr("src", fb_pfp);
	scan_wrapper();
}

function scan_wrapper() { scan(function (response) {
	$("#authorize").hide();
	if (!intervalID)
		intervalID = setInterval(scan_wrapper, 10000);
	markers = {features: []};
	let output = "";
	document.getElementById("myListings").innerHTML = "";
	for (let item of response) {
		if (item.userId == fb_userId)
			document.getElementById("myListings").innerHTML +=
				"<button onclick='deleteItem_wrapper(\"" + item.title 
				+ "\")'>Delete</button> " + item.title + " ($" + item.price 
				+ ")<br>";
		let beforeParse = item.location.split(";");
		let availabilities = [];
		for (let availability of beforeParse)
			availabilities.push(JSON.parse(availability));		
		let d = new Date();
		let currentDayOfWeek = d.getDay();
		let currentTime = d.getHours() * 100 + d.getMinutes();
		for (let availability of availabilities) {
			console.log(availability);
			if (availability["day"] == currentDayOfWeek &&
				currentTime - parseInt(availability["timeFrom"]) > 0 &&
				currentTime - parseInt(availability["timeTo"]) < 0) {
				createMarker(item.seller, availability["location"], item.title, 
					item.price, item.description, item.category, "", 
					item.userId, item.image);
				break;
			}
		}
	}
	featureLayer.setGeoJSON(markers);
});}

function deleteItem_wrapper(title) {
	deleteItem(title, scan_wrapper);
}

// -----------------------------------------------------------------------------
// FRONT END FUNCTIONS
// -----------------------------------------------------------------------------

window.onload = function() {
	// Update burger color initially and whenever the window resizes
	function updateBurgerColor() {
		if ($(window).width() < 600)
			$("#nav-icon1 span").css("background", "#726363");
		else
			$("#nav-icon1 span").css("background", "#f7f5f5");
	}
	updateBurgerColor();
	$(window).resize(function () { updateBurgerColor(); });

	// Load the checkbox filter menus
	loadCheckboxes("categoryFilter", "category");
	loadCheckboxes("priceFilter", "price");
	
	$("#nav-icon1").click(function() {
		$(this).toggleClass("open");
		hideFilterLists();
	});
}

// Initially load the filter checkbox list
function loadCheckboxes(filter_id, filter_type) {
	let filters = document.getElementById(filter_id);
	let my_filter = {};
	let labels = [];
	filters.innerHTML = "";
	if (filter_type == "price")
		for (let range of priceranges)
			labels.push("$" + range[0] + " to $" + range[1]);
	else if (filter_type == "category")
		for (let key in categories)
			labels.push(key);
	for (let i = 0; i < labels.length; i++) {
		let item = filters.appendChild(document.createElement("form"));
		let checkbox = item.appendChild(document.createElement("input"));
		let label = item.appendChild(document.createElement("label"));
		checkbox.type = "checkbox";
		$("input").addClass("filled-in checkbox-default");
		checkbox.id = labels[i];
		checkbox.checked = true;
		label.innerHTML = labels[i];
		label.setAttribute("for", labels[i]);
		checkbox.addEventListener("change", update);
		checkboxes[filter_type].push(checkbox);
	}
};

// Update the checkbox from event listener
function update() {
	let enabled = {};
	for (let i = 0; i < checkboxes["category"].length; i++)
		enabled[checkboxes["category"][i].id] = 
			checkboxes["category"][i].checked;
	ranges = [];
	for (let i = 0; i < checkboxes["price"].length; i++)
		if (checkboxes["price"][i].checked) 
			ranges.push(priceranges[i]);
	let pricerange = new PriceRange(ranges);
	featureLayer.setFilter(function(feature) { 
		return (enabled[feature.properties["category"]] 
			&& pricerange.check(feature.properties["price"]) 
			&& searchText(feature.properties["plainTextTitle"],
			feature.properties["plainTextDescription"])); 
	});
}

// Search description and title for words
function searchText(title, description) {
	let pattern = document.getElementById("searchTerm").value.trim().toLowerCase();
	if (pattern == "")
		return true;
	return title.toLowerCase().search(pattern) > -1 
		|| description.toLowerCase().search(pattern) > -1;
}

// Create a marker with the specified details, and add it to the current JSON Object
function createMarker(userName, location, title, price, description, category, 
	contactType, contactInfo, imageID) {
	let contactInformation = "<a href='https://www.facebook.com/" 
		+ contactInfo + "' target='_blank'>" + userName + "</a>"; 
	let latlng = location.split(',');
	markers.features.push(
	{
		type: "Feature",	
		geometry: {
			type: "Point",
			coordinates: [latlng[1], latlng[0]]
		},
		properties: {
			title: "<div style='font-family: Roboto; font-size: 20px;'>"
				+ "<b>" + title + "</b></div><span style='color: "
				+ "green;'><div style='margin-top: 7px; font-family: "
				+ "Roboto; font-size: 16px;'>$" + price 
				+ "</div></span>",
			description: "<span style='color: #726363;'><div "
				+ "style='margin-top: 1px; font-family: Roboto; "
				+ "font-size: 12px'>" + description + "<br>Seller: " 
				+ contactInformation + "</div>"
				+ "</span>" + (!imageID ? "" : (
				"<br><img src='http://res.cloudinary.com/mar"
				+ "kitplace/image/upload/" + imageID + "' width='100px'"
				+ " height='auto'>")),
				plainTextTitle: title,
			plainTextDescription: description,
			"category": category,
					"price": price,
					"color": categories[category].color,
					"marker-color": categories[category].marker_color,
					"marker-size": categories[category].marker_size,
					"marker-symbol": categories[category].marker_symbol
		}
	});
}

// -----------------------------------------------------------------------------
// USER INTERFACE
// -----------------------------------------------------------------------------

// A filter button is pressed
function filterButtonPressed(filter_type) {
	let categoryFilter = document.getElementById("categoryFilter");
	let priceFilter = document.getElementById("priceFilter");
	let searchBar = document.getElementById("searchbar");
	if (filter_type == "category") {
		categoryFilter.style.display = "";
		priceFilter.style.display = "none";
		searchbar.style.display = "none"
	} 
	else if (filter_type == "price") {
		categoryFilter.style.display = "none";
		priceFilter.style.display = "";
		searchbar.style.display = "none"
	} 
	else if (filter_type == "search") {
		categoryFilter.style.display = "none";
		priceFilter.style.display = "none";
		searchbar.style.display = "";
	}
}

// Hide the filter checkbox lists
function hideFilterLists() {
	categoryFilter.style.display = "none";
	priceFilter.style.display = "none";
	searchbar.style.display = "none"
}

function toggleForm() {
	let map = document.getElementById("map-leaflet");
	let form = document.getElementById("listItForm");
	let button = document.getElementById("ListItButton");
	if (map.style.display == "none") {
		map.style.display = "";
		form.style.display = "none";
		button.style.display = "";
	}
	else {
		map.style.display = "none";
		form.style.display = "";
		button.style.display = "none";
	}
}

function clearSearch() {
	document.getElementById("searchTerm").value = "";
	loadItems();
}
