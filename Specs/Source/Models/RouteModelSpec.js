describe('RouteModel', function(){
    var model;

    beforeEach(function(){
        model = new window.NB.RouteModel();
    });

    describe('timeUntilToString', function(){
        it('should show just minutes', function(){
            var time = Date.now() + (60000 * 10);

            expect(model.timeUntilToString(time)).toEqual('10m');
        });

        it('should show hours and minutes', function(){
            var time = Date.now() + (60000 * 78);

            expect(model.timeUntilToString(time)).toEqual('1h18m');
        });

        it('should return nothing', function(){
            var time = Date.now() - (60000 * 2);

            expect(model.timeUntilToString(time)).toEqual('');
        });

        it('should return abstract value over 10 hours', function(){
            var time = Date.now() + (60000 * 700);

            expect(model.timeUntilToString(time)).toEqual('10h+');
        });
    }); // describe('timeUntilToString')

    describe('stripEndpoint', function(){
        it('should strip out bound', function(){
            expect(model.stripEndpoint('Northbound to')).toEqual('North to');
            expect(model.stripEndpoint('Westbound ')).toEqual('West ');
            expect(model.stripEndpoint('Northbound to')).toEqual('North to');
        });

        it('should not strip out bound', function(){
            expect(model.stripEndpoint('Northbound')).toEqual('Northbound');
            expect(model.stripEndpoint('bound to')).toEqual('bound to');
            expect(model.stripEndpoint('weabound')).toEqual('weabound');
        });
    }); // describe('stripEndpoint')
}); // describe('RouteModel')