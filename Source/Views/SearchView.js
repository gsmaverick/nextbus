window.NB.SearchView = Backbone.View.extend({
    className: 'search',

    events: {
        'click .result': 'clickResultEvt_'
    },

    /**
     * @type {SearchModel}
     */
    model: null,

    initialize: function(){
        this.model.on('reset change', this.render, this);
    },

    render: function(){
        if (!this.model.loaded){
            this.el.innerHTML = window.JST['Templates/loader']();

            this.model.fetch();
            return this;
        }

        this.el.innerHTML = window.JST['Templates/searchview'](this.model);

        return this;
    },

    remove: function(){
        this.model.off('reset change', this.render, this);

        // Call super.
        Backbone.View.prototype.remove.apply(this, arguments);
    },

    clickResultEvt_: function(evt){
        var code = evt.currentTarget.getAttribute('data-stop-code');

        app.getRouter().navigate('stop/' + code, {
            trigger: true
        });
    }
});