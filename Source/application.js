//= require Router
//= require_tree .
//= stub marketing

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
};

_.extend(Application.prototype, Backbone.Events, {
    start: function(){
        this.primeDocument_();

        // Populate the UserModel if it has previously been created otherwise
        // save the model to localstorage to create it.
        this.user_.fetch();
        this.user_.save();

        this.view_.render();

        try {
            // Clear out the hash so that the back button strategy works.
            window.location.hash = '';

            Backbone.history.start();
        } catch (e) {
            console.error(e);
        }

        mixpanel.register({'uuid': this.user_.get('userId')});
        mixpanel.track('AppLoad');
    },

    /**
     * Removing application loading styles and classes.  Try to hide address
     * bar by absolutely setting the height of the body.
     */
    primeDocument_: function(){
        window.scrollTo(0, 1);

        var body = document.querySelector('body'),
            loadScreen = document.querySelector('.load-screen');

        body.style.height = body.offsetHeight + 'px';
        body.classList.remove('loading');
        body.removeChild(loadScreen);

        window.scrollTo(0, 1);
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