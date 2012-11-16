describe('StopModel', function(){
    var model;

    beforeEach(function(){
        model = new window.NB.StopModel();
    });

    it('should have the proper defaults', function(){
        expect(model.get('id')).toBeNull();
        expect(model.get('name')).toBeNull();
        expect(model.get('routes')).toBeNull();

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
            expect(model.get('id')).toEqual(2097);
            expect(model.get('routes').length).toBe(3);
        });

        it('should return an object for jsonifyForFavourites', function(){
            request.response(TestResponses.models.stop.success);

            var result = model.jsonifyForFavourites();

            expect(result.id).toEqual(2097);
            expect(result.name).toEqual('JOHN at CHARLTON');
            expect(result.routes).toEqual([35, 21, 33]);
        });
    }); // describe('fetching')
}); // describe('StopModel')