/**
 * This file contains the router code as well as initializaing the application
 * namespace.
 */
window.NB = window.NB || {};

window.NB.Router = Backbone.Router.extend({
    initialize: function(){
        this.route('.*', 'notFound');
        this.route('', 'index');
        this.route('stop/:stopId', 'showStop');
        this.route('search/*splat', 'showSearch');
    },

    index: function(){
        var appView = window.app.getView();
        appView.showIndex();
    },

    showStop: function(stopId){
        var appView = window.app.getView();
        appView.showStopCard(stopId);
    },

    showSearch: function(splat){
        var appView = window.app.getView();
        appView.showSearchCard(splat);
    },

    notFound: function(){
        console.error('URL Not Found');
        return;
    }
});