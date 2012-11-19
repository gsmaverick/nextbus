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