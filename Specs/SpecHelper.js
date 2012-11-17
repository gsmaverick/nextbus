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