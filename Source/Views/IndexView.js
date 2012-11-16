window.NB.IndexView = Backbone.View.extend({
    className: 'index',

    events: {
        'submit form': 'formSubmitEvt_',
        'click button': 'currentLocationEvt_'
    },

    render: function(){
        this.el.innerHTML = window.JST['Templates/indexview']();

        return this;
    },

    /**
     * Initiates a geolocation request to find the user's current position.
     */
    currentLocationEvt_: function(){
        navigator.geolocation.getCurrentPosition(
            this.geoSuccessEvt_.bind(this), this.geoErrorEvt_.bind(this)
        );
    },

    /**
     * Handles a form submission with a value that contains either a stop code
     * or stop name.
     *
     * @param {Event}
     */
    formSubmitEvt_: function(evt){
        evt.preventDefault();

        var inputVal = this.$('.user_input').val();

        // Match a 4 digit stop code directly.
        var url = (inputVal.match(/^[0-9]{4}$/)) ? 'stop' : 'search';

        app.getRouter().navigate(url + '/' + encodeURIComponent(inputVal), {
            trigger: true
        });

        return false;
    },

    geoSuccessEvt_: function(){},
    geoErrorEvt_: function(){}
});