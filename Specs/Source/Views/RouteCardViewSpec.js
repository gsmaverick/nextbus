describe('RouteCardView', function(){
    var view, model;

    beforeEach(function(){
        model = new window.NB.RouteModel(TestResponses.models.route);

        view = new window.NB.RouteCardView({
            model: model
        });

        spyOn(window, 'setInterval').andReturn(1);
        spyOn(window, 'clearInterval');
    });

    describe('render', function(){
        beforeEach(function(){
            Sandbox.appendChild(view.render().el);
        });

        it('should show a padded route element', function(){
            model.set('number', 5);
            view.render();

            var routeTitle = view.$('.title .number');

            expect(routeTitle.hasClass('route-05')).toBeTruthy();
            expect(routeTitle.html()).toEqual('05');
        });

        it('should have the right route name', function(){
            var routeName = view.$('h2');

            expect(routeName.html()).toEqual('COLLEGE');
        });

        it('should remove bound from the endpoint', function(){
            var endpoint = view.$('.name');

            expect(endpoint.html()).not.toContain('Northbound');
        });

        it('should have the active class', function(){
            expect(view.index_).toEqual(0);
            expect(view.el.classList.contains('current')).toBeTruthy();
        });

        it('should set the card to the right', function(){
            var newView = new window.NB.RouteCardView({
                model: model,
                index: 2
            });
            newView.render();

            expect(newView.index_).toEqual(2);
            expect(newView.el.classList.contains('right')).toBeTruthy();
        });

        it('should register a timeout', function(){
            expect(window.setInterval).toHaveBeenCalledWith(
                view.updateTimes_, 20000);
            expect(view.updateTimeout_).not.toBeNull();
        });

        describe('remove', function(){
            beforeEach(function(){
                spyOn(Backbone.View.prototype, 'remove');

                view.remove();
            });

            it('should clear the interval', function(){
                expect(window.clearInterval)
                    .toHaveBeenCalledWith(view.updateTimeout_);
            });

            it('should call super', function(){
                expect(Backbone.View.prototype.remove).toHaveBeenCalled();
            });
        }); // describe('remove')

        describe('updateTimes_', function(){
            beforeEach(function(){
                // Put dummy contents into each time slot to enforce the html
                // being updated by the updateTimes_ call.
                view.$('.time').each(function(){
                    $(this).html('test');
                });

                spyOn(model, 'timeUntilToString').andReturn('10m');

                view.updateTimes_();
            });

            it('should call the model function', function(){
                expect(model.timeUntilToString.callCount).toEqual(5);
            });

            it('should update the html of the time element', function(){
                view.$('.time').each(function(){
                    var content = $(this).html();
                    expect(content).toEqual('10m');
                });
            });

            it('should remove a time if it has passed', function(){
                model.timeUntilToString.andReturn('');
                view.updateTimes_();

                expect(view.el.querySelector('li')).toBeNull();
            });
        }); // describe('updateTimes_')
    }); // describe('render')
}); // describe('RouteCardView')