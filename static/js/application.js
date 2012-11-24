/**
 * This file contains the router code as well as initializaing the application
 * namespace.
 */

window.NB = window.NB || {};

window.NB.Router = Backbone.Router.extend({
    initialize: function(){
        //this.route('.*', 'notFound');
        this.route('', 'index');
        this.route('stop/:stopId', 'showStop');
        this.route('search/*splat', 'showSearch');
    },

    index: function(){
        var appView = window.app.getView();
        appView.showIndex();
    },

    showStop: function(stopId){
        var appView = window.app.getView();
        appView.showStopCard(stopId);
    },

    showSearch: function(splat){
        var appView = window.app.getView();
        appView.showSearchCard(splat);
    },

    notFound: function(){
        console.error('URL Not Found');
        return;
    }
});
window.NB.ApplicationModel = Backbone.Model.extend({
    defaults: {
        /**
         * @type {String}
         */
        activeCard: null,

        /**
         * @type {String}
         */
        stopId: null,

        /**
         * @type {Model}
         */
        activeModel: null
    }
});
/**
 * A RouteModel represents a bus route that has a list of arrival times.
 */

window.NB.RouteModel = Backbone.Model.extend({
    defaults: {
        /**
         * @type {String} The name of the route.
         */
        name: null,

        /**
         * @type {String} The number of the route.
         */
        number: null,

        /**
         * @type {Object[]} List of all the arrival times for this route.
         */
        times: null
    },

    parse: function(response){
        response.times = _.map(response.times, function(time){
            t = time.stop_time;

            var arrivalTime = new Date();
            arrivalTime.setHours(t.slice(0,2), t.slice(3,5), t.slice(6,8));

            time.arrival = arrivalTime.getTime();

            return time;
        });

        return response;
    },

    /**
     * Returns a UI-friendly string for the time from now until the requested
     * time.
     *
     * @param {Number} arrival Time of the arrival.
     *
     * @returns {String} A UI-friendly time to arrival.
     */
    timeUntilToString: function(arrival){
        // Calculate the difference in minutes.
        var diff = Math.round((arrival - Date.now()) / 60000);

        // Return nothing if the time has passed.
        if (diff < 0) return '';

        var hours = Math.floor(diff / 60);
        var mins = diff - (hours * 60);

        // Cap display of hours at 9.
        if (hours > 9) return '10h+';

        return [
            (hours != 0) ? hours + 'h' : '', (mins != 0) ? mins + 'm' : ''
        ].join('');
    },

    /**
     * @param {String} endpoint Destination for a route that should be stripped
     * of its -bound suffix in the direction word if it exists.
     *
     * @returns {String} Endpoint string without the frivolous -bound suffix.
     */
    stripEndpoint: function(endpoint){
        var re = /^([A-Za-z]+)bound[ ]/;

        if (endpoint.match(re)) endpoint = endpoint.replace('bound', '');
        return endpoint;
    }
});
window.NB.SearchModel = Backbone.Model.extend({
    urlRoot: '/api/search',

    defaults: {
        /**
         * @type {String} Search query that can be either a stop name lookup or
         * a geolocation search.
         */
        query: null
    },

    /**
     * @type {Boolean} Whether this model has been loaded with data from the
     * server yet.
     */
    loaded: false,

    url: function(){
        var query = decodeURIComponent(this.get('query')),
            ext = query.indexOf('|') !== -1 ? 'geo' : 'text';

        return [this.urlRoot, ext, this.get('query')].join('/');
    },

    parse: function(response){
        this.loaded = true;

        return {
            results: response.results
        };
    },

    queryString: function(){
        var query = decodeURIComponent(this.get('query'));

        return query.indexOf('|') !== -1 ? 'current location' : query;
    }
});
window.NB.StopModel = Backbone.Model.extend({
    defaults: {
        /**
         * @type {Number} Number used to uniquely identify this stop.
         */
        id: null,

        /**
         * @type {String} Four digit number used to find the stop in the system.
         */
        code: null,

        /**
         * @type {String} The name of this stop.
         */
        name: null,

        /**
         * @type {RouteModel[]} A list of all the routes that have arrivals at
         * this stop.
         */
        routes: null,
    },

    urlRoot: '/api/stops',

    /**
     * @type {Boolean} True if a response has been loaded from the server.
     */
    loaded: false,

    parse: function(resp){
        var response = {};

        // Parse out the stop details.
        response.id = resp.info.id;
        response.code = resp.info.stop_code;
        response.name = resp.info.stop_name;

        // Construct the list of routes for this stop.
        response.routes = [];
        resp.routes.forEach(function(route){
            var model = new window.NB.RouteModel(route, {
                parse: true
            });
            response.routes.push(model);
        });

        this.loaded = true;

        return response;
    },

    /**
     * Create a JSON representation of this model for the user favourites list.
     *
     * @returns {Object} JSON representation of the model.
     */
    jsonifyForFavourites: function(){
        var json = this.toJSON();

        json.routes = _.chain(this.get('routes'))
            .map(function(route){ return route.toJSON(); })
            .pluck('number')
            .value();

        return json;
    }
});
/**
 * This model is used to store the user's favourites and search history.
 */

window.NB.UserModel = Backbone.Model.extend({
    defaults: {
        /**
         * @type {String[]} List of up to 3 bus stop numbers that the user has
         * favourited.
         */
        favourites: null,

        /**
         * @type {Boolean} Whether or not the current user has swiped any route
         * card in the application yet.
         */
        hasSwiped: false,

        /**
         * @type {String} UUID for the user, one is generated if not provided.
         */
        userId: null
    },

    /**
     * @type {Window} Allow the window property to be overwritten for
     * unit-testing the localStorage back-end of the model.
     */
    window_: null,

    /**
     * Initializes a UserModel instance.
     *
     * @param {Object} options Initialization options including:
     *     - win:Window - The window object to retrieve localStorage from.
     */
    initialize: function(_, options){
        options = options || {};
        this.window_ = options.win || window;

        // Automatically write this model to localStorage whenever its
        // attributes are changed.
        this.on('change', function(){ this.save(); }, this);
    },

    /**
     * Override default sync to save the model to localStorage.
     */
    sync: function(method){
        var contents;

        if (method === 'update' || method === 'create'){
            contents = JSON.stringify(this.toJSON());
            this.window_.localStorage['CurrentUser'] = contents;
        } else if (method === 'read'){
            contents = this.window_.localStorage['CurrentUser'] || '{}';
            var obj = JSON.parse(contents);
            this.set(this.parse(obj));
        } else if (method === 'delete'){
            this.window_.localStorage.removeItem('CurrentUser');
        }
    },

    /**
     * Override the parse method to generate a UUID if one does not already
     * exist in local storage.  This UUID will only be saved to the localStorage
     * if one of the other attributes is changed.
     *
     * @param {Object} response
     */
    parse: function(response){
        if (!response.userId){
            response.userId = window.NB.Utilities.UUID();
        }

        if (!response.favourites){
            response.favourites = [];
        }

        return response;
    },

    /**
     * Wrapper function to toggle the user's favourited state of a stop.
     *
     * @param {String} code - Unique identifier for this bus to add/remove to
     *     the user's favourites list.
     *
     * @returns {Boolean}
     */
    toggleFavourite: function(stop_id){
        var favourites = _.clone(this.get('favourites')),
            favIds = _.pluck(favourites, 'id'),
            index = favIds.indexOf(stop_id);

        if (index !== -1){
            favourites.splice(index, 1);

            mixpanel.track('unfavourited', {
                stop: stop_id
            });
        } else {
            // Get the currently active stop model from the application model.
            var model = window.app.getModel(),
                stop = model.get('activeModel');

            // Guard against this toggle being called when a stop model isn't
            // active.
            if (stop.jsonifyForFavourites && stop.loaded){
                favourites.push(stop.jsonifyForFavourites());

                mixpanel.track('favourited', {
                    stop: stop_id
                });
            } else {
                return false;
            }
        }

        return this.set('favourites', favourites);
    },

    /**
     * Check if a stop is favourited by the user.
     *
     * @param {String} code - Unique stop id for the stop.
     *
     * @returns {Booelan} Whether the given stop is favourited by the user.
     */
    isFavourite: function(stop_id){
        var favourites = _.pluck(this.get('favourites'), 'id');

        return favourites.indexOf(stop_id) !== -1;
    }
});
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/cardview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="all-cards"></div>\n\n<div class="fakeCard">\n    <div class="title">\n        <h2>&nbsp;</h2>\n        <div class="clear clearfix"></div>\n    </div>\n\n    <ul class="arrivals">\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n        <li>\n            <span class="time">&nbsp;</span>\n            <span class="name">&nbsp;</span>\n            <div class="clear"></div>\n        </li>\n    </ul>\n</div>\n\n<ul class="dots">\n    <li class="active"></li>',  new Array(numSlides_).join('<li></li>') ,'\n</ul>\n\n');  if (showSwipeHint_){ ; __p.push('\n<div class="swipe-hint">\n    <img src="/static/img/swipe-left.png"/>\n    <span>Swipe</span>\n</div>\n');  } ; __p.push('\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/emptyfavouritesview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<li class="empty">\n    <div class="left">\n        <h3>No favourited stops.</h3>\n        <h4>Click on the star when you\'re viewing a stop to favourite it.</h4>\n    </div>\n    <div class="bubble">\n        <div class="inner"></div>\n        <img src="/static/img/favourites-hint.png" />\n    </div>\n</li>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/favouriteslistitemview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<li data-stop-code="',  id ,'">\n    <h3>#',  code ,' - ',  name ,'</h3>\n\n    <div class="numbers">\n        ');  _.each(routes, function(route){ ; __p.push('\n            <span class="number route-',  window.NB.Utilities.padRouteNumber(route) ,'">\n                ',  window.NB.Utilities.padRouteNumber(route) ,'\n            </span>\n        ');  }); ; __p.push('\n\n        <div style="clear: both"></div>\n    </div>\n\n    <img src="/static/img/next.png" class="arrow"/>\n</li>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/favouriteslistview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h2 class="favourites-title">\n    Favourites\n\n    <div class="actions">\n        <div class="prev disabled">\n            <img src="/static/img/next.png" />\n        </div>\n        <div class="next ',  pages <= 1 ? 'disabled' : '' ,'">\n            <img src="/static/img/next.png" />\n        </div>\n\n        <div style="clear: both"></div>\n    </div>\n</h2>\n\n<ul class="favourites-list"></ul>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/headerview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="favourites"></div>\n\n<div class="persistent">\n    <div class="back btn">\n        <img src="/static/img/left.png"/>\n    </div>\n\n    <h1>nextbus</h1>\n\n    <div class="expand btn">\n        <img src="/static/img/expand.png"/>\n    </div>\n\n    <div class="favourite btn">\n        <img src="/static/img/unstarred.png"/>\n    </div>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/indexview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h1>find the next bus</h1>\n\n<form>\n    <div class="input-holder">\n        <input type="text" placeholder="Stop number or name" class="user_input"/>\n    </div>\n</form>\n\n<div class="divider">\n    <div class="or">\n        <div class="left"></div>\n        <span>OR</span>\n        <div class="right"></div>\n    </div>\n</div>\n\n<div class="find-location">\n    <button>\n        <img src="/static/img/gps.png"/>\n        Use Current Location\n    </button>\n</div>\n\n<div class="footer">\n    <span class="copyright">&copy;&nbsp;2012&nbsp;Gavin Schulz</span>\n\n    <a href="/about" class="link" target="_blank">About</a>\n    <a href="/help" class="link" target="_blank">Help</a>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/loader"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="loader">\n    <span></span>\n    <span></span>\n    <span></span>\n    <span></span>\n    <span></span>\n</div>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/routecardview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<div class="title">\n    <span class="number route-',  window.NB.Utilities.padRouteNumber(get('number')) ,'">',  window.NB.Utilities.padRouteNumber(get('number')) ,'</span>\n\n    <h2>',  get('name') ,'</h2>\n    <div class="clear clearfix"></div>\n</div>\n\n<ul class="arrivals">\n    ');  _.each(get('times'), function(time){ ; __p.push('\n        <li>\n            <span class="time" data-arrival-time="',  time.arrival ,'">\n                ',  timeUntilToString(time.arrival) ,'\n            </span>\n            <span class="name">\n                ',  stripEndpoint(time.endpoint) ,'\n            </span>\n\n            <div class="clear"></div>\n        </li>\n    ');  }); ; __p.push('\n\n    ');  if (get('times').length == 0){ ; __p.push('\n        <li>\n            <span class="time"></span>\n            <span class="name empty">\n                No arrivals in the next day.\n            </span>\n\n            <div class="clear"></div>\n        </li>\n    ');  } ; __p.push('\n</ul>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/searchview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('');  _.each(get('results'), function(result){ ; __p.push('\n    <div class="result" data-stop-code="',  result['id'] ,'">\n        <div class="fake box"></div>\n\n        <div class="box">\n            <span class="name">\n                #',  result['stop_code'] ,' - ',  result['stop_name'] ,'\n            </span>\n\n            <div class="numbers">\n                ');  _.each(result['routes'], function(route){ ; __p.push('\n                    <span class="number route-',  window.NB.Utilities.padRouteNumber(route) ,'">\n                        ',  window.NB.Utilities.padRouteNumber(route) ,'\n                    </span>\n                ');  }); ; __p.push('\n\n                <div style="clear: both"></div>\n            </div>\n\n            <img src="/static/img/next.png" class="img-next"/>\n        </div>\n    </div>\n');  }); ; __p.push('\n\n');  if (!get('results') || get('results').length == 0) { ; __p.push('\n    <h3 class="no-results">\n        No results found for <span class="query">',  queryString() ,'.</span>\n    </h3>\n');  } else { ; __p.push('\n    <div class="end-mark"></div>\n');  } ; __p.push('\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/servererror"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h3 class="error">A server error has occurred and we\'re looking into it.</h3>\n');}return __p.join('');};
}).call(this);
(function() {
  this.JST || (this.JST = {});
  this.JST["Templates/stopview"] = function(obj){var __p=[],print=function(){__p.push.apply(__p,arguments);};with(obj||{}){__p.push('<h2 class="stop-title">#',  get('code') ,': ',  get('name') ,'</h2>\n\n<div class="card"></div>\n');}return __p.join('');};
}).call(this);
window.NB.Utilities = {
    /**
     * Generate a random v4 UUID of the form:
     *   xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     * Used with permission from Alexey Silin <pinkoblomingo@gmail.com>.
     */
    UUID: function(a,b){
        for (b = a = ''; a++ < 36; b += a * 51 & 52 ?
            (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) :
            '-');
        return b
    },

    padRouteNumber: function(num){
        var routeNum = '0' + num;

        return routeNum.slice(-2);
    }
}
;
/**
 * ApplicationView is the main container for all the views that make up the
 * application.  It handles creating, rendering and removing application views
 * and cleans up after each view.
 */

window.NB.ApplicationView = Backbone.View.extend({
    /**
     * @type {Element} Attach this view to the application element already in
     * the DOM.
     */
    el: '.application',

    /**
     * @type {ApplicationModel}
     */
    model: null,

    /**
     * @type {HeaderView}
     */
    headerView_: null,

    /**
     * @type {View}
     */
    contentView_: null,

    render: function(){
        this.headerView_ = new window.NB.HeaderView({
            model: this.model
        });

        this.$el.append(this.headerView_.render().el);
    },

    showIndex: function(){
        var view = new window.NB.IndexView();

        this.setContent_(view, {
            activeCard: 'index',
            activeModel: null,
            stopId: null
        });
    },

    /**
     * @param {String} stopId Four digit stop code that should be displayed.
     */
    showStopCard: function(stopId){
        var stopModel = new window.NB.StopModel({
            id: stopId
        });

        var view = new window.NB.StopView({
            model: stopModel
        });

        this.setContent_(view, {
            activeCard: 'stop',
            activeModel: stopModel,
            stopId: stopId
        });
    },

    /**
     * @param {String} searchTerm Query string to search for.
     */
    showSearchCard: function(searchTerm){
        var searchModel = new window.NB.SearchModel({
            query: searchTerm
        });

        var view = new window.NB.SearchView({
            model: searchModel
        });

        this.setContent_(view, {
            activeCard: 'search',
            activeModel: searchModel,
            stopId: null
        });
    },

    /**
     * Updates the main content area with the new supplied view and cleans up
     * the previous content view.
     *
     * @param {View} view New content view for the application.
     * @param {Object} attrs New attributes for the application model.
     */
    setContent_: function(view, attrs){
        attrs = attrs || {};

        if (this.contentView_) this.contentView_.remove();

        this.contentView_ = view;
        this.$('.application-content').append(this.contentView_.render().el);

        this.model.set(attrs);
    }
});
/**
 * CardView displays all the routes and times for a stop code.  It constructs a
 * series of subviews that can be navigated by swiping left/right on the card.
 */

window.NB.CardView = Backbone.View.extend({
    className: 'cardHolder',

    events: {
        'swipeLeft .timez':  'swipeLeftEvt_',
        'swipeRight .timez': 'swipeRightEvt_',

        'swipeLeft .title':  'swipeLeftEvt_',
        'swipeRight .title': 'swipeRightEvt_',

        'swipeLeft .swipe-hint': 'swipeLeftEvt_'
    },

    /**
     * @type {StopModel} The stop model that should be displayed.
     */
    model: null,

    /**
     * @type {Number} Index of the currently active card.
     */
    activeSlide_: 1,

    /**
     * @type {Number} Number of cards that are on this view.
     */
    numSlides_: null,

    /**
     * @type {RouteCardView[]} All the route cards that are subviews of this
     * card holder.
     */
    routeCardViews_: null,

    /**
     * @type {Boolean} Whether or not the swipe user hint should be shown.
     */
    showSwipeHint_: false,

    /**
     * @type {UserModel} Model that represents the preferences of the currently
     * active user.
     */
    currentUser_: null,

    initialize: function(){
        this.routeCardViews_ = [];

        this.currentUser_ = window.app.getUser();

        var routes = this.model.get('routes');
        this.numSlides_ = routes.length;
    },

    render: function(){
        this.checkFirstTimeUse_();

        this.el.innerHTML = window.JST['Templates/cardview'](this);

        // Construct a RouteCard for each route at this stop.
        var routes = this.model.get('routes');
        _.each(routes, function(route, idx){
            var view = new window.NB.RouteCardView({
                model: route,
                index: idx
            });

            this.routeCardViews_.push(view);
            this.$('.all-cards').append(view.render().el);
        }, this);

        return this;
    },

    remove: function(){
        _.each(this.routeCardViews_, function(view){
            view.remove();
        });

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Updates the class names on the cards that are being sliden left/right via
     * a swipe action.
     *
     * @param {Object} klasses Names of the classes to add and remove with the
     *   following properties:
     *      - current:String Name of class to add to the currently active slide.
     *      - next:String Name of class to remove from the slide that is going
     *        to be made active.
     */
    updateSlideClasses_: function(klasses){
        var current = this.$('.card.current'),
            next = this.$('.card:nth-child(' + this.activeSlide_ + ')');

        current.addClass(klasses.current);
        current.removeClass('current');
        next.addClass('current');
        next.removeClass(klasses.next);

        this.updateDots_();

        if (!this.currentUser_.get('hasSwiped')){
            this.currentUser_.set('hasSwiped', true);
            this.$('.swipe-hint').hide();
        }

        mixpanel.track('swipe');
    },

    /**
     * Handles a left swipe on the card surface.
     *
     * @param {Event}
     */
    swipeLeftEvt_: function(evt){
        if (this.activeSlide_ === this.numSlides_) return;

        this.activeSlide_++;

        this.updateSlideClasses_({
            current: 'left',
            next: 'right'
        });
    },

    /**
     * Handles a right swipe on the card surface.
     *
     * @param {Event}
     */
    swipeRightEvt_: function(evt){
        if (this.activeSlide_ === 1) return;

        this.activeSlide_--;

        this.updateSlideClasses_({
            current: 'right',
            next: 'left'
        });
    },

    /**
     * Updates the dot pattern at the bottom of the card which provides a page
     * indicator for all the cards at this stop.
     */
    updateDots_: function(){
        var sel = 'nth-child(' + this.activeSlide_ + ')';

        $('.dots .active').removeClass('active');
        $('.dots li:' + sel).addClass('active');
    },

    /**
     * Determine if the user is viewing a card view for the first time and if so
     * then the swipe to navigate between cards hint should be displayed.
     */
    checkFirstTimeUse_: function(){
        if (!this.currentUser_.get('hasSwiped') && this.numSlides_ > 1){
            this.showSwipeHint_ = true;
        }
    }
});
/**
 * FavouriteStarView is attached to a favourite star button in the header of the
 * application and controls the interaction of (un)favouriting a stop id.
 */

window.NB.FavouriteStarView = Backbone.View.extend({
    /**
     * @type {UserModel}
     */
    model: null,

    /**
     * @type {ApplicationModel}
     */
    appModel_: null,

    events: {
        'click': 'toggleFavouriteEvt_'
    },

    initialize: function(){
        this.appModel_ = window.app.getModel();

        this.appModel_.on('change:stopId', this.updateStar_, this);
        this.model.on('change:favourites', this.updateStar_, this);
    },

    remove: function(){
        this.appModel_.off('change:stopId', this.updateStar_, this);
        this.model.off('change:favourites', this.updateStar_, this);

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Toggle whether or not the current stop is favourited.
     */
    toggleFavouriteEvt_: function(){
        var stopId = this.appModel_.get('stopId');

        var status = this.model.toggleFavourite(stopId);
        if (!status) alert('Could not favourite stop please try again.');
    },

    /**
     * Updates the status of the favourite star in response to a change in stop.
     */
    updateStar_: function(){
        val = this.appModel_.get('stopId');

        var img = this.el.querySelector('img');

        src = (this.model.isFavourite(val)) ? 'starred' : 'unstarred';
        img.setAttribute('src', '/static/img/' + src + '.png');
    }
});
/**
 * FavouritesListView display a 2 at-a-time list of the user's favourites.  It
 * support navigation button between different pages of the favourites list.
 */

window.NB.FavouritesListView = Backbone.View.extend({
    /**
     * @type {UserModel}
     */
    model: null,

    events: {
        'click li':    'navigateToStop_',
        'click .prev': 'showPreviousPage_',
        'click .next': 'showNextPage_'
    },

    /**
     * @type {Number} Which page of favourites is currently being shown.
     */
    currentPage_: 0,

    /**
     * @type {Number} Number of favourites to show per page.
     */
    pageSize_: 2,

    /**
     * @type {Number} Total number of favourites pages.
     */
    numPages_: 0,

    initialize: function(){
        this.model.on('change reset', this.render, this);
    },

    render: function(){
        var numFavourites = (this.model.get('favourites') || []).length;

        this.numPages_ = Math.ceil(numFavourites / this.pageSize_);
        this.currentPage_ = 0;

        this.el.innerHTML = window.JST['Templates/favouriteslistview']({
            pages: this.numPages_
        });
        this.renderFavouritesPage_();

        return this;
    },

    remove: function(){
        this.model.off('change reset', this.render, this);

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Renders the favourites into the list for this page.
     */
    renderFavouritesPage_: function(){
        var items = this.favouritesForPage_(this.currentPage_),
            container = this.$('.favourites-list').empty();

        if (items.length === 0 && this.currentPage_ === 0){
            var child = window.JST['Templates/emptyfavouritesview']();
            container.append(child);

            return;
        }

        _.each(items, function(item){
            var child = window.JST['Templates/favouriteslistitemview'](item);
            container.append(child);
        });
    },

    /**
     * Returns the list of stops for a specific page of favourites.
     *
     * @param {Number} page Zero-based page number to return.
     *
     * @returns {Object[]} List of favourited stops.
     */
    favouritesForPage_: function(page){
        var favourites = this.model.get('favourites'),
            idx = page * this.pageSize_;

        return !favourites ? [] : favourites.slice(idx, idx + this.pageSize_);
    },

    /**
     * Navigates the app router to the requested stop.
     *
     * @param {Event}
     */
    navigateToStop_: function(evt){
        var code = evt.currentTarget.getAttribute('data-stop-code');

        this.trigger('stopSelected');

        app.getRouter().navigate('stop/' + code, {
            trigger: true
        });

        mixpanel.track('clickFavourite', {
            code: code
        });
    },

    /**
     * Show the previous page of favourites.
     *
     * @param {Event}
     */
    showPreviousPage_: function(evt){
        this.currentPage_--;

        this.updateFavourites();
    },

    /**
     * Show the next page of favourites.
     *
     * @param {Event}
     */
    showNextPage_: function(evt){
        this.currentPage_++;

        this.updateFavourites();
    },

    /**
     * Updates the status of the navigation buttons and then renders the new
     * page of favourites.
     */
    updateFavourites: function(){
        this.$('.prev').toggleClass('disabled', this.currentPage_ === 0);
        this.$('.next').toggleClass('disabled',
            this.currentPage_ === (this.numPages_ - 1));

        this.renderFavouritesPage_();

        mixpanel.track('navigateFavourites');
    }
});
/**
 * HeaderView is the top header bar that persists across the entire application
 * as well as the favourites lists.
 */

window.NB.HeaderView = Backbone.View.extend({
    tagName: 'header',

    /**
     * @type {ApplicationModel}
     */
    model: null,

    /**
     * @type {FavouriteStarView} View responsible for controlling interactions
     * with the favourite star button in the header.
     */
    favouriteStarView_: null,

    /**
     * @type {FavouritesListView} View responsible for rendering the user's list
     * of favourite stops in the hidden part of the header.
     */
    favouritesListView_: null,

    events: {
        'click .expand': 'expandHeaderEvt_',
        'click .back':   'backButtonEvt_'
    },

    initialize: function(){
        this.model.on('change:activeCard', this.activeCardChange_, this);
    },

    render: function(){
        this.el.innerHTML = window.JST['Templates/headerview']();

        var userModel = window.app.getUser();

        // Create a favourite star view that keeps track of the favourite status
        // of a stop id.
        this.favouriteStarView_ && this.favouriteStarView_.remove();
        this.favouriteStarView_ = new window.NB.FavouriteStarView({
            el: this.$('.favourite'),
            model: userModel
        });

        // Create a list of the user's favourites that they can navigate.
        this.favouritesListView_ && this.favouritesListView_.remove()
        this.favouritesListView_ = new window.NB.FavouritesListView({
            model: userModel
        });
        this.favouritesListView_.on(
            'stopSelected', this.expandHeaderEvt_, this);

        this.$('.favourites').html(this.favouritesListView_.render().el);

        return this;
    },

    remove: function(){
        this.model.off('change:activeCard', this.activeCardChange_, this);

        this.favouriteStarView_ && this.favouriteStarView_.remove();

        if (this.favouritesListView_){
            this.favouritesListView_.off(
                'stopSelected', this.expandHeaderEvt_, this);
            this.favouritesListView_ && this.favouritesListView_.remove();
        }

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Configures the state of the buttons in the header.
     */
    activeCardChange_: function(){
        var op;

        // First decide whether to show a favourite button or an expand button.
        op = (this.model.get('activeCard') === 'stop') ? 'add' : 'remove';
        this.el.classList[op]('has-favourite-button');

        // First decide whether to show a favourite button or an expand button.
        op = (this.model.get('activeCard') === 'index') ? 'remove' : 'add';
        this.el.classList[op]('has-back-button');
    },

    /**
     * Toggles the state of the settings menu in the header.
     */
    expandHeaderEvt_: function(){
        this.el.classList.toggle('open');

        mixpanel.track('openHeader');
    },

    /**
     * Go back in the history stack.  This works because when the application is
     * initialized we clear out any hash fragment in the url and start from a
     * fresh index state.
     */
    backButtonEvt_: function(){
        window.history.back();
    }
});
/**
 * IndexView is the main index page of the application.  It lets the user enter
 * a stop code/name in a form or find stop nearby via geolocation.  It also
 * displays the footer contents.
 */

window.NB.IndexView = Backbone.View.extend({
    className: 'index',

    events: {
        'submit form': 'formSubmitEvt_',
        'click button': 'currentLocationEvt_'
    },

    /**
     * @type {Boolean} Whether or not a geolocation request is currently in
     * progress.
     */
    gpsInProgress_: false,

    initialize: function(){
        this.geoSuccessEvt_ = this.geoSuccessEvt_.bind(this);
        this.geoErrorEvt_ = this.geoErrorEvt_.bind(this);
    },

    render: function(){
        this.el.innerHTML = window.JST['Templates/indexview']();

        return this;
    },

    /**
     * Initiates a geolocation request to find the user's current position.
     */
    currentLocationEvt_: function(){
        // Don't start another geolocation request if one is in progress.
        if (this.gpsInProgress_){
            alert('Geolocation request in progress.');
            return;
        }

        this.el.classList.add('locating');

        navigator.geolocation.getCurrentPosition(
            this.geoSuccessEvt_, this.geoErrorEvt_, {maximumAge: 300000}
        );

        this.gpsInProgress_ = true;
    },

    /**
     * Handles a form submission with a value that contains either a stop code
     * or stop name.
     *
     * @param {Event}
     */
    formSubmitEvt_: function(evt){
        evt.preventDefault();

        var inputVal = encodeURIComponent(this.$('.user_input').val());

        app.getRouter().navigate('search/' + inputVal, { trigger: true });

        mixpanel.track('formSubmit', {
            query: inputVal
        });

        return false;
    },

    /**
     * Handles a successful geolocation request.
     *
     * @param {Object} pos Position object that provides lat/long coordinates.
     */
    geoSuccessEvt_: function(pos){
        this.el.classList.remove('locating');
        this.gpsInProgress_ = false;

        var param = [pos.coords.latitude, pos.coords.longitude].join('|');

        app.getRouter().navigate('search/' + encodeURIComponent(param), {
            trigger: true
        });

        mixpanel.track('geoSuccess');
    },

    /**
     * Handles a geolocation request error.
     *
     * @param {PositionError} err
     */
    geoErrorEvt_: function(err){
        this.el.classList.remove('locating');
        this.gpsInProgress_ = false;

        if (err.code == 1){
            alert('Permission denied: Could not acquire current location.');
        } else if (err.code == 2){
            var msg = 'Could not determine current location.  Ensure location' +
                ' services are enabled.';
            alert(msg);
        }

        mixpanel.track('geoError', {
            code: err.code,
            message: err.message
        });
    }
});
/**
 * A RouteCardView displays the next bus times of a route at a stop.  It
 * auto-updates the time until arrival.
 */

window.NB.RouteCardView = Backbone.View.extend({
    className: 'card',

    /**
     * @type {RouteModel} Bus route to be rendered in this card view.
     */
    model: null,

    /**
     * @type {Number} Timeout that recalculates the time until arrival for a bus
     * route.
     */
    updateTimeout_: null,

    initialize: function(options){
        if (options) this.index_ = options.index || 0;

        // Bind here for easier testing.
        this.updateTimes_ = _.bind(this.updateTimes_, this);
    },

    render: function(){
        var clsName = this.index_ === 0 ? 'current' : 'right';
        this.el.classList.add(clsName);

        if (!this.updateTimeout_ && this.model.get('times').length > 0){
            this.updateTimeout_ = window.setInterval(this.updateTimes_, 20000);
        }

        this.el.innerHTML = window.JST['Templates/routecardview'](this.model);

        return this;
    },

    remove: function(){
        if (this.updateTimeout_) window.clearInterval(this.updateTimeout_);

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Update each arrival time in the route card.
     */
    updateTimes_: function(){
        var model = this.model;

        this.$('.time').each(function(idx, el){
            var arrivalTime = el.getAttribute('data-arrival-time'),
                timeUntilArrival = model.timeUntilToString(arrivalTime);

            if (timeUntilArrival.length === 0){
                $(el).remove();
                return;
            }

            $(el).html(timeUntilArrival);
        });
    }
});
/**
 * SearchView shows a list of search results or a message indicating why there
 * are no search results.
 */

window.NB.SearchView = Backbone.View.extend({
    className: 'search',

    events: {
        'click .result': 'clickResultEvt_'
    },

    /**
     * @type {SearchModel}
     */
    model: null,

    initialize: function(){
        // For easier unit testing.
        this.fetchError_ = this.fetchError_.bind(this);

        this.model.on('reset change', this.render, this);
    },

    render: function(){
        if (!this.model.loaded){
            this.el.innerHTML = window.JST['Templates/loader']();

            this.model.fetch({
                error: this.fetchError_
            });

            return this;
        }

        this.el.innerHTML = window.JST['Templates/searchview'](this.model);

        return this;
    },

    remove: function(){
        this.model.off('reset change', this.render, this);

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Navigates the application to the right url after a search result has been
     * clicked.
     *
     * @param {Event}
     */
    clickResultEvt_: function(evt){
        var code = evt.currentTarget.getAttribute('data-stop-code');

        app.getRouter().navigate('stop/' + code, {
            trigger: true
        });

        mixpanel.track('searchResultSelected', {
            code: code
        });
    },

    /**
     * Handles a server error when fetching search results.
     *
     * @param {SearchModel} model
     * @param {XMLHttpRequest} xhr
     * @param {Object} options
     */
    fetchError_: function(model, xhr, options){
        if (xhr.readyState === 4){
            this.el.innerHTML = window.JST['Templates/servererror']();

            mixpanel.track('searchServerError', {
                query: decodeURIComponent(model.get('query'))
            });
        }
    }
});
/**
 * StopView shows a specific stop's routes and stop times by creating a list of
 * Card subviews to show each individual route.
 */

window.NB.StopView = Backbone.View.extend({
    className: 'stop',

    /**
     * @type {StopModel} The stop model that should be displayed.
     */
    model: null,

    /**
     * @type {CardView} Card view used to show bus times in a carousel format.
     */
    cardView_: null,

    initialize: function(){
        this.model.on('change reset', this.render, this);
    },

    render: function(){
        if (!this.model.loaded){
            this.el.innerHTML = window.JST['Templates/loader']();

            this.model.fetch();
            return this;
        }

        if (this.cardView_) this.cardView_.remove();

        this.el.innerHTML = window.JST['Templates/stopview'](this.model);

        this.cardView_ = new window.NB.CardView({
            model: this.model
        });
        this.$('.card').append(this.cardView_.render().el);

        return this;
    },

    remove: function(){
        this.model.off('change reset', this.render, this);

        if (this.cardView_) this.cardView_.remove();

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    }
});




/**
 * The basic application object used to initialize the application.  Creates a
 * new instance of the application which can be started by calling `start()`.
 */

var Application = function(){
    this.model_ = new window.NB.ApplicationModel();

    this.user_ = new window.NB.UserModel();

    this.view_ = new window.NB.ApplicationView({
        model: this.model_
    });

    this.router_ = new window.NB.Router();
};

_.extend(Application.prototype, Backbone.Events, {
    start: function(){
        this.primeDocument_();

        // Populate the UserModel if it has previously been created otherwise
        // save the model to localstorage to create it.
        //this.user_.fetch();
        //this.user_.save();

        this.view_.render();

        //try {
            // Clear out the hash so that the back button strategy works.
            //window.location.hash = '';

            Backbone.history.start();
        //} catch (e) {
            //console.error(e);
        //}

        //mixpanel.register({'uuid': this.user_.get('userId')});
        //mixpanel.track('AppLoad');
    },

    /**
     * Removing application loading styles and classes.  Try to hide address
     * bar by absolutely setting the height of the body.
     */
    primeDocument_: function(){
        window.scrollTo(0, 1);

        var body = document.querySelector('body'),
            loadScreen = document.querySelector('.load-screen');

        body.style.height = body.offsetHeight + 'px';
        body.classList.remove('loading');
        body.removeChild(loadScreen);

        window.scrollTo(0, 1);
    },

    /**
     * @returns {ApplicationModel}
     */
    getModel: function(){
        return this.model_;
    },

    /**
     * @returns {Router}
     */
    getRouter: function(){
        return this.router_;
    },

    /**
     * @return {UserModel}
     */
    getUser: function(){
        return this.user_;
    },

    /**
     * @returns {ApplicationView}
     */
    getView: function(){
        return this.view_;
    }
});
