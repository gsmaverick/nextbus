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