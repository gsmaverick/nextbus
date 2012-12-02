/**
 * A RouteCardView displays the next bus times of a route at a stop.  It
 * auto-updates the time until arrival and remove any times that have passed.
 */
window.NB.RouteCardView = Backbone.View.extend({
    className: 'card',

    /**
     * @type {RouteModel} Bus route to be rendered in this card view.
     */
    model: null,

    /**
     * @type {Number} Timeout that recalculates the time until arrival for a bus
     * route.
     */
    updateTimeout_: null,

    initialize: function(options){
        if (options) this.index_ = options.index || 0;

        // Bind here for easier testing.
        this.updateTimes_ = _.bind(this.updateTimes_, this);
    },

    render: function(){
        var clsName = this.index_ === 0 ? 'current' : 'right';
        this.el.classList.add(clsName);

        if (!this.updateTimeout_ && this.model.get('times').length > 0){
            this.updateTimeout_ = window.setInterval(this.updateTimes_, 20000);
        }

        this.el.innerHTML = window.JST['Templates/routecardview'](this.model);

        return this;
    },

    remove: function(){
        if (this.updateTimeout_) window.clearInterval(this.updateTimeout_);

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    /**
     * Update each arrival time in the route card.
     */
    updateTimes_: function(){
        var model = this.model;

        this.$('.time').each(function(idx, el){
            var arrivalTime = el.getAttribute('data-arrival-time'),
                timeUntilArrival = model.timeUntilToString(arrivalTime);

            if (timeUntilArrival.length === 0){
                $(el).parent().remove();
                return;
            }

            $(el).html(timeUntilArrival);
        });
    }
});