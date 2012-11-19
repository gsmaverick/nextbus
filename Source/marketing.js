(function(win){
    // Scripting to activate the image carousel on the homepage.  It cycles the
    // four images through the iPhone container on the homepage.
    "use strict";

    // First extend jQuery with an extra easing function to mimic the CSS3
    // ease-in-out function from: http://gsgd.co.uk/sandbox/jquery/easing/
    jQuery.extend(jQuery.easing, {
        easeInOut: function (x, t, b, c, d) {
            return -c/2 * (Math.cos(Math.PI * t/d) - 1) + b;
        }
    });

    /**
     * @type {Number} Total number of images in the carousel.
     */
    var numItems = 4;

    /**
     * @type {Number} The current item which is actively in the carousel
     * viewing window.
     */
    var currentItem = 0;

    /**
     * @type {Number} Time between the switching of each image.
     */
    var carouselInterval = 5000;

    /**
     * @type {Number} Length that each animation should take.
     */
    var animationLength = 300;

    /**
     * Changes the left value of an element by animating it.
     *
     * @param {Number} idx Index value of the image to be changed.
     * @param {Number} left New value for the left attribute of the image.
     */
    var animateLeft = function(idx, left){
        var img = $('.screens img:nth-child('+idx+')');

        img.animate({
            'left': left + 'px'
        }, {
            duration: animationLength,
            easing: 'easeInOut'
        });
    };

    /**
     * Moves all the images to the right of the carousel's viewing container.
     */
    var resetImages = function(){
        for (var i = 0; i < numItems; i++)
            // Don't animate first image to the right of the viewing container.
            if (i !== 0) animateLeft(i + 1, 270);
    };

    /**
     * Updates the currently displayed image inside the carousel viewing
     * container.
     */
    var update = function(){
        currentItem++;

        if (currentItem == numItems) resetImages();
        else animateLeft(currentItem, -270);

        // Wrap around the number of items in the carousel to set the next
        // image to be displayed.
        currentItem %= numItems;

        animateLeft(currentItem + 1, 0);
    };

    $(function(){ win.setInterval(update, carouselInterval); });
})(window);

$(function(){

                $('button').on('click', function(){
                    $.ajax({
                        url: '/send_to_phone',
                        type: 'POST',
                        data: {number: '2896840349'},
                        success: function(){
                            console.log(arguments);
                        }
                    });
                });
            });