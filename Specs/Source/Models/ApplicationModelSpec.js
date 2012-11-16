describe('ApplicationModel', function(){
    var model;

    beforeEach(function(){
        model = new window.NB.ApplicationModel();
    });

    it('should have the right defaults', function(){
        expect(model.get('activeCard')).toBeNull();
        expect(model.get('stopId')).toBeNull();
        expect(model.get('activeModel')).toBeNull();
    });
}); // describe('ApplicationModel')