/**
 * IndexView is the main index page of the application.  It lets the user enter
 * a stop code/name in a form or find stop nearby via geolocation.  It also
 * displays the footer contents which link to the About and Help pages.
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
        // Bind early to make testing easier.
        this.geoSuccessEvt_ = _.bind(this.geoSuccessEvt_, this);
        this.geoErrorEvt_ = _.bind(this.geoErrorEvt_, this);
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

        var geolocationOptions = {
            maximumAge: 300000,
            timeout: 5000,
            enableHighAccuracy: true
        };

        navigator.geolocation.getCurrentPosition(
            this.geoSuccessEvt_, this.geoErrorEvt_, geolocationOptions
        );

        this.gpsInProgress_ = true;
    },

    /**
     * Handles a form submission with a value that contains either a stop code
     * or stop name.
     *
     * @param {Event}
     * @returns {Boolean}
     */
    formSubmitEvt_: function(evt){
        evt.preventDefault();

        var inputVal = encodeURIComponent(this.$('form input').val());

        app.getRouter().navigate('search/' + inputVal, {trigger: true});

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

        var messages = [
            'Could not determine current location due to an error.',
            'Permission denied: Could not acquire current location.',
            'Could not determine current location.  Ensure location services ' +
                'are enabled.',
            'Could not determine current location because the GPS didn\'t ' +
                'respond in time.'
        ];
        alert(messages[err.code]);

        mixpanel.track('geoError', {
            code: err.code,
            message: err.message
        });
    }
});