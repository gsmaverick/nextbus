describe('SearchView', function(){
    var view, model;

    beforeEach(function(){
        window.app = makeFakeApp();

        model = new window.NB.SearchModel({
            query: 'university'
        });

        spyOn(model, 'on').andCallThrough();
        spyOn(model, 'off').andCallThrough();
        spyOn(model, 'fetch').andCallThrough();

        view = new window.NB.SearchView({
            model: model
        });
    });

    afterEach(function(){
        delete window.app;
    });

    it('should listen to the model', function(){
        expect(model.on).toHaveBeenCalledWith(
            'reset change', view.render, view);
    });

    describe('render', function(){
        beforeEach(function(){
            view.render();
        });

        it('should show the loader', function(){
            expect(view.$('.loader')).not.toBeNull();
        });

        it('should fetch the model', function(){
            expect(model.fetch).toHaveBeenCalledWith({
                error: view.fetchError_
            });
        });

        it('should show an error message', function(){
            request = mostRecentAjaxRequest();
            request.response(TestResponses.models.search.error);

            //Sandbox.appendChild(view.render().el);

            expect(view.el.querySelector('.error')).not.toBeNull();
            expect(mixpanel.track).toHaveBeenCalledWith(
                'searchServerError', {query: 'university'});
        });

        describe('loaded events', function(){
            beforeEach(function(){
                request = mostRecentAjaxRequest();
                request.response(TestResponses.models.search.success);

                Sandbox.appendChild(view.render().el);
            });

            it('should render all the results', function(){
                var results = view.$('.result');

                expect(results.length).toEqual(12);
            });

            it('should set the data attribute', function(){
                var result = view.$('.result')[0];

                expect(result.getAttribute('data-stop-code')).toEqual('1183');
            });

            it('should set the proper title', function(){
                var title = view.$('.result .name');

                expect(title.html().trim()).toBe(
                    '#1183 - UNIVERSITY opposite LIFE SCIENCES');
            });

            it('should have all the routes', function(){
                var routes = view.$('.result:first-child .numbers span');

                expect(routes.length).toEqual(2);
            });

            it('should navigate to the right url', function(){
                view.$('.result:first-child').trigger('click');

                var router = app.getRouter();

                expect(router.navigate).toHaveBeenCalledWith('stop/1183', {
                    trigger: true
                });
                expect(mixpanel.track).toHaveBeenCalledWith(
                    'searchResultSelected', {code: '1183'});
            });
        }); // describe('loaded events')

        describe('remove', function(){
            beforeEach(function(){
                view.remove();
            });

            it('should stop listening to the model', function(){
                expect(model.off).toHaveBeenCalledWith(
                    'reset change', view.render, view);
            });
        }); // describe('remove')
    }); // describe('render')
}); // describe('SearchView')