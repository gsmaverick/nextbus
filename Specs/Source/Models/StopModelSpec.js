describe('StopModel', function(){
    var model;

    beforeEach(function(){
        model = new window.NB.StopModel();
    });

    it('should have the proper defaults', function(){
        expect(model.get('id')).toBeNull();
        expect(model.get('code')).toBeNull();
        expect(model.get('name')).toBeNull();
        expect(model.get('routes')).toBeNull();
        expect(model.get('hasAdditionalStops')).toBeNull();

        expect(model.loaded).toBeFalsy();
    });

    describe('fetching', function(){
        var request;

        beforeEach(function(){
            model.set('id', 2097);
            model.fetch();

            request = mostRecentAjaxRequest();
        });

        it('should construct a proper url', function(){
            expect(request.url).toEqual('/api/stops/2097');
        });

        it('should parse the server response', function(){
            request.response(TestResponses.models.stop.success);

            expect(model.get('name')).toEqual('JOHN at CHARLTON');
            expect(model.get('id')).toEqual(1785);
            expect(model.get('code')).toEqual(2097);
            expect(model.get('routes').length).toBe(3);
            expect(model.get('hasAdditionalStops')).toBeFalsy();
        });
    }); // describe('fetching')

    describe('public methods', function(){
        beforeEach(function(){
            model.set('id', 2097);
            model.fetch();

            var request = mostRecentAjaxRequest();

            request.response(TestResponses.models.stop.success);
        });

        it('should return an object for jsonifyForFavourites', function(){
            var result = model.jsonifyForFavourites();

            expect(result.id).toEqual(1785);
            expect(result.name).toEqual('JOHN at CHARLTON');
            expect(result.routes).toEqual([21, 35, 33]);
        });
    }); // describe('public methods')
}); // describe('StopModel')