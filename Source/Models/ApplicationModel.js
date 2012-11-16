window.NB.ApplicationModel = Backbone.Model.extend({
    defaults: {
        /**
         * @type {String}
         */
        activeCard: null,

        /**
         * @type {String}
         */
        stopId: null,

        /**
         * @type {Model}
         */
        activeModel: null
    }
});