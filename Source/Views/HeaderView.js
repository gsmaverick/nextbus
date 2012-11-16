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