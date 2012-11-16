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
    },

    showPreviousPage_: function(evt){
        this.currentPage_--;

        this.updateFavourites();
    },

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
    }
});