define(['../core/item'],function(item) {
    'use strict';

    var dv = {};
    dv.init = function(context2D){
            return new Dv(context2D);
    }

    var Dv = function(context2D){
        this.ctx = context2D;
        this.level = 0; //树的级数,初始为0，向上-1，向下+1
    }


    Dv.prototype = {
        
        ctx:null,
        items:[],  
        level:0,  
        /**
         * 添加节点
         */
        addItem:function(item){
            if(this.items == undefined){
                this.items = new Array();
            }
            this.items.push(item);
        },


        paintItem:function(item,currentLevel){
            console.log(currentLevel * 10);
            this.ctx.strokeRect(0,currentLevel * 10,item.style.getWidth(),item.style.getHeight());
        },

        paintItems:function(items){
            //从items中依次出栈画图
            
            for(var i = 0; i < items.length; ++i){
                var paintingItem = items[i];
                console.log("正在绘制的item",paintingItem);
                this.paintItem(paintingItem);

                this.paintItems(paintingItem.getSiblings(),this.level);
                this.paintItems(paintingItem.getParents(),this.level--);
                this.paintItems(paintingItem.getChildren(),this.level++);

            }
        },

        /**
         * 绘制
         */
        paint:function(){
            //绘制的过程其实就是一个遍历树的过程
            this.paintItems(this.items);
            
        }

    }

    return dv;
});