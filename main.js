L.mapbox.accessToken = 'pk.eyJ1Ijoibnd0c2FpIiwiYSI6ImNqMHhkZnJoajAwN3Uyd3FkZGh6Yjg0YWwifQ.xjVvrwXc_XQuc7hnWO4YXw';
var map = L.mapbox.map('map-leaflet', 'mapbox.streets').setView([34.068921, -118.44518110000001], 15);

var markers = {features: []};

var featureLayer = L.mapbox.featureLayer(markers).addTo(map);
featureLayer.setGeoJSON(markers);
map.scrollWheelZoom.disable();

// Global Category Objects
var categories = {
  'Furniture': {
    'color': 'blue',
    'marker_color': '#03A9F4',
    'marker_size': 'medium',
    'marker_symbol': 'lodging' 
  },
  'Technology': {
    'color': 'orange',
    'marker_color': '#FF9800',
    'marker_size': 'medium',
    'marker_symbol': 'rocket'
  },
  'Clothing': {
    'color': 'purple',
    'marker_color': '#673AB7',
    'marker_size': 'medium',
    'marker_symbol': 'clothing-store'
  },
  'Transportation': {
    'color': 'yellow',
    'marker_color': '#FFEB3B',
    'marker_size': 'medium',
    'marker_symbol': 'car'
  },
  'Household': {
    'color': 'teal',
    'marker_color': '#26A69A',
    'marker_size': 'medium',
    'marker_symbol': 'village'
  },
  'Food': {
    'color': 'red',
    'marker_color': '#F44336',
    'marker_size': 'medium',
    'marker_symbol': 'restaurant'
  },
  'Pets': {
    'color': 'brown',
    'marker_color': '#795548',
    'marker_size': 'medium',
    'marker_symbol': 'dog-park'
  },
  'Other': {
    'color': 'grey',
    'marker_color': '#9E9E9E',
    'marker_size': 'medium',
    'marker_symbol': 'embassy'
  }
}

var checkboxes = {
  'category': [],
  'price': []
}

var userId, userName;
var intervalID;

function onAuth() {
  document.getElementById("authorize-button").innerHTML = "Switch<i class='material-icons right'>person</i>";
  document.getElementById("addaccount-button").style.display = "";
  loadItems();
  userinfo(function onSuccess(response) {
    console.log("User info: " + JSON.stringify(response, null, 2));
    userId = response.id, userName = response.name;
    document.getElementById("userName").innerHTML = userName;
  });
}
function loadItems() {
  getValues(function onSuccess(response) {
    $('#authorize').hide();
	if (!intervalID)
		intervalID = setInterval(loadItems, 10000);
    var welcomeText = document.getElementById('welcome');
    welcomeText.style.display = "";
    markers = {features: []};
	let output = "";
    for (let row = 1; row < response.length; row++) {
	  
	  if (response[row][0] == userName) {
		  output += "#" + row + ": " + response[row][2] + " ($" + response[row][3] + ")<br>";
	  }
      waitingMarkers++;
	  let beforeParse = response[row][1].split(';');
	  let availabilities = [];
	  for (let availability of beforeParse)
	  	availabilities.push(JSON.parse(availability));	  
	  let d = new Date();
	  let currentDayOfWeek = d.getDay();
	  let currentTime = d.getHours() * 100 + d.getMinutes();
	  for (let availability of availabilities) {
		  
		  if (availability["day"] == currentDayOfWeek &&
			currentTime - parseInt(availability["timeFrom"]) > 0 &&
		  	currentTime - parseInt(availability["timeTo"]) < 0) {
			createMarker(response[row][0], availability["location"], response[row][2], 
				response[row][3], response[row][4], response[row][5], response[row][6], response[row][7], response[row][8]);
			break;
		  }
	  }
    }
	document.getElementById("myListings").innerHTML = output;
	drawMarkers();  // for case where there are no markers
  });
}

function deleteItem() {
  deleteRow(userId, document.getElementById("toDelete").value,
    function onSuccess(response) {
    if (response)
      loadItems();
    else
      alert("Unauthorized");
  });
}

// When the window loads
window.onload = function() {
  // Update burger color
  updateBurgerColor();

  // Interface with the button
  var listButton = document.getElementById('ListItButton');
  listButton.onclick = function() {
    // GO TO FORM PAGE
  }

  // Whenever the window resizes, update the burger size
  $(window).resize(function () {
    updateBurgerColor();
  });

  // Load the checkbox filter menus
  loadCheckboxes('categoryFilter', 'category');
  loadCheckboxes('priceFilter', 'price');

  $('#nav-icon1').click(function() {
    $(this).toggleClass('open');
    hideFilterLists();
  });
}

// Change the color of the hamburger icon
function updateBurgerColor () {
  if ($(window).width() < 1000) {
    $('#nav-icon1 span').css('background', '#726363');
  }
  else {
    $('#nav-icon1 span').css('background', '#f7f5f5');
  }
}

// Initially load the filter checkbox list
function loadCheckboxes(filter_id ,filter_type) {
  var filters = document.getElementById(filter_id);
  var my_filter = {};
  var labels = [];
  filters.innerHTML = "";
  if (filter_type == 'price')
    for (let range of priceranges)
      labels.push("$" + range[0] + " to $" + range[1]);
  else if (filter_type == 'category') {
    for (let key in categories) {
      labels.push(key);
    }
  }
  for (var i = 0; i < labels.length; i++) {
    var item = filters.appendChild(document.createElement('form'));
    var checkbox = item.appendChild(document.createElement('input'));
    var label = item.appendChild(document.createElement('label'));
    checkbox.type = 'checkbox';
    setCheckboxFormat();
    checkbox.id = labels[i];
    checkbox.checked = true;
    label.innerHTML = labels[i];
    label.setAttribute('for', labels[i]);
    checkbox.addEventListener('change', update);
    checkboxes[filter_type].push(checkbox);
  }
};

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
      if (parseFloat(price) >= parseFloat(range[0]) && parseFloat(price) <= parseFloat(range[1]))
        return true;
    return false;
  }
}

// Update the checkbox from event listener
function update() {
  var enabled = {};
  for (var i = 0; i < checkboxes["category"].length; i++) {
      enabled[checkboxes["category"][i].id] = checkboxes["category"][i].checked;
  }

  ranges = [];
  for (var i = 0; i < checkboxes["price"].length; i++) {
      if (checkboxes["price"][i].checked) 
          ranges.push(priceranges[i]);
  }
  let pricerange = new PriceRange(ranges);

  featureLayer.setFilter(function(feature) { 
    return (enabled[feature.properties["category"]] && pricerange.check(feature.properties["price"]) && searchText(feature.properties["plainTextTitle"],feature.properties["plainTextDescription"])); 
  });
}

//search description and title for words
function searchText(title, description) {
	var patterm = document.getElementById("searchTerm").value.trim().toLowerCase();
	if (patterm == "") {
		return true;
	}
	//patterm="/("+patterm.split(" ").join("|")+")/im";
	return title.toLowerCase().search(patterm) > -1 || description.toLowerCase().search(patterm) > -1;
}

// Make the checkbox style to be filled in
function setCheckboxFormat() { $('input').addClass('filled-in checkbox-default'); }

// Create a marker with the specified details, and add it to the current JSON Object
function createMarker(userName, location, title, price, description, category, contactType, contactInformation, imageID) {
  // Find latitude, longitude from the given address
  var geocoder = new google.maps.Geocoder();
  if (contactType == "facebook") {
    contactInformation = "<a href='https://www.messenger.com/t/" + contactInformation + "' target='_blank'>" + contactInformation + "</a>"; 
  }
  geocoder.geocode( { 'address': location}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var latitude = results[0].geometry.location.lat();
      var longitude = results[0].geometry.location.lng();
      
      markers.features.push(
      {
        type: 'Feature',  
        geometry: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        properties: {
          title: '<div style="font-family: Roboto; font-size: 20px;"><b>' + title + '</b></div><span style="color: green;"><div style="margin-top: 7px; font-family: Roboto; font-size: 16px;">$' + price + '</div></span>',
          description: '<span style="color: #726363;"><div style="margin-top: 1px; font-family: Roboto; font-size: 12px">' + description + '<br>Seller: ' + userName + " (" + contactInformation + ')</div></span><br><img src="http://res.cloudinary.com/markitplace/image/upload/'+imageID+'" width="100px" height="auto">',
          plainTextTitle: title,
		  plainTextDescription: description,
		  'category': category,
          'price': price,
          'color': categories[category].color,
          'marker-color': categories[category].marker_color,
          'marker-size': categories[category].marker_size,
          'marker-symbol': categories[category].marker_symbol
        }
      });
      drawMarkers();
    }
  }); 
}

function deleteMarker() {
  console.log('delete');
}

var waitingMarkers = 0;
function drawMarkers() {
  if (waitingMarkers > 0)
    waitingMarkers--;
  if (waitingMarkers == 0)
    featureLayer.setGeoJSON(markers);
}

// A filter button is pressed
function filterButtonPressed(filter_type) {
  var categoryFilter = document.getElementById("categoryFilter");
  var priceFilter = document.getElementById("priceFilter");
  var searchBar = document.getElementById("searchbar");
  if (filter_type == 'category') {
    categoryFilter.style.display = "";
    priceFilter.style.display = "none";
    searchbar.style.display = "none"
  } else if (filter_type == 'price') {
    categoryFilter.style.display = "none";
    priceFilter.style.display = "";
    searchbar.style.display = "none"
  } else if (filter_type == 'search') {
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