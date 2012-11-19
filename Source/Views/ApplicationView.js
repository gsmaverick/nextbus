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