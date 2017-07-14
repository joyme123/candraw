define(['./ItemStyle'],function(ItemStyle) {
    'use strict';
    


    var Item = function(){
        this.style = new ItemStyle();
        this.siblings = new Array();
        this.parents = new Array();
        this.children = new Array();
        this.x = 0;
        this.y = 0;
        this.text = "";
        this.level = 0;
        //this.key = 0;       //根据key可以对同级的item进行排序
    }

    Item.prototype = {

        getStyle:function(){
            return this.style;
        },

        addParent:function(parent){
            this.parents.push(parent);
        },

        addSibling:function(sibling){
            this.siblings.push(sibling);
        },

        addChild:function(child){
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
        },

        setPosition:function(x,y){
            this.x = x;
            this.y = y;
        },

        getX:function(){
            return this.x;
        },

        getY:function(){
            return this.y;
        },

        setText:function(text){
            this.text = text;
        },

        getText:function(){
            return this.text;
        },

        setLevel:function(level){
            this.level = level;
        },

        getLevel:function(){
            return this.level;
        },

        setKey:function(key){
            this.key = key;
        },

        getKey:function(){
            return this.key;
        }

    }

    

    return Item;
});