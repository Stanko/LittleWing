// jQuery Little Wing plugin
// Author: Stanko Tadic
// stanko.tadic {at} gmail.com

var cycleTimeout;

(function($){
    var methods = {
        init : function(options) {
            var defaults = {
                fadeTime : 800, // time used for fading images
                useButtons : true, // if you want to use navigation buttons set this to true
                nextButton : '.nextBackground', // selector for the next button
                previousButton : '.previousBackground', // selector for the previous button
                loadingElement : '.littleWingLoading', // selector for loader element
                cycleImages : true, // should images cycles automatically
                cycleTime : 5000 // cycle timeout
            }
            var options =  $.extend(defaults, options);

            return this.each(function(){
                var element = $(this);
                var data = element.data('littleWing');

                // If the plugin hasn't been initialized yet
                if(!data){
                    var imagesLinkArray = $(this).find('a');
                    var images = new Array();
                    var imagesElements = new Array();
                    var fadingInProgress = false;
                    
                    imagesLinkArray.each(function(){
                        images.push($(this).attr('href'));
                    });
                    
                    $(this).addClass('littleWingInitiated');
                    $(this).append('<div class="littleWingImages"></div>');
                    
                    $(this).data('littleWing', {
                        target : element,
                        initiated : true,
                        imagesDiv : element.find('.littleWingImages'),
                        imageCount : images.length,
                        currentImage : 1,
                        previousButton : options.previousButton,
                        nextButton : options.nextButton
                    });
                    
                    
                    
                    data = element.data('littleWing');
                    
                    var loadedImages = 0;
                    var imageCount = data.imageCount;
                    var imagesAlreadyLoaded = true;
                    
                    showLoader();
                    
                    // If cycle is set, but there is only one image
                    if(options.cycleImages && images.length <= 1){
                        options.cycleImages = false;
                    }
                    
                    imagesElements[0] = $('<img />')
                        .attr('src', images[0])
                        .load(function(){
                            showFirst();
                        });
                        
                    for(var i=1; i<images.length; i++){
                        imagesElements[i] = $('<img />')
                        .attr('src', images[i])
                        .load(function(){
                            if(++loadedImages==(imageCount-1)){
                                for(var j=1; j<images.length; j++){
                                    data.imagesDiv.append(imagesElements[j]);
                                }
                                hideLoader();
                                if(options.cycleImages){
                                    setCycle();
                                }
                            }
                        });
                    }

                    // On window resize adjust image sizes
                    $(window).bind('resize', function(){
                        $('.littleWingImages img').each(function(){
                            adjustImageSize($(this));
                        });
                    });
                                        
                    if(options.cycleImages){
                        // Removes cycle timeout on window blur to prevent timeout "stacking"
                        $(window).bind('blur', function(){
                            clearTimeout(cycleTimeout);
                        });
                        
                        // Adds cycle timeout again when user returns to page
                        $(window).focus('focus', function(){
                            setCycle();
                        });
                    }
                    // If use buttons is set, binds the events on button clicks
                    if(options.useButtons){
                        $(options.nextButton).bind('click', function(){
                            changeToNextImage();
                            return false;
                        });
                        $(options.previousButton).bind('click', function(){
                            changeToPreviousImage();
                            return false;
                        });
                    }
                }
                else{
                    if(data.initiated){
                        //console.log('Already initiated')
                        return false;
                    }
                }
                
                /****************************
                 *        FUNCTIONS
                 ****************************/   
                
                // Initially show first image
                function showFirst(){
                    //images.first().fadeIn(options.fadeTime);
                    data.imagesDiv.append(imagesElements[0]);
                    var image = data.imagesDiv.find('img:first-child');
                    adjustImageSize(image);
                    image.fadeIn(options.fadeTime);
                }
                
                // Adjusts image size depenging of window size
                function adjustImageSize(image){
                    var windowWidth	= $(window).width();
                    var windowHeight = $(window).height();
                    var windowRatio	= windowHeight / windowWidth;
                    var imageWidth	= image.width();
                    var imageHeight	= image.height()
                    var imageRatio	= imageHeight / imageWidth;
                    var newWidth, newHeight, newLeft, newTop;
                
                    if(windowRatio > imageRatio){
                        newHeight	= windowHeight;
                        newWidth	= windowHeight / imageRatio;
                    }
                    else{
                        newHeight	= windowWidth * imageRatio;
                        newWidth	= windowWidth;
                    }
                    
                    newTop = (windowHeight - newHeight) / 2 + 'px'
                    newLeft = (windowWidth - newWidth) / 2 + 'px';
                
                    image.css({
                        width	: newWidth + 'px',
                        height	: newHeight + 'px',
                        left	: newLeft,
                        top		: newTop
                    });
                }
                
                // Sets timeout for cycling images
                function setCycle(){
                    clearTimeout(cycleTimeout);
                    cycleTimeout = setTimeout(function(){changeToNextImage()}, options.cycleTime);
                }
                
                // Shows next image
                function changeToNextImage(){
                    var nextImage = data.currentImage+1;
                    if(nextImage>data.imageCount){
                        nextImage = 1;
                    }
                    changeToImage(nextImage);
                }
                
                // Shows previous image
                function changeToPreviousImage(){
                    var previousImage = data.currentImage-1;
                    if(previousImage==0){
                        previousImage = data.imageCount;
                    }
                    changeToImage(previousImage);
                }
                
                // Shows given image element
                function changeToImage(image){
                    if(fadingInProgress){
                        return false;
                    }
                    fadingInProgress = true;
                    
                    var oldImg = data.imagesDiv.find('img:nth-child('+data.currentImage+')');
                    var newImg = data.imagesDiv.find('img:nth-child('+image+')');
                    
                    if(options.cycleImages){
                        setCycle();
                    }
                    
                    adjustImageSize(newImg);
                    oldImg.fadeOut(options.fadeTime);
                    newImg.fadeIn(options.fadeTime, function(){fadingInProgress = false;});
                    data.currentImage = image;
                }
                
                // Shows lodaer
                function showLoader(){
                    $(options.loadingElement).fadeIn();
                }
                function hideLoader(){
                    $(options.loadingElement).fadeOut();
                }
            });
        },
        destroy : function(){
            return this.each(function(){
                var element = $(this);
                var data = element.data('littleWing');
                // If the plugin hasn't been initiated yet
                if(!data){
                    //console.log('Not initiated')
                    return false;
                }
                
                $(data.previousButton).unbind('click');
                $(data.nextButton).unbind('click');
                $(window).unbind('resize');
                $(window).unbind('focus');
                $(window).unbind('blur');
                
                element.removeData('littleWing');
                element.find('img').fadeOut();
                data.imagesDiv.remove();
                clearTimeout(cycleTimeout);
            });
        }
    };

    $.fn.littleWing = function( method ) {
        if ( methods[method] ) {
            return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
        }
        else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        }
        else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.littleWing' );
        }
    };
})( jQuery );