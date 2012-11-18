window.NB.IndexView = Backbone.View.extend({
    className: 'index',

    events: {
        'submit form': 'formSubmitEvt_',
        'click button': 'currentLocationEvt_'
    },

    initialize: function(){
        this.geoSuccessEvt_ = this.geoSuccessEvt_.bind(this);
        this.geoErrorEvt_ = this.geoErrorEvt_.bind(this);
    },

    render: function(){
        this.el.innerHTML = window.JST['Templates/indexview']();

        return this;
    },

    /**
     * Initiates a geolocation request to find the user's current position.
     */
    currentLocationEvt_: function(){
        this.el.classList.add('locating');

        navigator.geolocation.getCurrentPosition(
            this.geoSuccessEvt_, this.geoErrorEvt_
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

    /**
     * Handles a successful geolocation request.
     *
     * @param {Object} pos Position object that provides lat/long coordinates.
     */
    geoSuccessEvt_: function(pos){
        this.el.classList.remove('locating');

        var param = [pos.coords.latitude, pos.coords.longitude].join('|');

        app.getRouter().navigate('search/' + encodeURIComponent(param), {
            trigger: true
        });
    },

    /**
     * Handles a geolocation request error.
     *
     * @param {PositionError} err
     */
    geoErrorEvt_: function(err){
        this.el.classList.remove('locating');

        if (err.code == 1){
            alert('Permission denied: Could not acquire current location.');
        } else if (err.code == 2){
            var msg = 'Could not determine current location.  Ensure location' +
                ' services are enabled.';
            alert(msg);
        }

        mixpanel.track('geoError', {
            code: err.code,
            message: err.message
        });
    }
});