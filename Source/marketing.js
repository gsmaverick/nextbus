/*! http://mths.be/placeholder v2.0.7 by @mathias */
;(function(f,h,$){var a='placeholder' in h.createElement('input'),d='placeholder' in h.createElement('textarea'),i=$.fn,c=$.valHooks,k,j;if(a&&d){j=i.placeholder=function(){return this};j.input=j.textarea=true}else{j=i.placeholder=function(){var l=this;l.filter((a?'textarea':':input')+'[placeholder]').not('.placeholder').bind({'focus.placeholder':b,'blur.placeholder':e}).data('placeholder-enabled',true).trigger('blur.placeholder');return l};j.input=a;j.textarea=d;k={get:function(m){var l=$(m);return l.data('placeholder-enabled')&&l.hasClass('placeholder')?'':m.value},set:function(m,n){var l=$(m);if(!l.data('placeholder-enabled')){return m.value=n}if(n==''){m.value=n;if(m!=h.activeElement){e.call(m)}}else{if(l.hasClass('placeholder')){b.call(m,true,n)||(m.value=n)}else{m.value=n}}return l}};a||(c.input=k);d||(c.textarea=k);$(function(){$(h).delegate('form','submit.placeholder',function(){var l=$('.placeholder',this).each(b);setTimeout(function(){l.each(e)},10)})});$(f).bind('beforeunload.placeholder',function(){$('.placeholder').each(function(){this.value=''})})}function g(m){var l={},n=/^jQuery\d+$/;$.each(m.attributes,function(p,o){if(o.specified&&!n.test(o.name)){l[o.name]=o.value}});return l}function b(m,n){var l=this,o=$(l);if(l.value==o.attr('placeholder')&&o.hasClass('placeholder')){if(o.data('placeholder-password')){o=o.hide().next().show().attr('id',o.removeAttr('id').data('placeholder-id'));if(m===true){return o[0].value=n}o.focus()}else{l.value='';o.removeClass('placeholder');l==h.activeElement&&l.select()}}}function e(){var q,l=this,p=$(l),m=p,o=this.id;if(l.value==''){if(l.type=='password'){if(!p.data('placeholder-textinput')){try{q=p.clone().attr({type:'text'})}catch(n){q=$('<input>').attr($.extend(g(this),{type:'text'}))}q.removeAttr('name').data({'placeholder-password':true,'placeholder-id':o}).bind('focus.placeholder',b);p.data({'placeholder-textinput':q,'placeholder-id':o}).before(q)}p=p.removeAttr('id').hide().prev().attr('id',o).show()}p.addClass('placeholder');p[0].value=p.attr('placeholder')}else{p.removeClass('placeholder')}}}(this,document,jQuery));

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


(function(){
    // Scripting to activate the send to phone button on the landing page.
    "use strict";

    var reqInProgress = false;

    // HTML5 placeholder attribute polyfill.
    $(function(){ $('.send-to-phone input').placeholder(); });

    var ajaxSuccess = function(resp){
        reqInProgress = false;

        var input = $('.send-to-phone input');

        if (resp.status === 'success') input.val('');
        input.prop('disabled', '');

        alert(resp.text);
    };

    var ajaxError = function(){
        reqInProgress = false;

        $('.send-to-phone input').prop('disabled', '');

        alert('Could not send link to phone.  Please try again.');
    };

    $('.send-to-phone button').on('click', function(){
        // Check if another request is in progress if so don't send another one.
        if (reqInProgress) return;
        reqInProgress = true;

        var input = $('.send-to-phone input'),
            number = input.val().trim();

        input.prop('disabled', 'disabled');

        if (number.length === 0){
            alert('No phone number provided.');
            return;
        }

        $.ajax({
            data: {'number': number},
            dataType: 'json',
            success: ajaxSuccess,
            error: ajaxError,
            type: 'POST',
            url: '/send_to_phone'
        });
    });
})();