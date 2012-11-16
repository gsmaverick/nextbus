/**
 * A RouteModel represents a bus route that has a list of arrival times.
 */
window.NB.RouteModel = Backbone.Model.extend({
    defaults: {
        /**
         * @type {String} The name of the route.
         */
        name: null,

        /**
         * @type {String} The number of the route.
         */
        number: null,

        /**
         * @type {Object[]} List of all the arrival times for this route.
         */
        times: null
    },

    parse: function(response){
        response.times = _.map(response.times, function(time){
            t = time.stop_time;

            var arrivalTime = new Date();
            arrivalTime.setHours(t.slice(0,2), t.slice(3,5), t.slice(6,8));

            time.arrival = arrivalTime.getTime();

            return time;
        });

        return response;
    },

    /**
     * Returns a UI-friendly string for the time from now until the requested
     * time.
     *
     * @param {Number} arrival Time of the arrival.
     *
     * @returns {String} A UI-friendly time to arrival.
     */
    timeUntilToString: function(arrival){
        // Calculate the difference in minutes.
        var diff = Math.round((arrival - Date.now()) / 60000);

        // Return nothing if the time has passed.
        if (diff < 0) return '';

        var hours = Math.floor(diff / 60);
        var mins = diff - (hours * 60);

        // Cap display of hours at 9.
        if (hours > 9) return '10h+';

        return [
            (hours != 0) ? hours + 'h' : '', (mins != 0) ? mins + 'm' : ''
        ].join('');
    },

    /**
     * @param {String} endpoint Destination for a route that should be stripped
     * of its -bound suffix in the direction word if it exists.
     *
     * @returns {String} Endpoint string without the frivolous -bound suffix.
     */
    stripEndpoint: function(endpoint){
        var re = /^([A-Za-z]+)bound[ ]/;

        if (endpoint.match(re)) endpoint = endpoint.replace('bound', '');
        return endpoint;
    }
});