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