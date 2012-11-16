describe('CardView', function(){
    var view, model, $routeCardView;

    beforeEach(function(){
        window.app = makeFakeApp();

        model = new window.NB.StopModel(
            JSON.parse(TestResponses.models.stop.success.responseText), {
                parse: true
            }
        );

        view = new window.NB.CardView({model: model});
    });

    afterEach(function(){
        view.remove();
        delete window.app;
    });

    it('should initialize the route card views array', function(){
        expect(view.routeCardViews_).toEqual([]);
    });

    it('should get the current user model', function(){
        expect(view.currentUser_).toEqual(window.app.user_);
    });

    describe('render', function(){
        beforeEach(function(){
            $routeCardView = jasmine.createSpyObj('RouteCardView', [
                'render', 'remove'
            ]);
            $routeCardView.render.andCallFake(function(){
                return {el: document.createElement('div')}
            });
            spyOn(window.NB, 'RouteCardView').andReturn($routeCardView);

            Sandbox.appendChild(view.render().el);
        });

        it('should set the number of slides', function(){
            expect(view.numSlides_).toBe(3);
        });

        it('should populate the correct html', function(){
            expect($('.all-card', view.el)).not.toBeNull();
            expect($('.fakeCard', view.el)).not.toBeNull();
            expect($('.dots', view.el)).not.toBeNull();
        });

        it('should create the correct number of slider dots', function(){
            var dots = $('.dots li', view.el);

            expect(dots.length).toEqual(view.numSlides_);
        });

        it('should create a route card view for each route', function(){
            var routeCards = $('.all-cards div', view.el);

            expect(window.NB.RouteCardView).toHaveBeenCalledWith({
                model: model.get('routes')[0],
                index: 0
            });

            expect(window.NB.RouteCardView).toHaveBeenCalledWith({
                model: model.get('routes')[1],
                index: 1
            });

            expect(window.NB.RouteCardView).toHaveBeenCalledWith({
                model: model.get('routes')[2],
                index: 2
            });

            expect($routeCardView.render.callCount).toEqual(3);

            expect(routeCards.length).toEqual(3);
        });

        describe('remove', function(){
            beforeEach(function(){
                spyOn(Backbone.View.prototype, 'remove');

                view.remove();
            });

            it('should remove all subviews', function(){
                expect($routeCardView.remove.callCount).toEqual(3);
            });

            it('should call super', function(){
                expect(Backbone.View.prototype.remove).toHaveBeenCalled();
            });
        }); // describe('remove')
    }); // describe('render')

    describe('touch events', function(){
        beforeEach(function(){
            Sandbox.appendChild(view.render().el);
        });

        it('should not swipe right past the first slide', function(){
            view.$('.card.current .timez').trigger('swipeRight');

            var firstSlide = $('.card:nth-child(1)', view.el);

            expect(view.activeSlide_).toEqual(1);
            expect(firstSlide).toEqual(view.$('.card.current'));
        });

        it('should not swipe left past the last slide', function(){
            view.$('.card.current .title').trigger('swipeLeft');
            view.$('.card.current .timez').trigger('swipeLeft');

            var thirdSlide = $('.card:nth-child(3)', view.el);

            expect(view.activeSlide_).toEqual(3);
            expect(thirdSlide).toEqual(view.$('.card.current'));
        });

        it('should update the slide dots', function(){
            var nthDot, activeDot;

            view.$('.card.current .title').trigger('swipeLeft');

            nthDot = view.$('.dots li:nth-child(2)'),
            activeDot = view.$('.dots li.active');

            expect(view.activeSlide_).toEqual(2);
            expect(nthDot).toEqual(activeDot);

            view.$('.card.current .title').trigger('swipeRight');

            nthDot = view.$('.dots li:nth-child(1)'),
            activeDot = view.$('.dots li.active');

            expect(view.activeSlide_).toEqual(1);
            expect(nthDot).toEqual(activeDot);
        });
    }); // describe('touch events')

    describe('swipe hint', function(){
        var renderWithSwipeAndSlideVal = function(swipeVal, slidesVal){
            window.app.user_.get.andReturn(swipeVal);
            view.numSlides_ = slidesVal;
            Sandbox.appendChild(view.render().el);
        };

        it('should not show a hint if there is only one slide', function(){
            renderWithSwipeAndSlideVal(true, 1);

            expect(view.el.querySelector('.swipe-hint')).toBeNull();

            renderWithSwipeAndSlideVal(false, 1);

            expect(view.el.querySelector('.swipe-hint')).toBeNull();
        });

        it('should show a hint if the user has not swiped', function(){
            renderWithSwipeAndSlideVal(false, 2);

            expect(view.el.querySelector('.swipe-hint')).not.toBeNull();
        });

        it('should not a show a hint if the user has swiped', function(){
            renderWithSwipeAndSlideVal(true, 2);

            expect(view.el.querySelector('.swipe-hint')).toBeNull();
        });

        it('should set hasSwipe to true after the first swipe', function(){
            renderWithSwipeAndSlideVal(false, 2);

            var swipeHint = view.el.querySelector('.swipe-hint');
            view.$('.card.current .timez').trigger('swipeLeft');

            expect(window.app.user_.set).toHaveBeenCalledWith(
                'hasSwiped', true);
            expect(swipeHint.style.display).toEqual('none');
        });
    }); // describe('swipe hint')
}); // describe('CardView')