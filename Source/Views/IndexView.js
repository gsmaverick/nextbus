/**
 * IndexView is the main index page of the application.  It lets the user enter
 * a stop code/name in a form or find stop nearby via geolocation.  It also
 * displays the footer contents.
 */
window.NB.IndexView = Backbone.View.extend({
    className: 'index',

    events: {
        'submit form': 'formSubmitEvt_',
        'click button': 'currentLocationEvt_'
    },

    /**
     * @type {Boolean} Whether or not a geolocation request is currently in
     * progress.
     */
    gpsInProgress_: false,

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
        // Don't start another geolocation request if one is in progress.
        if (this.gpsInProgress_){
            alert('Geolocation request in progress.');
            return;
        }

        this.el.classList.add('locating');

        navigator.geolocation.getCurrentPosition(
            this.geoSuccessEvt_, this.geoErrorEvt_, {maximumAge: 300000}
        );

        this.gpsInProgress_ = true;
    },

    /**
     * Handles a form submission with a value that contains either a stop code
     * or stop name.
     *
     * @param {Event}
     */
    formSubmitEvt_: function(evt){
        evt.preventDefault();

        var inputVal = encodeURIComponent(this.$('.user_input').val());

        app.getRouter().navigate('search/' + inputVal, { trigger: true });

        mixpanel.track('formSubmit', {
            query: inputVal
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
        this.gpsInProgress_ = false;

        var param = [pos.coords.latitude, pos.coords.longitude].join('|');

        app.getRouter().navigate('search/' + encodeURIComponent(param), {
            trigger: true
        });

        mixpanel.track('geoSuccess');
    },

    /**
     * Handles a geolocation request error.
     *
     * @param {PositionError} err
     */
    geoErrorEvt_: function(err){
        this.el.classList.remove('locating');
        this.gpsInProgress_ = false;

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