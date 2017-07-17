define(['./node','./config'],function(Node,DvConfig) {
    'use strict';
    var Dv = function(domId){
        this.dom = document.getElementById(domId);
        this.context = this.dom.getContext("2d");
        this.context.save();
        this.viewport = {
            x:0,
            y:0
        }
    }

    var level = 0;      //标记当前指向节点的level
    var levelList = []; //储存每一级level的node列表
    var svgPath = "";   //svg path

    Dv.prototype.toLeftMost = function(startNode){
        var tmp = startNode;
        while(tmp.offspring != null){
            tmp = tmp.offspring;
            level++;
        }

        return tmp;
    }

    Dv.prototype.toRightMost = function(startNode){
        var tmp = startNode;
        while(tmp.offspring != null){
            tmp = tmp.offspring;
            while(tmp.rightSibling != null){
                tmp = tmp.rightSibling;
            }
        }
        return tmp;
    }

    Dv.prototype.toNextLevelLeftMost = function(startNode){
        var tmp = Object.assign({},startNode.offspring);
        
        return tmp;
    }


    Dv.prototype.toNextLevelRightMost = function(startNode){
        var tmp = startNode.offspring;
        if(tmp != null){
            while(tmp.rightSibling != null){
                tmp = tmp.rightSibling;
            }
        }

        return tmp;
    }

    //倒序遍历
    Dv.prototype.postOrder = function (startNode){
        levelList[level] = new Array();
        levelList[level].push(startNode);
        startNode.level = level;
        var node = this.toLeftMost(startNode);
        var prevNode = null;
        var leftNode = null;

        //倒序遍历还没有到起点
        while(node.parent != null){

            if((leftNode = node.leftSibling) == null){
                //最左边的点
                
                if(node.offspring != null){
                    //存在孩子
                    node.prelim = (node.offspring.prelim + prevNode.prelim) / 2;
                    node.modifier = 0;
                }else{
                    node.prelim = 0;
                    node.modifier = 0;
                }
            }else{
                //不是最左边的点
                if(node.offspring != null){
                    //存在孩子
                    node.prelim = leftNode.prelim + DvConfig.SiblingSeparation + (leftNode.width + node.width) / 2;
                    node.modifier = node.prelim - (node.offspring.prelim + prevNode.prelim) / 2;
                }else{
                    //不存在孩子
                    node.prelim = leftNode.prelim + DvConfig.SiblingSeparation + (leftNode.width + node.width) / 2;
                    node.modifier = 0;
                }
            }
            
            if(levelList[level] == undefined){
                levelList[level] = new Array();
            }

            levelList[level].push(node);
            node.level = level;

            if(node.rightSibling != null){
                 //move right,update prev node
                 prevNode = node;
                 node = this.toLeftMost(node.rightSibling);
            }else{
                 //move to parent,update prev node
                 prevNode = node;
                 node = node.parent;
                 level--;
            }
        }

        //除了顶点已经全部更新了，接下来逐级下降，检查是否有交叉的情况存在
        for(var i = 1; i < levelList.length; i++){
            for(var j = 0; j < levelList[i].length;j++){
                for(var k = j + 1; k < levelList[i].length;k++){
                    //j和k adjust
                    this.adjust(levelList[i][j],levelList[i][k]);
                }
            }
        }

        //最后更新startNode
        startNode.prelim = (startNode.offspring.prelim + prevNode.prelim) / 2;
        startNode.modifier = 0;

        //打印全部用来调试
        //this.print();
    }

    Dv.prototype.print = function(){
        for(var i = 0; i < levelList.length; i++){
            for(var j = 0; j < levelList[i].length;j++){
                this.printNode("节点：",levelList[i][j]);
            }
        }
    }

    Dv.prototype.printNode = function(text,node){
        console.log(text,node.key,node);
    }

    Dv.prototype.getX = function(node){
        var modifier = 0;
        var tmp = node;
        while(tmp.parent != null){
            tmp = tmp.parent;
            modifier += tmp.modifier;
        }

        return node.prelim + modifier;
    }

    Dv.prototype.adjust = function(lNode,rNode){
        if(lNode.offspring == null || rNode.offspring == null){
            return;
        }

        var lNextLevelNodeRightMost = this.toNextLevelRightMost(lNode)
        var rNextLevelNodeLeftMost = this.toNextLevelLeftMost(rNode);

        var lx = this.getX(lNextLevelNodeRightMost);
        var rx = this.getX(rNextLevelNodeLeftMost);

        var adjust = 0; //需要调整的距离

        if(rx - lx < DvConfig.SubtreeSeparation + (lNode.width + rNode.width) / 2){
            adjust = DvConfig.SubtreeSeparation + (lNode.width + rNode.width) / 2 - (rx - lx);
        }

        if(adjust != 0){
            //如果需要调整,就对level 1的节点进行调整
            while(rNode.parent.parent != null){
                rNode = rNode.parent;
            }
            rNode.prelim += adjust;
            rNode.modifier += adjust;

            //调整最左边和当前调整点之间的距离
            var leftMostNode = levelList[1][0];
            var tmp = leftMostNode;
            var count = 0;  //count是中间夹着的节点数
            for(var i = 1; i < levelList[1].length && levelList[1][i] != rNode;i++){
                count++;
            }


            if(count > 0){
                var middleAdjust = adjust / (count + 1);
                for(var i = 1; i < levelList[1].length && levelList[1][i] != rNode;i++){
                    levelList[1][i].prelim += middleAdjust;
                    levelList[1][i].modifier += middleAdjust;       
                }
            }
        }
    }

    /**
     * 遍历计算节点的x,y
     */
    Dv.prototype.calculate = function(node,modifierSum){
        if(node == null){
            return;
        }
        node.x = node.prelim + modifierSum;
        node.y = node.level * (DvConfig.LevelSeparation + node.height);

        if(node.offspring != null){
            this.calculate(node.offspring,modifierSum+node.modifier);
        }

        while(node.rightSibling != null){
            node = node.rightSibling;
            node.x = node.prelim + modifierSum;
            node.y = node.level * (DvConfig.LevelSeparation + node.height);
            if(node.offspring != null){
                this.calculate(node.offspring,modifierSum+node.modifier);
            }
        }
    }

    /**
     * 计算应该绘制的路径
     */
    Dv.prototype.calculatePath = function(node){
        if(node == null){
            return;
        }

        if(node.parent != null){
            //node有父节点
            var centerX = node.x+(node.width / 2);
            var centerY = (node.y - DvConfig.LevelSeparation / 2);

            svgPath += "M " + centerX + " " + node.y + "L " + centerX + " " + centerY;
        }

        if(node.offspring != null){
            //node有子节点
            var centerX = node.x+(node.width / 2);
            var centerY = (node.y + node.height + DvConfig.LevelSeparation / 2);
            svgPath += "M " + centerX + " " + (node.y + node.height) + "L " + centerX + " " + centerY;
            //父节点和子节点间的横线
            {
                var leftMostNode = this.toNextLevelLeftMost(node);
                var rightMostNode = this.toNextLevelRightMost(node);
                var leftCoorX = leftMostNode.x +(leftMostNode.width / 2);
                var leftCoorY = leftMostNode.y - DvConfig.LevelSeparation / 2;
                var rightCoorX = rightMostNode.x + (rightMostNode.width / 2);
                var rightCoorY = rightMostNode.y - DvConfig.LevelSeparation / 2;
               
                svgPath += "M " + leftCoorX + " " + leftCoorY + "L " + rightCoorX + " " + rightCoorY;
            }
            this.calculatePath(node.offspring);
        }

        while(node.rightSibling != null){
            node = node.rightSibling;
            var centerX = node.x+(node.width / 2);
            var centerY = (node.y - DvConfig.LevelSeparation / 2);
            svgPath += "M " + centerX + " " + node.y + "L " + centerX + " " + centerY;
            if(node.offspring != null){
                //node有子节点
                var centerX = node.x+(node.width / 2);
                var centerY = (node.y + node.height + DvConfig.LevelSeparation / 2);
                svgPath += "M " + centerX + " " + (node.y + node.height) + "L " + centerX + " " + centerY;
                //父节点和子节点间的横线
                {
                    var leftMostNode = this.toNextLevelLeftMost(node);
                    var rightMostNode = this.toNextLevelRightMost(node);
                    var leftCoorX = leftMostNode.x +(leftMostNode.width / 2);
                    var leftCoorY = leftMostNode.y  - DvConfig.LevelSeparation / 2;
                    var rightCoorX = rightMostNode.x + (rightMostNode.width / 2);
                    var rightCoorY = rightMostNode.y  - DvConfig.LevelSeparation / 2;

                    svgPath += "M " + leftCoorX + " " + leftCoorY + "L " + rightCoorX + " " + rightCoorY;
                }
                this.calculatePath(node.offspring);
            }
        }
    }

    //最后一次遍历扫描
    Dv.prototype.finishCal = function(node){
        this.calculate(node,0);
        this.calculatePath(node);
    }

    //前序遍历
    Dv.prototype.preOrder = function(){

    }

    /**
     * 绘制，会对节点进行计算
     */
    Dv.prototype.paint = function(startNode){
        this.postOrder(startNode);
        this.finishCal(startNode);
        //遍历levelList进行绘图
        for(var i = 0; i < levelList.length; i++){
            for(var j = 0; j < levelList[i].length;j++){
                this.context.strokeRect(levelList[i][j].x,levelList[i][j].y,levelList[i][j].width,levelList[i][j].height);
                this.context.fillText(levelList[i][j].key,levelList[i][j].x,levelList[i][j].y);
            }
        }

        //画path
        var path = new Path2D(svgPath);
        this.context.stroke(path);
    }

    /**
     * 重新绘制，不会对节点进行计算
     */
    Dv.prototype.repaint = function(){
        //遍历levelList进行绘图
        for(var i = 0; i < levelList.length; i++){
            for(var j = 0; j < levelList[i].length;j++){
                this.context.strokeRect(levelList[i][j].x,levelList[i][j].y,levelList[i][j].width,levelList[i][j].height);
                this.context.fillText(levelList[i][j].key,levelList[i][j].x,levelList[i][j].y);
            }
        }

        //画path
        var path = new Path2D(svgPath);
        this.context.stroke(path);
    }

    /**
     * 设置画布是否拖动(触摸屏的拖动事件)
     */
    Dv.prototype.setDraggable = function(isDraggable,dragEvent){

        dragEvent = typeof dragEvent  === 'undefined' ? function(){} : dragEvent;

        var x = 0;
        var y = 0;
        var self = this;

        var mouseDownEvent = function(event){
            x = event.clientX;
            y = event.clientY;
            self.dom.addEventListener('mousemove',mouseMoveEvent);
        }

        var mouseMoveEvent = function(event){
            if(event.clientX != x && event.clientY != y){
                var xOffset = event.clientX - x;
                var yOffset = event.clientY - y;
                self.viewport.x -= xOffset;
                self.viewport.y -= yOffset;
                self.context.translate(xOffset,yOffset);
                self.context.clearRect(self.viewport.x,self.viewport.y,self.dom.width,self.dom.height);
                self.repaint();
                dragEvent();
                x = event.clientX;
                y = event.clientY;
            }
        }

        var mouseUpEvent = function(event){
            self.dom.removeEventListener("mousemove",mouseMoveEvent);
        }

        if(isDraggable){
            //对于鼠标操作的拖动方法
            this.dom.addEventListener('mousedown',mouseDownEvent);
            this.dom.addEventListener('mouseup',mouseUpEvent);
        }else{
            this.dom.removeEventListener("drag",dragEvent);
        }
    }

    return Dv;
});