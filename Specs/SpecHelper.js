/**
 * Determines if the given jasmine spec should run based on whether it's highest
 * level suite desciption match the value of the runMatch parameter in the url.
 *
 * @param {Spec} spec Jasmine spec object that is about to be executed.
 *
 * @returns {Boolean} True if spec should run, false if it should be skipped.
 */
var specFilter = function(spec){
    /**
     * @param {String} name Key of the value to be retrieved from the url.
     *
     * @returns {Object} Value of the requested key or undefined if the key does
     *     not exist in the url.
     */
    var getQueryParam = function(name){
        var pairs = window.location.search.slice(1).split('&');

        for (key in pairs){
            var arr = pairs[key].split('=');

            if (arr[0] === name)
                return decodeURIComponent(arr[1].replace(/\+/g, " "));
        }
    }

    var val = getQueryParam('runMatch') || '';

    // Find the outermost suite this spec belongs to.
    var suite = spec.suite;
    while (suite.parentSuite) suite = suite.parentSuite;

    return suite.description.toLowerCase().indexOf(val.toLowerCase()) !== -1;
};

// Makes a fake header instance that can be used to test against interactions
// with the header.
var makeFakeHeader = function(){
    var view;

    view = jasmine.createSpyObj('HeaderView', ['render']);

    view.render.andReturn({
        el: document.createElement('div')
    });

    return view;
};

var makeFakeApp = function(){
    var $fakeRouter = jasmine.createSpyObj('Router', ['navigate']);

    var $fakeUser = jasmine.createSpyObj('UserModel', [
        'get', 'set', 'on', 'off'
    ]);

    var appModel = new window.NB.ApplicationModel();

    var app = {
        router_: $fakeRouter,

        model_: appModel,

        user_: $fakeUser,

        getRouter: function(){
            return $fakeRouter;
        },

        getModel: function(){
            return appModel;
        },

        getUser: function(){
            return $fakeUser;
        }
    };

    return app;
};

// Makes a view spy that has a render function which returns an HTMLNode as its
// el property.
var makeViewSpy = function(name, methods, fakeDiv){
    var $view = jasmine.createSpyObj(name, methods);

    $view.render.andCallFake(function(){
        return {el: fakeDiv || document.createElement('div')};
    });

    return $view;
};

beforeEach(function(){
    window.mixpanel = jasmine.createSpyObj('mixpanel', ['track', 'register']);

    var iframe = document.querySelector('#sandbox');
    var childDiv = document.createElement('div');

    iframe.appendChild(childDiv);

    window.Sandbox = childDiv;

    jasmine.Ajax.useMock();
});

afterEach(function(){
    if (window.app) throw "window.app not cleaned up!";
});