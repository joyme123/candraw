define(['./item','./config'],function(Item,DVConfig) {
    'use strict';

    var dv = {};
    var dvConfig = new DVConfig();

    dv.init = function(context2D){
        return new Dv(context2D);
    }

    var Dv = function(context2D){
        this.ctx = context2D;
        this.ctx.globalCompositeOperation = "darken";

        this.level = 0;             //树的级数,初始为0，向上-1，向下+1
        this.maxLevel = 0;          //最大的等级
        this.minLevel = 0;          //最小的等级
        this.maxWidth = 0;          //最大的宽度
        this.levelMap = {};         //等级和宽度的map
        this.items = new Array();   //绘制的item数组
        this.path = new Array();    //路径的绘制
    }


    Dv.prototype = {
        /**
         * 添加节点
         */
        addItem:function(item){
            this.items.push(item);
        },

        /**
         * 更新等级
         */
        updateLevel:function(currentLevel){

            if(currentLevel > this.maxLevel){
                this.maxLevel = currentLevel;
            }

            if(currentLevel < this.minLevel){
                this.minLevel = currentLevel;
            }
        },

        /**
         * 单个节点的计算
         * @param currentItem 当前计算的节点
         * @param currentItem 当前计算的节点的层次
         * @param center      在衍生到父母或者子女时，画图的中心要根据center确定
         */
        compute:function(currentItem,currentLevel,center){
            if(this.levelMap[currentLevel] == undefined){
                this.levelMap[currentLevel] = {
                    'width':0,
                    'left':0,
                    'right':0
                };
            }

            var extraOffset = 0;

            if(center != null){
                extraOffset = center;
            }

            //更新DV的level
            this.updateLevel(currentLevel);

            currentItem.setLevel(currentLevel);

            var x = 0;

            if(this.levelMap[currentLevel]['left'] == 0){
                //起点，画在-width/2,0处
                x = this.levelMap[currentLevel]['left']
                            + currentItem.getStyle().getWidth() / 2 - extraOffset;

                currentItem.setPosition(
                    -x,
                    currentLevel * (currentItem.getStyle().getHeight() + dvConfig.verticalOffset)
                );

                this.levelMap[currentLevel]['left'] = (x + dvConfig.horizonOffset);

            }else if(this.levelMap[currentLevel]['left'] <= this.levelMap[currentLevel]['right']){
                //画在左边
                x = this.levelMap[currentLevel]['left']
                            + currentItem.getStyle().getWidth()  - extraOffset;

                currentItem.setPosition(
                    -x,
                    currentLevel * (currentItem.getStyle().getHeight() + dvConfig.verticalOffset)
                );

                this.levelMap[currentLevel]['left'] = (x + dvConfig.horizonOffset);
            }else{
                //画在右边
                x = this.levelMap[currentLevel]['right']
                            + currentItem.getStyle().getWidth()  + extraOffset;

                currentItem.setPosition(
                    x,
                    currentLevel * (currentItem.getStyle().getHeight() + dvConfig.verticalOffset)
                );

                this.levelMap[currentLevel]['right'] = (x + dvConfig.horizonOffset);
            }


            this.levelMap[currentLevel]['width'] += currentItem.getStyle().getWidth() + dvConfig.horizonOffset;

            //更新整个图的最大宽度
            if(this.levelMap[currentLevel]['width'] > this.maxWidth){
                this.maxWidth  = this.levelMap[currentLevel]['width'];
            }
        },

        /**
         * 计算，先遍历一遍树，将所有节点应该放置的位置计算好
         */
        computeItems:function(currentItems,currentLevel,center){
            for(var i = 0; i < currentItems.length; ++i){
                var currentItem = currentItems[i];

                this.compute(currentItem,currentLevel,center);

                this.computeItems(currentItem.getChildren(),currentLevel+1,currentItem.getX());
                this.computeItems(currentItem.getParents(),currentLevel-1,currentItem.getX());
                this.computeItems(currentItem.getSiblings(),currentLevel,null);
            }
        },

        /**
         * 绘制canvas的中心(已经计算过偏移量了)
         */
        paintCenter:function(){
            this.ctx.fillRect(0,0,10,10);
        },

        /**
         * 单个item的绘制
         */
        paintItem:function(item){
            //获取item所在层的宽度
            var levelWidth = this.levelMap[item.getLevel()]['width'];
            
            console.log("等级宽度",levelWidth);

            this.ctx.strokeRect(item.getX(),item.getY(),item.style.getWidth(),item.style.getHeight());
            this.ctx.fillText(item.getText(),item.getX(),item.getY());
            console.log(item.getText());
        },

        /**
         * 递归
         */
        paintItems:function(currentItems){
            //从items中依次出栈画图
            
            for(var i = 0; i < currentItems.length; ++i){
                var paintingItem = currentItems[i];
                console.log("正在绘制的item",paintingItem);
                console.log("level是:",paintingItem.getLevel());
                this.paintItem(paintingItem);

                this.paintItems(paintingItem.getSiblings());
                this.paintItems(paintingItem.getParents());
                this.paintItems(paintingItem.getChildren());

            }
        },

        /**
         * 开始绘制
         */
        paint:function(){
            this.computeItems(this.items,this.level,null);
            //整个画布进行偏移
            this.ctx.translate(this.maxWidth / 2,180);
            //绘制的过程其实就是一个遍历树的过程
            this.paintItems(this.items,this.level);
            
            this.paintCenter();
        }

    }

    return dv;
});