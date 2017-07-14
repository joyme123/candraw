define(function() {
    'use strict';
    
    var DVConfig = function(){
        this.horizonOffset = 40;
        this.verticalOffset = 60;
    }

    DVConfig.prototype = {
        getHorizonOffset:function(){
            return this.horizonOffset;
        },

        getVerticalOffset:function(){
            return this.verticalOffset;
        }
    }

    return DVConfig;
});