define(function() {
    'use strict';
    
    var Node = function(key){
        this.key = key;
    };

    Node.prototype = {
        parent:null,
        offspring:null,
        leftSibling:null,
        rightSibling:null,
        prelim:0,
        modifier:0,
        level:0,
        width:20,
        height:30,
        x:0,
        y:0,
        key:'',
    }

    return Node;

});