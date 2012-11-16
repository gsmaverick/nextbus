window.NB.SearchModel = Backbone.Model.extend({
    idAttribute: 'query',

    urlRoot: '/api/search',

    defaults: {
        /**
         * @type {String} Search query that can be either a stop name lookup or
         * a geolocation search.
         */
        query: null
    },

    parse: function(response){
        this.loaded = true;

        return {
            results: response
        };
    }
});