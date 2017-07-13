define(function() {
    'use strict';
    


    var Item = function(){
        this.style = new ItemStyle();
    }

    Item.prototype = {
        config:{},
        parents:[],
        siblings:[],
        children:[],

        getStyle:function(){
            return this.style;
        },

        addParent:function(parent){
            if(this.parents == undefined){
                this.parents = new Array();
            }

            this.parents.push(parent);
        },

        addSibling:function(sibling){
            if(this.siblings == undefined){
                this.siblings = new Array();
                
            }

            this.siblings.push(sibling);
        },

        addChild:function(child){
            if(this.children == null){
                this.children = new Array();
            }

            this.children.push(child);
        },

        getParents:function(){
            return this.parents;
        },

        getSiblings:function(){
            return this.siblings;
        },

        getChildren:function(){
            return this.children;
        }

    }

    var ItemStyle = function(){

    }
    
    ItemStyle.prototype = {
        width:80,
        height:100,
        backgroundColor:'blue',
        this:this,

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

    return Item;
});