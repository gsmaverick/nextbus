//= require Router
//= require_tree .

/**
 * The basic application object used to initialize the application.  Creates a
 * new instance of the application which can be started by calling `start()`.
 */
var Application = function(){
    this.model_ = new window.NB.ApplicationModel();

    this.user_ = new window.NB.UserModel();

    this.view_ = new window.NB.ApplicationView({
        model: this.model_
    });

    this.router_ = new window.NB.Router();

    mixpanel.track('AppLoad');
};

_.extend(Application.prototype, Backbone.Events, {
    start: function(){
        this.view_.render();
        this.user_.fetch();

        try {
            Backbone.history.start({
                pushState: true
            });
        } catch (e) {
            console.error(e);
        }
    },

    /**
     * @returns {ApplicationModel}
     */
    getModel: function(){
        return this.model_;
    },

    /**
     * @returns {Router}
     */
    getRouter: function(){
        return this.router_;
    },

    /**
     * @return {UserModel}
     */
    getUser: function(){
        return this.user_;
    },

    /**
     * @returns {ApplicationView}
     */
    getView: function(){
        return this.view_;
    }
});