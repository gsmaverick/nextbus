describe('Router', function(){
    var router, $applicationView;

    beforeEach(function(){
        $applicationView = jasmine.createSpyObj('ApplicationView', [
            'showIndex', 'showStopCard', 'showSearchCard', 'render'
        ]);
        spyOn(window.NB, 'ApplicationView').andReturn($applicationView);

        window.app = new Application();

        router = window.app.getRouter();
    });

    afterEach(function(){
        delete window.app;
    });

    describe('route handlers', function(){
        it('should show the index view', function(){
            router.index();

            expect($applicationView.showIndex).toHaveBeenCalled();
        });

        it('should show the stop view', function(){
            router.showStop(1183);

            expect($applicationView.showStopCard).toHaveBeenCalledWith(1183);
        });

        it('should show the search view', function(){
            router.showSearch('university');

            expect($applicationView.showSearchCard)
                .toHaveBeenCalledWith('university');
        });
    }); // describe('route handlers')
}); // describe('Router')