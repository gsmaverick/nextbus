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
        it('should navigate to a search result', function(){
            var router = window.app.getRouter();

            $('.input-holder input', Sandbox).val('university life');
            $('form', Sandbox).trigger('submit');

            expect(router.navigate).toHaveBeenCalledWith(
                'search/university%20life', {trigger: true});

            $('.input-holder input', Sandbox).val('11844');
            $('form', Sandbox).trigger('submit');

            expect(router.navigate).toHaveBeenCalledWith('search/11844', {
                trigger: true
            });
        });

        it('should initiate a geolocation request', function(){
            spyOn(navigator.geolocation, 'getCurrentPosition');

            $('button', Sandbox).trigger('click');

            expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(
                view.geoSuccessEvt_, view.geoErrorEvt_, {
                    maximumAge: 300000,
                    timeout: 5000,
                    enableHighAccuracy: true
                });
            expect(view.el.classList.contains('locating')).toBeTruthy();
        });

        describe('geolocation', function(){
            beforeEach(function(){
                spyOn(navigator.geolocation, 'getCurrentPosition');
                spyOn(window, 'alert');

                view.currentLocationEvt_();
            });

            it('should set in progress flag', function(){
                expect(view.gpsInProgress_).toBeTruthy();
            });

            it('should not start another geolocation request', function(){
                view.currentLocationEvt_();

                var calls = navigator.geolocation.getCurrentPosition.callCount;

                expect(calls).toEqual(1);
                expect(window.alert).toHaveBeenCalledWith(
                    'Geolocation request in progress.');
            });

            it('should alert the right error message for code 0', function(){
                view.geoErrorEvt_({
                    code: 0,
                    message: 'test'
                });

                expect(window.alert).toHaveBeenCalledWith(
                    'Could not determine current location due to an error.');
                expect(mixpanel.track).toHaveBeenCalledWith('geoError', {
                    code: 0,
                    message: 'test'
                });
                expect(view.el.classList.contains('locating')).toBeFalsy();
                expect(view.gpsInProgress_).toBeFalsy();
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
                expect(view.gpsInProgress_).toBeFalsy();
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
                expect(view.gpsInProgress_).toBeFalsy();
            });

            it('should alert the right error message for code 3', function(){
                var msg = 'Could not determine current location because the '
                    + 'GPS didn\'t respond in time.';

                view.geoErrorEvt_({
                    code: 3,
                    message: 'test'
                });


                expect(window.alert).toHaveBeenCalledWith(msg);
                expect(mixpanel.track).toHaveBeenCalledWith('geoError', {
                    code: 3,
                    message: 'test'
                });
                expect(view.el.classList.contains('locating')).toBeFalsy();
                expect(view.gpsInProgress_).toBeFalsy();
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
                expect(view.gpsInProgress_).toBeFalsy();
            });
        }); // describe('geolocation')
    }); // describe('user actions')
}); // describe('IndexView')