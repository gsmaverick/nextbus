describe('SearchModel', function(){
    var model;

    beforeEach(function(){
        model = new window.NB.SearchModel();
    });

    it('should initialize the right defaults', function(){
        expect(model.get('query')).toBeNull();
        expect(model.loaded).toBeFalsy();
    });

    describe('querying', function(){
        beforeEach(function(){
            model.set('query', 'university');

            spyOn(window, 'decodeURIComponent').andCallFake(function(text){
                return text;
            });
        });

        it('should construct the right url for a text query', function(){
            model.fetch();
            request = mostRecentAjaxRequest();

            expect(request.url).toEqual('/api/search/text/university');
            expect(window.decodeURIComponent).toHaveBeenCalled();
        });

        it('should construct the right url for a geolocation query', function(){
            model.set('query', '1|1');
            model.fetch();
            request = mostRecentAjaxRequest();

            expect(request.url).toEqual('/api/search/geo/1|1');
            expect(window.decodeURIComponent).toHaveBeenCalled();
        });

        it('should set the loading flag when parsing', function(){
            model.fetch();

            request = mostRecentAjaxRequest();
            request.response(TestResponses.models.search.success);

            expect(model.loaded).toBeTruthy();
        });
    }); // describe('querying')

    describe('query string', function(){
        it('should return current location', function(){
            model.set('query', '1|1');

            expect(model.queryString()).toEqual('current location');
        });

        it('should return the query', function(){
            model.set('query', 'university');

            expect(model.queryString()).toEqual('university');
        });
    }); // describe('query string')
}); // describe('SearchModel')