describe('HeaderView', function(){
    var view, model;
    var $favouriteStarView, $favouritesListView, $fakeDiv;

    beforeEach(function(){
        window.app = makeFakeApp();

        $fakeDiv = document.createElement('div');
        $fakeDiv.className = 'fake-div';

        $favouriteStarView = jasmine.createSpyObj('FavouriteStarView', [
            'render', 'remove'
        ]);
        spyOn(window.NB, 'FavouriteStarView').andReturn($favouriteStarView);

        $favouritesListView = makeViewSpy('FavouritesListView', [
            'render', 'remove', 'on', 'off'], $fakeDiv);
        spyOn(window.NB, 'FavouritesListView').andReturn($favouritesListView);

        model = new window.NB.ApplicationModel({
            activeCard: 'index'
        });

        spyOn(model, 'on').andCallThrough();
        spyOn(model, 'off').andCallThrough();

        view = new window.NB.HeaderView({
            model: model
        });
    });

    afterEach(function(){
        delete window.app;
    });

    it('should listen to the application model', function(){
        expect(model.on).toHaveBeenCalledWith(
            'change:activeCard', view.activeCardChange_, view);
    });

    describe('render', function(){
        beforeEach(function(){
            Sandbox.appendChild(view.render().el);
        });

        it('should render the title', function(){
            var title = view.$('h1');

            expect(title).not.toBeNull();
            expect(title.html()).toEqual('busticker');
        });

        it('the header should not have the open class', function(){
            expect(view.el.classList.contains('open')).not.toBeTruthy();
        });

        it('should render the back button', function(){
            var back = view.$('.back.btn');

            expect(back).not.toBeNull();
        });

        it('should render the expand button', function(){
            var expand = view.$('.expand.btn');

            expect(expand).not.toBeNull();
        });

        it('should render the favourite button', function(){
            var favourite = view.$('.favourite.btn');

            expect(favourite).not.toBeNull();
        });

        it('should create a favourite star view', function(){
            expect(window.NB.FavouriteStarView).toHaveBeenCalledWith({
                el: view.$('.favourite'),
                model: window.app.user_
            });
        });

        it('should create a favourites list view', function(){
            expect(window.NB.FavouritesListView).toHaveBeenCalledWith({
                model: window.app.user_
            });
            expect($favouritesListView.render).toHaveBeenCalled();
            expect($favouritesListView.on).toHaveBeenCalledWith(
                'stopSelected', view.expandHeaderEvt_, view);

            expect(view.$('.fake-div')).not.toBeNull();
        });

        describe('ui events', function(){
            beforeEach(function(){
                spyOn(window.history, 'back');
            });

            it('back button should rely on window.history', function(){
                view.$('.back').trigger('click');

                expect(window.history.back).toHaveBeenCalled();
            });

            it('should open the header', function(){
                view.$('.expand').trigger('click');

                expect(view.el.classList.contains('open')).toBeTruthy();
                expect(mixpanel.track).toHaveBeenCalledWith('openHeader');
            });
        }); // describe('ui events')

        describe('card changes', function(){
            it('should add the right back button class', function(){
                var classes = view.el.classList;

                model.set('activeCard', 'search');

                expect(classes.contains('has-back-button')).toBeTruthy();

                model.set('activeCard', 'index');

                expect(classes.contains('has-back-button')).toBeFalsy();
            });

            it('should add the right favourite button class', function(){
                var classes = view.el.classList;

                model.set('activeCard', 'search');

                expect(classes.contains('has-favourite-button')).toBeFalsy();

                model.set('activeCard', 'stop');

                expect(classes.contains('has-favourite-button')).toBeTruthy();
            });
        }); // describe('card changes')

        describe('remove', function(){
            beforeEach(function(){
                view.remove();
            });

            it('should stop listening to the application model', function(){
                expect(model.off).toHaveBeenCalledWith(
                    'change:activeCard', view.activeCardChange_, view);
            });

            it('should remove the favourite star view', function(){
                expect($favouriteStarView.remove).toHaveBeenCalled();
            });

            it('should remove the favourites list view', function(){
                expect($favouritesListView.off).toHaveBeenCalledWith(
                    'stopSelected', view.expandHeaderEvt_, view);
                expect($favouritesListView.remove).toHaveBeenCalled();
            });
        }); // describe('remove')
    }); // describe('render')
}); // describe('HeaderView')