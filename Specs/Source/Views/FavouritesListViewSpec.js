describe('FavouritesListView', function(){
    var view, model;

    beforeEach(function(){
        window.app = makeFakeApp();

        model = new window.NB.UserModel({
            userId: 'uuid-1',
            favourites: [
                {
                    id: '1234',
                    name: 'Test 1',
                    routes: [1, 2]
                },
                {
                    id: '1235',
                    name: 'Test 2',
                    routes: [3, 4]
                },
                {
                    id: '1236',
                    name: 'Test 3',
                    routes: [1, 2, 6]
                },
                {
                    id: '1237',
                    name: 'Test 4',
                    routes: [2]
                },
                {
                    id: '1238',
                    name: 'Test 5',
                    routes: [1, 51]
                }
            ]
        });

        spyOn(model, 'on');
        spyOn(model, 'off');

        view = new window.NB.FavouritesListView({
            model: model
        });
    });

    afterEach(function(){
        delete window.app;
    });

    it('should listen to the user model', function(){
        expect(model.on).toHaveBeenCalledWith(
            'change reset', view.render, view);
    });

    describe('render', function(){
        beforeEach(function(){
            Sandbox.appendChild(view.render().el);
        });


        it('should set the current page and number of pages', function(){
            expect(view.numPages_).toEqual(3);
            expect(view.currentPage_).toEqual(0);
        });

        it('should render the previous next navigation buttons', function(){
            expect(view.el.querySelector('.prev')).not.toBeNull();
            expect(view.$('.prev').hasClass('disabled')).toBeTruthy();
            expect(view.el.querySelector('.next')).not.toBeNull();
            expect(view.$('.next').hasClass('disabled')).toBeFalsy();

            view.pageSize_ = 10;
            view.render();
            expect(view.$('.next').hasClass('disabled')).toBeTruthy();
        });

        it('should disable the next page button on render', function(){
            model.set('favourites', []);
            view.render();

            expect(view.el.querySelector('.next')).not.toBeNull();
            expect(view.$('.next').hasClass('disabled')).toBeTruthy();
        });

        describe('events', function(){
            var prev, next;

            beforeEach(function(){
                spyOn(view, 'renderFavouritesPage_');

                prev = view.$('.prev');
                next = view.$('.next');
            });

            it('should navigate to the right stop route', function(){
                view.$('li:first-child').trigger('click');

                expect(window.app.router_.navigate).toHaveBeenCalledWith(
                    'stop/1234', {trigger: true});
            });

            it('should go to the next page', function(){
                next.trigger('click');

                expect(view.currentPage_).toEqual(1);
                expect(prev.hasClass('disabled')).toBeFalsy();
                expect(next.hasClass('disabled')).toBeFalsy();
                expect(view.renderFavouritesPage_).toHaveBeenCalled();
            });

            it('should disable the next page button on last page', function(){
                next.trigger('click');

                expect(view.currentPage_).toEqual(1);
                expect(prev.hasClass('disabled')).toBeFalsy();
                expect(next.hasClass('disabled')).toBeFalsy();

                next.trigger('click');

                expect(prev.hasClass('disabled')).toBeFalsy();
                expect(next.hasClass('disabled')).toBeTruthy();
                expect(view.renderFavouritesPage_.callCount).toEqual(2);
            });

            it('should go back a page', function(){
                next.trigger('click');
                next.trigger('click');
                prev.trigger('click');

                expect(view.currentPage_).toEqual(1);
                expect(prev.hasClass('disabled')).toBeFalsy();

                prev.trigger('click');

                expect(view.renderFavouritesPage_.callCount).toEqual(4);
                expect(prev.hasClass('disabled')).toBeTruthy();
            });
        }); // describe('events')

        describe('remove', function(){
            beforeEach(function(){
                spyOn(Backbone.View.prototype, 'remove');

                view.remove();
            });

            it('should stop listening to the model', function(){
                expect(model.off).toHaveBeenCalledWith(
                    'change reset', view.render, view);
            });

            it('should call super', function(){
                expect(Backbone.View.prototype.remove).toHaveBeenCalled();
            });
        }); // describe('remove')
    }); // describe('render')

    describe('favouritesForPage_', function(){
        beforeEach(function(){
            model.set('favourites', [1, 2, 3, 4, 5]);
        });

        it('should default to page size of 2', function(){
            expect(view.favouritesForPage_(0).length).toEqual(2);
        });

        it('should return a zero-indexed page', function(){
            expect(view.favouritesForPage_(0)).toEqual([1, 2]);
            expect(view.favouritesForPage_(1)).toEqual([3, 4]);
            expect(view.favouritesForPage_(2)).toEqual([5]);
        });
    }); // describe('favouritesForPage_')
}); // describe('FavouritesListView')