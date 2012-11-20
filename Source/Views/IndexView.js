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