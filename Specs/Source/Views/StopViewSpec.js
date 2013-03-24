describe('StopView', function(){
    var view, model, $cardView;

    beforeEach(function(){
        window.app = makeFakeApp();

        $cardView = makeViewSpy('CardView', ['render', 'remove']);
        spyOn(window.NB, 'CardView').andReturn($cardView);

        model = new window.NB.StopModel();

        spyOn(model, 'on');
        spyOn(model, 'off');
        spyOn(model, 'fetch').andCallThrough();

        view = new window.NB.StopView({
            model: model
        });
    });

    afterEach(function(){
        delete window.app;
    });

    it('should listen to model events', function(){
        expect(model.on).toHaveBeenCalledWith(
            'change reset', view.render, view);
    });

    describe('render', function(){
        beforeEach(function(){
            view.render();
        });

        describe('loading events', function(){
            it('should set the loading state', function(){
                expect(view.$('.loader')).not.toBeNull();
            });

            it('should fetch the model', function(){
                expect(model.fetch).toHaveBeenCalled();
            });
        }); // describe('loading events')

        describe('loaded events', function(){
            beforeEach(function(){
                request = mostRecentAjaxRequest();
                request.response(TestResponses.models.stop.success);

                view.render();
            });

            it('should create a card view', function(){
                expect(window.NB.CardView).toHaveBeenCalledWith({
                    model: model
                });
                expect($cardView.render).toHaveBeenCalled();
                expect(view.$('#fake-div')).not.toBeNull();
            });

            it('should display the stop name and code', function(){
                var title = view.el.querySelector('h2');

                expect(title.innerHTML).toContain('#2097');
                expect(title.innerHTML).toContain('JOHN at CHARLTON');
            });

            it('should not display more stops button by default', function(){
                var btn = view.el.querySelector('.additional-stops');

                expect(btn).toBeNull();
            });

            describe('hasAdditionalStops', function(){
                beforeEach(function(){
                    view.model.set('hasAdditionalStops', true);

                    view.remove();
                    // Put in Sandbox in order to test events firing.
                    window.Sandbox.appendChild(view.render().el);
                });

                it('should display a button if there are more stops', function(){
                    var btn = view.el.querySelector('.additional-stops');

                    expect(btn).not.toBeNull();
                });

                it('should navigate to the search page', function(){
                    view.$('.additional-stops button').trigger('click');

                    var router = window.app.getRouter();

                    expect(router.navigate).toHaveBeenCalledWith(
                        'search/JOHN%20at%20CHARLTON', {trigger:true});
                });

                it('should send a mixpanel event', function(){
                    view.$('.additional-stops button').trigger('click');

                    expect(mixpanel.track).toHaveBeenCalledWith(
                        'findAdditionalStops');
                });

            }); // describe('hasAdditionalStops')

            describe('remove', function(){
                beforeEach(function(){
                    view.remove();
                });

                it('should stop listening to model events', function(){
                    expect(model.off).toHaveBeenCalledWith(
                        'change reset', view.render, view);
                });

                it('should call remove on subviews', function(){
                    expect($cardView.remove).toHaveBeenCalled();
                });
            }); // describe('remove')
        }); // describe('loaded events')
    }); // describe('render')
}); // describe('StopView')