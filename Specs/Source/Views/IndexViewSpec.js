describe('IndexView', function(){
    var view;

    beforeEach(function(){
        window.app = makeFakeApp();

        view = new window.NB.IndexView();

        window.Sandbox.appendChild(view.render().el);
    });

    afterEach(function(){
        delete window.app;
    });

    describe('user actions', function(){
        it('should navigate to a stop', function(){
            $('.input-holder input', Sandbox).val('1183');

            $('form', Sandbox).trigger('submit');

            var router = window.app.getRouter();
            expect(router.navigate).toHaveBeenCalledWith('stop/1183', {
                trigger: true
            });
            expect(mixpanel.track).toHaveBeenCalledWith('formSubmit', {
                action: 'stop',
                query: '1183'
            });
        });

        it('should navigate to a search result', function(){
            $('.input-holder input', Sandbox).val('university');

            $('form', Sandbox).trigger('submit');

            var router = window.app.getRouter();
            expect(router.navigate).toHaveBeenCalledWith('search/university', {
                trigger: true
            });
            expect(mixpanel.track).toHaveBeenCalledWith('formSubmit', {
                action: 'search',
                query: 'university'
            });

            $('.input-holder input', Sandbox).val('11844');

            $('form', Sandbox).trigger('submit');

            var router = window.app.getRouter();
            expect(router.navigate).toHaveBeenCalledWith('search/11844', {
                trigger: true
            });
        });

        it('should initiate a geolocation request', function(){
            spyOn(navigator.geolocation, 'getCurrentPosition');

            $('button', Sandbox).trigger('click');

            expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
                view.geoSuccessEvt_, view.geoErrorEvt_);
            expect(view.el.classList.contains('locating')).toBeTruthy();
        });

        describe('geolocation response', function(){
            beforeEach(function(){
                spyOn(navigator.geolocation, 'getCurrentPosition');
                spyOn(window, 'alert');

                view.currentLocationEvt_();
            });

            it('should alert the right error message for code 1', function(){
                view.geoErrorEvt_({
                    code: 1,
                    message: 'test'
                });

                expect(window.alert).toHaveBeenCalledWith(
                    'Permission denied: Could not acquire current location.');
                expect(mixpanel.track).toHaveBeenCalledWith('geoError', {
                    code: 1,
                    message: 'test'
                });
                expect(view.el.classList.contains('locating')).toBeFalsy();
            });

            it('should alert the right error message for code 2', function(){
                var msg = 'Could not determine current location.  Ensure '
                    + 'location services are enabled.';

                view.geoErrorEvt_({
                    code: 2,
                    message: 'test'
                });


                expect(window.alert).toHaveBeenCalledWith(msg);
                expect(mixpanel.track).toHaveBeenCalledWith('geoError', {
                    code: 2,
                    message: 'test'
                });
                expect(view.el.classList.contains('locating')).toBeFalsy();
            });

            it('should handle a successful geolocation call', function(){
                view.geoSuccessEvt_({
                    coords: {
                        latitude: 1,
                        longitude: 1
                    }
                });

                expect(window.app.router_.navigate).toHaveBeenCalledWith(
                    'search/1%7C1', {trigger: true});
                expect(view.el.classList.contains('locating')).toBeFalsy();
                expect(mixpanel.track).toHaveBeenCalledWith('geoSuccess');
            });
        }); // describe('geolocation response')
    }); // describe('user actions')
}); // describe('IndexView')