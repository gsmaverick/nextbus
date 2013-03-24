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

        return [this.urlRoot, ext, this.get('query').toLowerCase()].join('/');
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