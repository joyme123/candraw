define(function() {
    'use strict';
    
    var ItemStyle = function(){

    }
    
    ItemStyle.prototype = {
        width:80,
        height:100,
        backgroundColor:'blue',

        setWidth:function(width){
            this.width = width;
        },

        setHeight:function(height){
            this.height = height;
        },

        setBackgroundColor:function(color){
            this.color = color;
        },

        getWidth:function(){
            return this.width;
        },

        getHeight:function(){
            return this.height;
        },

        getBackgroundColor:function(){
            return this.backgroundColor;
        }
        
    }

    return ItemStyle;

});