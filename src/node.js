define(['./config'],function(DvConfig) {
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
        this.nodeWidth = 60;
        this.nodeHeight = 80;
        this.x = 0;
        this.y = 0;
        this.spouses = [];
    };

    //添加配偶节点
    Node.prototype.addSpouse = function(node){
        //更新当前节点的宽度
        this.width += node.nodeWidth + DvConfig.SpouseSeparation;
        this.spouses.push(node);
    }

    Node.prototype.paintNode = function(context,node){
        context.strokeRect(node.x,node.y,node.nodeWidth,node.nodeHeight);
        context.fillText(node.key,node.x,node.y);
        
        //调试使用
        context.fillText(node.x,node.x,node.y+20);
    }

    //当前节点的绘制
    Node.prototype.paint = function(context){
        this.paintNode(context,this);
        if(this.spouses.length != 0){
            var node = this;
            var self = this;    //uglifyjs对es6的标准支持的还不是很好，这里不能使用箭头函数
            //有配偶则要将配偶画上
            this.spouses.forEach(function(spouse) {
                var leftX = node.x + node.nodeWidth;
                var leftY = node.y + (node.nodeHeight / 2);
                var rightX = leftX + DvConfig.SpouseSeparation;
                var rightY = leftY;
                var path = new Path2D("M " + leftX + " " + leftY + " L " + rightX + " " + rightY);
                context.stroke(path);

                spouse.x = rightX;
                spouse.y = node.y;
                self.paintNode(context,spouse);

                node = spouse;
            })
        }
        
    }

    return Node;

});