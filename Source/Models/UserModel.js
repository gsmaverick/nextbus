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