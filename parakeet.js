var list = JSON.parse($("#the-list").text());
var item = null;
var current_point_count = 0;
var parakeets_earned = 0;
var parakeets_shown = 0;
var search_for = 'parakeet';
var points_for_reward = 1;

var valid_licenses="4,5,7";
/*
4 - Attribution License (http://creativecommons.org/licenses/by/2.0/)
5 - Attribution-ShareAlike License (http://creativecommons.org/licenses/by-sa/2.0/)
7 - No known copyright restrictions (http://flickr.com/commons/usage/)
*/

var next_parakeet = {
  img_url: '',
  page_url: '',
  alt: ''
};

//Get license info
var license_url = "https://api.flickr.com/services/rest/?format=json&method=flickr.photos.licenses.getInfo&api_key=5dfc80756edad8d0566cf40f0909324e&jsoncallback=?";
var custom_shorts = {"No known copyright restrictions": "Flickr Commons"};
var license_list = [];

$.getJSON(license_url, function(data) {
  if (data.stat == "ok") {
    $.each(data.licenses.license,function(idx,el) {
      licdata = {"name": el.name,"url": el.url};
      //Assign short
      if(shortcc = licdata.url.match(/creativecommons\.org\/licenses\/([^\/]+)\//)) {
        licdata.shortname = 'CC-' + shortcc[1].toUpperCase();
      } else if(custshort = custom_shorts[licdata.name]) {
        licdata.shortname = custshort;
      } else {
        licdata.shortname = licdata.name;
      }

      license_list[el.id] = licdata;
    });
  }
});


function show_parakeet() {
  parakeets_shown++;
  $("#parakeetFrame").css("background-image", "url(" + next_parakeet.img_url + ")");
  $("#parakeetCredit").html("<a href='" + next_parakeet.page_url + "'>" + next_parakeet.alt + "</a>");
  fetch_next_parakeet();
}

function fetch_next_parakeet() {
  if (getParameterByName("search")) {
    // if they are using a URL param, take them very literally. They
    // generally know what they're doing.
    flickr_search_term = search_for;
  } else {
    // add "cute" to search if item is selected from dropdown. it just
    // works better that way.
    flickr_search_term = search_for + ",cute";
  }

  var flickr_url = "https://api.flickr.com/services/rest/?format=json&sort=interestingness-desc&method=flickr.photos.search&license=" + valid_licenses + "&extras=owner_name,license&tags=" + flickr_search_term + "&tag_mode=all&api_key=5dfc80756edad8d0566cf40f0909324e&jsoncallback=?";

  $.getJSON(flickr_url, function(data) {
    if (data.stat == "ok") {
      var i = Math.ceil(Math.random() * data.photos.photo.length);
      var photo = data.photos.photo[i];
      var attrib = "";
      if (license = license_list[photo.license]) {
        if (license.url) {
          attrib = " (<a href=\"" + license.url + "\">" + license.shortname + "</a>)";
        } else {
          attrib = " (" + license.shortname + ")";
        }
      }
      next_parakeet.img_url = "http://farm" + photo.farm + ".static.flickr.com/" + photo.server + "/" + photo.id + "_" + photo.secret + "_z.jpg";
      next_parakeet.page_url = "http://www.flickr.com/photos/" + photo.owner + "/" + photo.id;
      next_parakeet.alt = photo.title + " by " + photo.ownername + attrib;
      $("#nextParakeet").attr("src", next_parakeet.img_url);
    }
  });
}

function get_rand_item(){
  var randnum = Math.random()*list.length | 0;
  console.log("Got random item!");
  get_item(randnum);
}

function get_item(itemnum){
  console.log("Got item #"+itemnum+"!");
  item = list[itemnum+1];
  $("#itemnum").val(itemnum);
  $("#pointval").val(item.max_val);
  $("#itemtext").text(item.text + " (" + item.value + ")");
}

function complete_item(){
  point_value = Number($("#pointval").val());
  if (point_value < 0) {
    $("#woohoo").html("Please enter a valid point value :(");
    $("#woohoo").fadeIn();
    window.setTimeout(function(){$("#woohoo").fadeOut();}, 800);
    return;
  }
  current_point_count += point_value;
  parakeets_earned = current_point_count / points_for_reward;
  if (parakeets_earned >= parakeets_shown) {
    console.log("Showing parakeet!");
    show_parakeet();
    parakeets_shown = parakeets_earned;
  }
  $("#displayPoints").html(current_point_count);
  var exclamation_pts = "";
  for (var i = 0; i < Math.min(point_value, 20); i++) {
    exclamation_pts += "!";
  }
  $("#woohoo").html("Woohoo"+exclamation_pts);
  get_rand_item();
  $("#woohoo").fadeIn();
  window.setTimeout(function(){$("#woohoo").fadeOut();}, 800);
}

function set_reward(howmany) {
  points_for_reward = howmany;
  parakeets_earned = current_point_count / howmany;
  parakeets_shown = parseInt(parakeets_earned);
}

function set_search(search) {
  if (tmp = getParameterByName("search")) {
    tmp.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // sanitize
    search_for = tmp;
  } else {
    search_for = search;
  }
  set_title();
}

function set_title() {
  if (search_for != "parakeet") {
    $("#titleParakeet").html("<strike>Parakeet!</strike>");
    $("#titleSearch").html("&nbsp;" + search_for + "!");
  }
}

function getParameterByName(name) {
  name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
  var regexS = "[\\?&]" + name + "=([^&#]*)";
  var regex = new RegExp(regexS);
  var results = regex.exec(window.location.href);
  if (results === null)
    return "";
  else
    return decodeURIComponent(results[1].replace(/\+/g, " "));
}
