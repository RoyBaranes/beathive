var Hexagon = function() {

};

/* Setters */
Hexagon.prototype.setBlock = function(block) {
    this.block = block;
};

Hexagon.prototype.setId = function(id) {
    this.id = id;
};

Hexagon.prototype.setX = function(x) {
    this.x = x;
};

Hexagon.prototype.setY = function(y) {
    this.y = y;
};

Hexagon.prototype.setImage = function(img) {
    if(img == 'undefined')
        throw "empty";
    this.image = img;
};
/*
* State: int
* 0 - empty
* 1 - Selected
* 2 - temporary
*/
Hexagon.prototype.setState = function(state) {
    this.state = state;
};

/*
* selector is the DOM Element that hold this hexagon
*/
Hexagon.prototype.setSelector = function(selector) {
    this.selector = selector;
};

/*
*	music artist or a band - string
*/
Hexagon.prototype.setMusician = function(musician) {
    if(musician == 'undefined')
        throw "empty";
    this.musician = musician;
};

/*
*	youtubeId - string
*/
Hexagon.prototype.setYoutubeId = function(youtubeId) {
    if(youtubeId == 'undefined')
        throw "empty";
    this.youtubeId = youtubeId;
};

/*
*	genres - string
*/
Hexagon.prototype.setGenres = function(genres) {
    if(genres == 'undefined')
        throw "empty";
    this.genres = genres;
};

/*
*	years - string 
* 	ie - "1990 - 1999"
*/
Hexagon.prototype.setYears = function(years) {

    this.years = years;
};

/*
*	introText - string
*/
Hexagon.prototype.setIntroText = function(introText) {
    this.introText = introText;
};

/*
*	wikiLink - string
*/
Hexagon.prototype.setWikiLink = function(wikiLink) {
    this.wikiLink = wikiLink;
};


// Getters
Hexagon.prototype.getState = function() {
    return this.state;
};

Hexagon.prototype.getId = function() {
    return this.id;
};

/*
* selector is the DOM Element that hold this hexagon
*/
Hexagon.prototype.getSelector = function() {
    return this.selector;
};


Hexagon.prototype.getMusician = function() {
    return this.musician;
};


Hexagon.prototype.getYoutubeId = function() {
    return this.youtubeId;
};

Hexagon.prototype.getGenres = function() {
    return this.genres;
};

Hexagon.prototype.getYears = function() {
    return this.years;
};

Hexagon.prototype.getBlock = function() {
    return this.block;
};

Hexagon.prototype.getIntroText = function() {
    return this.introText;
};

Hexagon.prototype.getWikiLink = function() {
    return this.wikiLink;
};

Hexagon.prototype.getX = function() {
    return this.x;
};

Hexagon.prototype.getY = function() {
    return this.y;
};

Hexagon.prototype.getImage = function() {
    return this.image;
};