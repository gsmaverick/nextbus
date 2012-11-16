describe('FavouriteStarView', function(){
    var view, model, appModel;

    beforeEach(function(){
        window.app = makeFakeApp();

        appModel = window.app.getModel();
        spyOn(appModel, 'on').andCallThrough();
        spyOn(appModel, 'off').andCallThrough();

        model = new window.NB.UserModel({
            userId: "8cd606f2-1269-4665-bede-4b6f92cbe9c1",
            favourites: ['1183', '1113']
        });
        spyOn(model, 'on').andCallThrough();
        spyOn(model, 'off').andCallThrough();

        Sandbox.innerHTML =
            '<div><img src="/static/img/unstarred.png"/></div>';

        view = new window.NB.FavouriteStarView({
            model: model,
            el: Sandbox
        });
        view.render();
    });

    afterEach(function(){
        delete window.app;
    });

    describe('model events', function(){
        it('should bind to the application and user model', function(){
            expect(appModel.on).toHaveBeenCalledWith(
                'change:stopId', view.updateStar_, view);
            expect(model.on).toHaveBeenCalledWith(
                'change:favourites', view.updateStar_, view);
        });

        it('should unbind from the application and user model', function(){
            view.remove();

            expect(appModel.off).toHaveBeenCalledWith(
                'change:stopId', view.updateStar_, view);
            expect(model.off).toHaveBeenCalledWith(
                'change:favourites', view.updateStar_, view);
        });
    }); // describe('model events')

    describe('favourite toggling', function(){
        var $stopModel;

        beforeEach(function(){
            $stopModel = jasmine.createSpyObj('StopModel', [
                'jsonifyForFavourites'
            ]);
            $stopModel.loaded = true;
            $stopModel.jsonifyForFavourites.andReturn({
                id: 1234,
                name: 'Test',
                routes: [1]
            });

            view.render();

            appModel.set({
                'stopId': '1234',
                'activeModel': $stopModel
            });
        });

        it('should toggle the state of the user model', function(){
            var idx, src,
                img = view.$('img');

            img.trigger('click');
            idx = _.pluck(model.get('favourites'), 'id').indexOf(1234);
            src = img.attr('src');

            expect(idx).not.toBe(-1);
            expect(src).not.toContain('unstarred');

            img.trigger('click');
            idx = _.pluck(model.get('favourites'), 'id').indexOf(1234);
            src = img.attr('src');

            expect(idx).toBe(-1);
            expect(src).toContain('unstarred');
        });
    }); // describe('favourite toggling')
}); // describe('FavouriteStarView')