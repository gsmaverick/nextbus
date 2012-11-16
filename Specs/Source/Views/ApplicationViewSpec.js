describe('ApplicationView', function(){
    var view, model, $headerView;

    beforeEach(function(){
        $headerView = makeFakeHeader();
        spyOn(window.NB, 'HeaderView').andReturn($headerView);

        model = new window.NB.ApplicationModel();

        view = new window.NB.ApplicationView({
            model: model
        });
    });

    it('should render a header', function(){
        view.render();

        expect($headerView.render).toHaveBeenCalled();
    });

    describe('setContent_', function(){
        var $contentView, $fakeDiv;

        beforeEach(function(){
            $fakeDiv = document.createElement('div');
            $fakeDiv.id = 'fake-div';

            $contentView = jasmine.createSpyObj('ContentView', [
                'render', 'remove'
            ]);
            $contentView.render.andReturn($fakeDiv);

            spyOn(model, 'set');
        });

        it('should update the content view', function(){
            view.setContent_($contentView);

            expect(view.contentView_).toBe($contentView);
            expect(view.$('#fake-div')).not.toBeNull();
            expect(model.set).toHaveBeenCalledWith({});
        });

        it('should remove the previous view', function(){
            view.setContent_($contentView);
            view.setContent_($contentView);

            expect($contentView.remove.callCount).toEqual(1);
        });

        it('should update the app model with new attributes', function(){
            var attrs = {'a': 1, 'b': 'test'};

            view.setContent_($contentView, attrs);

            expect(model.set).toHaveBeenCalledWith(attrs);
        });
    }); // describe('setContent_')
}); // describe('ApplicationView')