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
        'swipeRight .title': 'swipeRightEvt_'
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