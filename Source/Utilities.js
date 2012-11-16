window.NB.Utilities = {
    /**
     * Generate a random v4 UUID of the form:
     *   xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
     * Used with permission from Alexey Silin <pinkoblomingo@gmail.com>.
     */
    UUID: function(a,b){
        for (b = a = ''; a++ < 36; b += a * 51 & 52 ?
            (a ^ 15 ? 8 ^ Math.random() * (a ^ 20 ? 16 : 4) : 4).toString(16) :
            '-');
        return b
    },

    padRouteNumber: function(num){
        var routeNum = '0' + num;

        return routeNum.slice(-2);
    }
}