var player;
var hexagons;
var searchFlag = false;
var videoRuning = false;
var playListData = new Array();
var currentTrack = 0;
var lastClicked;
var logoElement  = $("#logo");
var searchResult;
var API_KEY = 'AIzaSyDFl8JwiTJHz4mFwzAzewWrDniDPDcSa9s';
var service_url = 'https://www.googleapis.com/freebase/v1/mqlread';
var imgPrefix = "https://usercontent.googleapis.com/freebase/v1/image/";
var imgSuffix = "?maxwidth=1500&maxheight=1500";
//ori
var relatedArtists = new Array();



$(document).ready(function(){
	   //var basePath = "http://en.wikipedia.org/w/api.php?action=query&list=allimages&format=json&aisort=name&aidir=newer&aiprop=url&ailimit=10&titles="+value+"&generator=images&gimlimit=10&callback=?";
       //var prop = "http://en.wikipedia.org/w/api.php?action=query&prop=images&format=json&imlimit=10&callback=?"
    initHexagons();
    //youtube api initialize
    var tag = document.createElement('script');
    tag.src = "//www.youtube.com/player_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    $(".lab_item").hover(function() {
      if(!searchFlag)
        $(this).find(".inner_lab_item .hexagon2 .hexagon-in2").addClass('bg-search');
      else
      {
        var hex = getHexagonById($(this).attr("id"));
        if(hex.getState() != 0)
         $(this).find(".inner_lab_item .hexagon2 .hexagon-in2").addClass('bg-selected');
        $(this).find(".artist").show();
      }
        
    }, function() {
       $(this).find(".inner_lab_item .hexagon2 .hexagon-in2").removeClass('bg-search');
        $(this).find(".inner_lab_item .hexagon2 .hexagon-in2").removeClass('bg-selected');
        $(this).find(".artist").hide();
    });

    $(".lab_item").click(function(){

      if(!searchFlag)
      {
        lastClicked = $(this).attr('id');   
        $("header").slideDown('slow', function() {
          
        });
        //console.log(logoElement);
        $("#logo").animate({
          "height": "37px",
          "width" : "136px"},
          180, function() {
         
        });
        $("#logo").addClass("white");
        $("#search").click(function(){
          var hexa = getHexagonById(lastClicked);
			
          searchAndSet($("#label").val(),hexa, true);
        });
        $("#label").keyup(function(event) {
          if(event.keyCode == 13){
             $("#search").click();
          }
        });
      }
      else //Ori ------> Start Here
      {
        // second click & up logic
         lastClicked = $(this).attr('id');
         var tempHex = getHexagonById(lastClicked);
         if(tempHex.getState() == 0)
         {
            // open dialog and ask to clean the grid
            clearGrid();
            clearPlaylist();
         }
         else
         {
           // remove temporary items from grid 
           var selected;
           $.each(relatedArtists, function(index, val) {

              if(this.getId() != lastClicked)
              {
                removeBackground(this.getId());
                var hex = getHexagonById(this.getId());
                hex.setState(0);
              }
              else
              {
                tempHex.setState(1);
              }
           });
           relatedArtists = [];
           // search for related artists
           getRelatedArtist(tempHex.getMusician(), lastClicked);
           searchFlag = true;
       }
      }
    });

    // event handlers

    $("#show-playlist").click(function() {
      LoadTrack(playListData[currentTrack]);
      $(this).hide('fast');
      $("#playlist-wrapper").slideToggle("slow");
    });

    $("#close-wrapper").click(function() {
      $("#playlist-wrapper").slideUp('slow', function() {
      });
      $("#show-playlist").show('slow');
    });

    $("#playlist").delegate('li', 'click', function(event) {
      updataPlayer($(this).attr('hexid'));
    });

    
});



function getDataDBPdia(artist)
{
	var showText;
	$.get("http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryClass=artist&QueryString="+artist+"&MaxHits=1", {}, function(data) {
		if($(data).find("Description").text().trim() == ""){
			$.get("http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryClass=band&QueryString="+artist+"&MaxHits=1", {}, function(data) {	
				showText = $(data).find("Description").text().trim();		
			}, "xml");
		}else{
			showText = $(data).find("Description").text().trim();
		}
		$(".intro-text").append(showText);
	}, "xml");
}

function searchAndSet(artist, hex, related)
{
  
  var q3 = [{
    "name": artist,
    "type": "/music/musical_group",
    "/music/artist/genre": [],
    "/common/topic/topic_equivalent_webpage": [],
    "/music/artist/active_start": [],
    "/music/artist/active_end": [],
    "/common/topic/image" : [{"id" : null}],
  
  }];

  var params = {
                    'key': API_KEY,
                    'query': JSON.stringify(q3)
                  };

  $.getJSON(service_url + '?callback=?', params, function(response) {
    try{
        result = response.result[0];
        if(result != null && result !== undefined)
         {
          hex.setMusician(result["name"]);
        hex.setGenres(result["/music/artist/genre"]);
        hex.setYears(result["/music/artist/active_start"][0] +" - "+ result["/music/artist/active_end"][0]);
        hex.setWikiLink(result["/common/topic/topic_equivalent_webpage"]);
        var img = imgPrefix + result["/common/topic/image"][0]["id"] + imgSuffix;
        hex.setImage(img);
        searchResult = hex;
       if(related)
       {
          hex.setState(1);
          
       }
        
      else
        hex.setState(2);

        if(!searchFlag)
        {
          //good search result
           $("header").slideUp("slow");
           $("#logo").removeClass("white");
           $("#logo").animate({
              "height": "55px",
              "width" : "200px"},
              180, function() {
             
            });
           searchFlag = true;
           $("header #search-bar .error").hide();
          $("#show-playlist").show('slow');
         

        }
       fillHexagon(hex.getId(), "url("+searchResult.getImage()+")", hex.getMusician());
       getItroText(hex, artist);
       hex.setBlock(false);
       // Ori
       if(!related)
       { 
          relatedArtists.push(hex);
       }

       if(related)
       {
          getRelatedArtist(artist, hex.getId());
       }
        
      }
        else throw "error"; 
    }
    catch(err){
      console.log("bad result");
      $("header #search-bar .error").show();
      hex.setBlock(false);
    }
      
    });

}
function getRelatedArtist(artist, hexId)
{
  
  var q1 = [{
    "name": artist,
    "type": "/music/musical_group",
    "/music/artist/genre": []
  }];

  
  var q3 = [{
  "name": artist,
  "type": "/music/musical_group",
  "/music/artist/genre": [],
  "/common/topic/topic_equivalent_webpage": [],
  "/music/artist/active_start": [],
  "/music/artist/active_end": [],
  "/common/topic/image" : [{"id" : null}],
 // "article" : []
}];

  var params = {
                    'key': API_KEY,
                    'query': JSON.stringify(q1)
                  };

var result;
 $.getJSON(service_url + '?callback=?', params, function(response) {
    //console.log(response.result);
    result = response.result[0];
    var genres = response.result[0]["/music/artist/genre"];
        var q2 = [{
    "id": null,
    "name": null,
    "name!=": artist,
    "type": "/music/artist",
    "genre": [{
      "name|=": genres
    }],
    "/common/topic/topic_equivalent_webpage": [],
  "/music/artist/active_start": [],
  "/music/artist/active_end": [],
  "/common/topic/image" : [{"id" : null}],
  "/music/artist/genre": []
  }];


  var params = {
                    'key': API_KEY,
                    'query': JSON.stringify(q2)
                  };
                   playListData.push(getHexagonById(hexId));
                  addToPlayList(getHexagonById(hexId));
     $.getJSON(service_url + '?callback=?', params, function(response) {

        var neigbors = getHexNeighbors(hexId);
       fillNeighbors(neigbors, 0, response.result, 0);
     });


    });
}

function fillNeighbors(neigbors, nIndex, relateds, rIndex)
{
  if(nIndex >= neigbors.length || !relateds[rIndex])
    return;
  var current = relateds[rIndex];
    if(current["name"] && current["/music/artist/genre"] && current["/common/topic/image"][0]["id"]) 
    {
      console.log(current);
      result = current;
      neigbors[nIndex].setMusician(result["name"]);
      neigbors[nIndex].setGenres(result["/music/artist/genre"]);
      neigbors[nIndex].setYears(result["/music/artist/active_start"][0] +" - "+ result["/music/artist/active_end"][0]);
      neigbors[nIndex].setWikiLink(result["/common/topic/topic_equivalent_webpage"][0]);
      var img = imgPrefix + result["/common/topic/image"][0]["id"] + imgSuffix;
      neigbors[nIndex].setImage(img);
      fillHexagon(neigbors[nIndex].getId(), "url("+neigbors[nIndex].getImage()+")", neigbors[nIndex].getMusician());
      getItroText(neigbors[nIndex], result["name"]);
      neigbors[nIndex].setState(2);
      relatedArtists.push(neigbors[nIndex]);
      fillNeighbors(neigbors, nIndex+1, relateds, rIndex+1);   
    }
    else
    {
      fillNeighbors(neigbors, nIndex, relateds, rIndex+1);
    }
}
// get the intro text of an artist from wiki and put it in hexagon inside the playlist data array
function getItroText(hex ,artist)
{
  var abc;

  $.get("http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryClass=artist&QueryString=artist&MaxHits=1", {}, function(data) {
    if($(data).find("Description").text().trim() == ""){
      $.get("http://lookup.dbpedia.org/api/search.asmx/KeywordSearch?QueryClass=band&QueryString=artist&MaxHits=1", {}, function(data) {  
        abc = $(data).find("Description").text().trim();    
      }, "xml");
    }else{
      abc = $(data).find("Description").text().trim();
    }
    if(abc.length > 25) {
      abc = abc.substring(0,250)+"...";
    }
    hex.setIntroText(abc);

  }, "xml");
}


function onYouTubePlayerAPIReady() {
  player = new YT.Player('video');
}

function searchClicked(data)
{     
    //create a JavaScript element that returns our JSON data.
    var script = document.createElement('script');
    script.setAttribute('id', 'jsonScript');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', 'http://gdata.youtube.com/feeds/' + 
           'videos?vq='+data+'&max-results=1&' + 
           'alt=json-in-script&callback=showMyVideos&' + 
           'orderby=viewCount&format=5&fmt=18');

    //attach script to current page -  this will submit asynchronous
    //search request, and when the results come back callback 
    //function showMyVideos(data) is called and the results passed to it
    document.documentElement.firstChild.appendChild(script);
}

function showMyVideos(data)
{
  var feed = data.feed;
  var entries = feed.entry || [];
  var entry = entries[0];
  var title = entry.title.$t;
	
  //parse the youtube id
  var link = entry.link[0].href.split("&feature");
  var res = link[0].split("?v=");
  $("#video").attr("src", "http://www.youtube.com/embed/"+ res[1] +"?rel=0&autoplay="+videoRuning);
  videoRuning = true;

}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function initHexagons()
{
  var inner = '<div class="inner_lab_item"><div class="hexagon hexagon2"><div class="hexagon-in1"><div class="hexagon-in2"></div></div></div></div></div>';

  hexagons    = new Array();
  row         = $(".row");
  backgroundColors    = new Array();
  backgroundColors[0] =  "bg1";
  backgroundColors[1] =  "bg2";
  backgroundColors[2] =  "bg3";
  backgroundColors[3] =  "bg4";
  backgroundColors[4] =  "bg5";
  backgroundColors[5] =  "bg6";
  backgroundColors[6] =  "bg7";
  backgroundColors[7] =  "bg8";

  var cnt = 0;
  var idCnt = 0;
  row.each(function() {
     var i = cnt;
     var gridHexagon = $(this).find(".lab_item");
     gridHexagon.each(function(index, val) {
      $(this).append(inner)
        var hex = new Hexagon();
        var innerHex = $(this).find(".hexagon-in2");
        var innerHex = $(this).find(".inner_lab_item .hexagon-in2");
        var id  = (i+1)*10 + index+1;
        var randomHover = getRandomInt(0,7);
        // set id for the domElement
        $(this).attr("id",id.toString());
        hex.setId(id);
        hex.setSelector("#"+id.toString());
        hex.setState(0);
        hex.setX(index+1);
        hex.setY(i+1);

        $(this).hover(function() {
          innerHex.addClass(backgroundColors[randomHover]);
          innerHex.show('fast');
        }, function() {
          innerHex.removeClass("bg");
          innerHex.removeClass(backgroundColors[randomHover]);
          innerHex.hide('fast');

        });
        hexagons.push(hex);
     });
     cnt++;
  });
}


/*
* This function gets returns array of all legal neighbors of an Hexagon
*/
function getHexNeighbors(id)
{
  var neighbors = new Array();
  var rowNumber = getNoOfElementsInRow(id);
  
  if(isLegalNeighbor(id-1))
    neighbors.push(getHexagonById(id-1));
  if(isLegalNeighbor(id+1))
    neighbors.push(getHexagonById(id+1));
  if(isLegalNeighbor(id-10))
    neighbors.push(getHexagonById(id-10));
  if(isLegalNeighbor(id+10))
    neighbors.push(getHexagonById(id+10));

	
	if(rowNumber == 8){
	  if(isLegalNeighbor(id-9))
		neighbors.push(getHexagonById(id-9));
	  if(isLegalNeighbor(id+11))
		neighbors.push(getHexagonById(id+11));
	}else{
	 if(isLegalNeighbor(id-11))
		neighbors.push(getHexagonById(id-11));
	  if(isLegalNeighbor(id+9))
		neighbors.push(getHexagonById(id+9));
	}

  return neighbors;  
}


function getHexagonById(id)
{
  var flag = false;
  var hex;
  $.each(hexagons, function() {
     if(this.getId() == id)
     {
        flag = true;
        hex = this;

     }
      
  });
  if(flag)
    return hex;
  return false;
}

function isLegalNeighbor(id){
  var hex = getHexagonById(id);
  if(hex!=false){
    if(hex.getState() != 1)
      return true;
  }
  return false;
}

/* this function gets hex id and return the no of elements in the row */
function getNoOfElementsInRow(id)
{
  var hex = getHexagonById(id);
  if(hex != false)
  {
    var hex = $("#"+id.toString());
    var parent = hex.parent();  
    return parent.find('.lab_item').size();
  }
}

function fillHexagon(id, background, text)
{
  //console.log(id, background);
  var textElement = '<span class="artist">'+text+'</span>';
  if(getHexagonById(id) != false)
  {
    //console.log( $("#"+id.toString()));
    hex = $("#"+id.toString());
    var text = hex.find('.artist');
     if(text.length)
      text.remove();
    hex.prepend(textElement);
    var inner = hex.find("> .hexagon2 .hexagon-in2");
    inner.css('background-image', background);
  }
}

//Ori
function removeBackground(id)
{
  console.log("Removed");
  if(getHexagonById(id) != false)
  {
    hex = $("#"+id.toString());
    var text = hex.find('.artist');
    if(text.length)
      text.remove();
    var inner = hex.find("> .hexagon2 .hexagon-in2");
    inner.css('background-image', 'none');
    
  }
}

//Ori
function clearGrid()
{
  $.each(hexagons, function(index, val) {
     if(this.getState() != 0 )
     {
        this.setState(0);
        removeBackground(this.getId());
     }
  });
  searchFlag = false;
}

function LoadTrack(hex)
{
  searchClicked(hex.getMusician());
  $(".artist-name").text(hex.getMusician());
  var genres = "";
  $.each(hex.getGenres(), function(index, val) {
      genres += "| "+this;   
  });
  $(".genre").text(hex.getYears() + genres);
  $(".intro-text").text(hex.getIntroText());
  $(".intro-text").append($(".wiki-link"));
  $(".wiki-link").attr("href", hex.getWikiLink()[0]);
}

function addToPlayList(hex) {
  var li = $("<li>");
  li.text(playListData.length + ". " + hex.getMusician());
  li.attr("class","track");
  li.attr("hexid",hex.getId());
  $("#playlist").append(li);
}

function updataPlayer(id) {
  LoadTrack(getHexagonById(id));
}

function clearPlaylist()
{
  playListData.empty();
  $(".artist-name").text("");
  $(".genre").text("");
  $(".intro-text").text("");
  $("ul").find('li').remove();
}