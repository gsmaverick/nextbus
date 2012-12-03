/**
 * SearchView shows a list of search results or a message indicating why there
 * are no search results.
 */
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
        // For easier unit testing.
        this.fetchError_ = _.bind(this.fetchError_, this);

        this.model.on('reset change', this.render, this);
    },

    render: function(){
        if (!this.model.loaded){
            this.el.innerHTML = window.JST['Templates/loader']();

            this.model.fetch({
                error: this.fetchError_
            });

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

    /**
     * Navigates the application to the right url after a search result has been
     * clicked.
     *
     * @param {Event}
     */
    clickResultEvt_: function(evt){
        var code = evt.currentTarget.getAttribute('data-stop-code');

        app.getRouter().navigate('stop/' + code, {
            trigger: true
        });

        mixpanel.track('searchResultSelected', {
            code: code
        });
    },

    /**
     * Handles a server error when fetching search results.
     *
     * @param {SearchModel} model
     * @param {XMLHttpRequest} xhr
     * @param {Object} options
     */
    fetchError_: function(model, xhr, options){
        if (xhr.readyState === 4){
            this.el.innerHTML = window.JST['Templates/servererror']();

            mixpanel.track('searchServerError', {
                query: decodeURIComponent(model.get('query'))
            });
        }
    }
});