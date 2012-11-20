describe('UserModel', function(){
    var model, fakeWindow;

    beforeEach(function(){
        window.app = makeFakeApp();

        fakeWindow = {
            localStorage: {}
        };

        model = new window.NB.UserModel({}, {
            win: fakeWindow
        });
    });

    afterEach(function(){
        delete window.app;
    });

    it('should have the right defaults', function(){
        expect(model.get('favourites')).toBeNull();
        expect(model.get('hasSwiped')).toBeFalsy();
        expect(model.get('userId')).toBeNull();
    });

    it('should save whenever attributes are changed', function(){
        spyOn(model, 'save');

        model.set('userId', 'test');
        expect(model.save).toHaveBeenCalled();
    });

    describe('UUID Generation', function(){
        beforeEach(function(){
            spyOn(NB.Utilities, 'UUID');
        });

        it('should generate a UUID if none exists', function(){
            model.fetch();
            expect(NB.Utilities.UUID).toHaveBeenCalled();
        });

        it('should not generate a UUID if one exists', function(){
            fakeWindow.localStorage = {'CurrentUser': '{"userId":"1"}'};

            model.fetch();
            expect(NB.Utilities.UUID).not.toHaveBeenCalled();
        });
    }); // describe('UUID Generation')

    describe('Local Sync', function(){
        it('should update the contents of localStorage', function(){
            model.set({
                'userId': 'test',
                'favourites': ['1183', '1184']
            });

            expect(fakeWindow.localStorage.CurrentUser)
                .toContain('userId":"test"');
            expect(fakeWindow.localStorage.CurrentUser)
                .toContain('"favourites":["1183","1184"]');
        });

        it('should read from the contents of localStorage', function(){
            fakeWindow.localStorage.CurrentUser =
                '{"favourites":["1183","1184"],"userId":"test"}';

            model.fetch();

            expect(model.get('userId')).toEqual('test');
            expect(model.get('favourites')).toEqual(['1183', '1184']);
        });

        it('should delete the user model', function(){
            fakeWindow.localStorage.removeItem = function(){};
            spyOn(fakeWindow.localStorage, 'removeItem');

            model.sync('delete');
            expect(fakeWindow.localStorage.removeItem)
                .toHaveBeenCalledWith('CurrentUser');
        });
    }); // describe('Local Sync')

    describe('favouriting', function(){
        var $changeCallback, $stopModel;
        var stopAttrs = {
            id: '1183',
            name: 'Test',
            routes: [1]
        };

        beforeEach(function(){
            $changeCallback = jasmine.createSpy('ChangeCallback');
            model.on('change:favourites', $changeCallback, model);

            $stopModel = jasmine.createSpyObj('StopModel', [
                'jsonifyForFavourites'
            ]);
            $stopModel.loaded = true;
            $stopModel.jsonifyForFavourites.andReturn(stopAttrs);

            window.app.getModel().set({
                'stopId': '1234',
                'activeModel': $stopModel
            });

            model.fetch();
        });

        it('should initialize the favourites attribute', function(){
            expect(model.get('favourites')).toEqual([]);
        });

        it('should favourite and call change', function(){
            model.toggleFavourite('1183');

            expect($changeCallback).toHaveBeenCalled();
            expect(mixpanel.track).toHaveBeenCalledWith('favourited', {
                stop: '1183'
            });
            expect(model.get('favourites')).toContain(stopAttrs);

            model.toggleFavourite('1183');

            // Once for the initial fetch, then twice from the toggleFavourite
            // actions.
            expect($changeCallback.callCount).toEqual(3);
            expect(mixpanel.track).toHaveBeenCalledWith('unfavourited', {
                stop: '1183'
            });
            expect(model.get('favourites')).not.toContain('1183');
        });

        it('should return whether a stop code is favourited', function(){
            model.set('favourites', [{'id': '1183'}]);

            expect(model.isFavourite('1183')).toBeTruthy();
            expect(model.isFavourite('1283')).toBeFalsy();
        });
    }); // describe('favouriting')
}); // describe('UserModel')