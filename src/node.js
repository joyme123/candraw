define(function() {
    'use strict';
    
    var Node = function(key){
        this.key = key;
        this.parent = null;
        this.offspring = null;
        this.leftSibling = null;
        this.rightSibling = null;
        this.prelim = 0;
        this.modifier = 0;
        this.level = 0;
        this.width = 60;
        this.height = 80;
        this.x = 0;
        this.y = 0;
    };

    Node.prototype = {

    }

    return Node;

});