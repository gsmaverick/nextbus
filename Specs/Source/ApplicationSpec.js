describe('Application', function(){
    var appObj;
    var $appModel, $appView, $router, $userModel;

    beforeEach(function(){
        Sandbox.innerHTML = '<div class="application"></div>';

        $appModel = jasmine.createSpy('ApplicationModel');
        spyOn(window.NB, 'ApplicationModel').andReturn($appModel);

        $appView = jasmine.createSpyObj('ApplicationView', ['render']);
        spyOn(window.NB, 'ApplicationView').andReturn($appView);

        $router = jasmine.createSpy('Router');
        spyOn(window.NB, 'Router').andReturn($router);

        $userModel = jasmine.createSpyObj('UserModel', ['fetch', 'get']);
        spyOn(window.NB, 'UserModel').andReturn($userModel);

        appObj = new Application();
    });

    afterEach(function(){
        Sandbox.innerHTML = '';
    });

    describe('initialization', function(){
        it('should have an application model', function(){
            expect(window.NB.ApplicationModel).toHaveBeenCalled();
        });

        it('should have an application view', function(){
            expect(window.NB.ApplicationView).toHaveBeenCalledWith({
                model: $appModel
            });
        });

        it('should have an user model', function(){
            expect(window.NB.UserModel).toHaveBeenCalled();
        });

        it('should have a router', function(){
            expect(window.NB.Router).toHaveBeenCalled();
        });
    }); // describe('initialization')

    describe('getters', function(){
        it('getModel', function(){
            expect(appObj.getModel()).toBe($appModel);
        });

        it('getRouter', function(){
            expect(appObj.getRouter()).toBe($router);
        });

        it('getUser', function(){
            expect(appObj.getUser()).toBe($userModel);
        });

        it('getView', function(){
            expect(appObj.getView()).toBe($appView);
        });
    }); // describe('getters')

    describe('start', function(){
        // Create a fake router so that an instance of Backbone.history is
        // initialized.
        var router = Backbone.Router.extend({
            initialize: function(){
                this.route('.*', 'splat');
            },

            splat: function(){}
        });

        beforeEach(function(){
            new router();
            spyOn(Backbone.history, 'start');
            appObj.start();
        });

        it('should render the application view', function(){
            expect($appView.render).toHaveBeenCalled();
        });

        it('should fetch the user model', function(){
            expect($userModel.fetch).toHaveBeenCalled();
        });
    }); // describe('start')
}); // describe('Application')