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
            expect(router.navigate).toHaveBeenCalledWith(
                'stop/1183', {trigger: true}
            );
        });

        it('should navigate to a search result', function(){
            $('.input-holder input', Sandbox).val('university');

            $('form', Sandbox).trigger('submit');

            var router = window.app.getRouter();
            expect(router.navigate).toHaveBeenCalledWith(
                'search/university', {trigger: true}
            );

            $('.input-holder input', Sandbox).val('11844');

            $('form', Sandbox).trigger('submit');

            var router = window.app.getRouter();
            expect(router.navigate).toHaveBeenCalledWith(
                'search/11844', {trigger: true}
            );
        });

        it('should initiate a geolocation request', function(){
            spyOn(navigator.geolocation, 'getCurrentPosition');

            $('button', Sandbox).trigger('click');

            expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
        });
    }); // describe('user actions')
}); // describe('IndexView')