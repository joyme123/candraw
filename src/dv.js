define(['./node','./config'],function(Node,DvConfig) {
    'use strict';
    var Dv = function(domId){
        this.dom = document.getElementById(domId);
        this.context = this.dom.getContext("2d");

        this.level = 0;      //标记当前指向节点的level
        this.levelList = []; //储存每一级level的node列表
        this.svgPath = "";   //svg path
        this.viewport = {
            x:0,
            y:0
        }
    }

    Dv.prototype.toLeftMost = function(startNode){
        var tmp = startNode;
        while(tmp.offspring != null){
            tmp = tmp.offspring;
            this.level++;
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

        this.levelList[this.level] = new Array();
        this.levelList[this.level].push(startNode);
        startNode.level = this.level;
        var node = this.toLeftMost(startNode);
        var prevNode = null;
        var leftNode = null;

        //倒序遍历还没有到起点
        while(node.parent != null){

            if((leftNode = node.leftSibling) == null){
                //最左边的点
                
                if(node.offspring != null){
                    //存在孩子
                    node.prelim = Math.ceil((node.offspring.prelim + prevNode.prelim) / 2);
                    node.modifier = 0;
                }else{
                    node.prelim = 0;
                    node.modifier = 0;
                }
            }else{
                //不是最左边的点
                if(node.offspring != null){
                    //存在孩子
                    node.prelim = leftNode.prelim + DvConfig.SiblingSeparation + leftNode.width;
                    node.modifier = node.prelim - Math.ceil((node.offspring.prelim + prevNode.prelim) / 2);
                }else{
                    //不存在孩子
                    node.prelim = leftNode.prelim + DvConfig.SiblingSeparation + leftNode.width;
                    node.modifier = 0;
                }
            }
            
            if(this.levelList[this.level] == undefined){
                this.levelList[this.level] = new Array();
            }

            this.levelList[this.level].push(node);
            node.level = this.level;

            if(node.rightSibling != null){
                 //move right,update prev node
                 prevNode = node;
                 node = this.toLeftMost(node.rightSibling);
            }else{
                 //move to parent,update prev node
                 prevNode = node;
                 node = node.parent;
                 this.level--;
            }
        }

        /**
         * TODO 这个地方的调整算法性能很低，需要做优化
         * 
         */
        //除了顶点已经全部更新了，接下来逐级上升来调整，检查是否有交叉的情况存在
        for(var i = this.levelList.length - 1; i >= 1; i--){
            for(var j = 0; j < this.levelList[i].length;j++){
                for(var k = j + 1; k < this.levelList[i].length;k++){
                    //j和k adjust
                    this.adjust(this.levelList[i][j],this.levelList[i][k]);
                }
            }
        }

        //最后更新startNode
        var offspringPrelim = 0;
        var prevPrelim = 0;
        if(startNode.offspring != null){
            offspringPrelim = startNode.offspring.prelim;
        }

        if(prevNode != null){
            prevPrelim = prevNode.prelim;
        }

        startNode.prelim = Math.ceil((offspringPrelim + prevPrelim) / 2);
        startNode.modifier = 0;

        //打印全部用来调试
        //this.print();
    }

    Dv.prototype.print = function(){
        for(var i = 0; i < this.levelList.length; i++){
            for(var j = 0; j < this.levelList[i].length;j++){
                this.printNode("节点：",this.levelList[i][j]);
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
        console.log("调整的左节点的右孩子",lNextLevelNodeRightMost,"x坐标",lx);
        console.log("调整的右节点的左孩子",rNextLevelNodeLeftMost,"x坐标",rx);
        var adjust = 0; //需要调整的距离

        if(rx - lx < DvConfig.SubtreeSeparation + lNode.width ){
            adjust = DvConfig.SubtreeSeparation + lNode.width - (rx - lx);
        }

        if(adjust != 0){

            //如果需要调整,就调整lNode和rNode同一祖先的下一级
            while(lNode.parent != null && rNode.parent != null && lNode.parent != rNode.parent){
                lNode = lNode.parent;
                rNode = rNode.parent;
            }
            console.log("调整的左节点",lNode.key,lNode,"调整的右节点",rNode.key,rNode,"调整的距离",adjust);
            var adjustLevel = rNode.level;
            

            var tmp = rNode;
            while(tmp != null){
                tmp.prelim += adjust;
                tmp.modifier += adjust;
                tmp = tmp.rightSibling;
            }

            //调整左边点和当前调整点之间的距离
            var lIndex = 0;
            for(var i = 0; i < this.levelList[adjustLevel].length && this.levelList[adjustLevel][i] != lNode;i++){
                lIndex = i;
            }
            lIndex += 2;
            var leftMostNode = this.levelList[adjustLevel][0];
            var tmp = leftMostNode;

            var count = 0;  //count是中间夹着的节点数
            for(var i = lIndex; i < this.levelList[adjustLevel].length && this.levelList[adjustLevel][i] != rNode;i++){
                count++;
            }


            if(count > 0){
                var middleAdjust = Math.ceil(adjust / (count + 1));
                for(var i = lIndex; i < this.levelList[adjustLevel].length && this.levelList[adjustLevel][i] != rNode;i++){
                    this.levelList[adjustLevel][i].prelim += middleAdjust;
                    this.levelList[adjustLevel][i].modifier += middleAdjust;       
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
     * 这里需要排除虚拟根节点，直接使用key == virtual的特点来排除
     */
    Dv.prototype.calculatePath = function(node){
        if(node == null){
            return;
        }

        if(node.parent != null && node.parent.key != "virtual"){
            //node有父节点
            var centerX = node.x+Math.ceil(node.nodeWidth / 2);
            var centerY = node.y - Math.ceil(DvConfig.LevelSeparation / 2);

            this.svgPath += "M " + centerX + " " + node.y + "L " + centerX + " " + centerY;
        }

        if(node.offspring != null){
            if(node.key != "virtual"){
                //node有子节点
                var centerX = node.x+Math.ceil(node.nodeWidth / 2);
                var centerY = node.y + node.nodeHeight + Math.ceil(DvConfig.LevelSeparation / 2);
                this.svgPath += "M " + centerX + " " + (node.y + node.nodeHeight) + "L " + centerX + " " + centerY;
                //父节点和子节点间的横线
                {
                    var leftMostNode = this.toNextLevelLeftMost(node);
                    var rightMostNode = this.toNextLevelRightMost(node);
                    var leftCoorX = leftMostNode.x +Math.ceil(leftMostNode.nodeWidth / 2);
                    var leftCoorY = leftMostNode.y - Math.ceil(DvConfig.LevelSeparation / 2);
                    var rightCoorX = rightMostNode.x + Math.ceil(rightMostNode.nodeWidth / 2);
                    var rightCoorY = rightMostNode.y - Math.ceil(DvConfig.LevelSeparation / 2);
                
                    this.svgPath += "M " + leftCoorX + " " + leftCoorY + "L " + rightCoorX + " " + rightCoorY;
                }
            }
            this.calculatePath(node.offspring);
        }

        while(node.rightSibling != null){
            node = node.rightSibling;
            if(node.parent.key != "virtual"){
                var centerX = node.x+Math.ceil(node.nodeWidth / 2);
                var centerY = node.y - Math.ceil(DvConfig.LevelSeparation / 2);
                this.svgPath += "M " + centerX + " " + node.y + "L " + centerX + " " + centerY;
            }
            if(node.offspring != null){
                //node有子节点

                if(node.key != "virtual"){
                    var centerX = node.x+Math.ceil(node.nodeWidth / 2);
                    var centerY = node.y + node.nodeHeight + Math.ceil(DvConfig.LevelSeparation / 2);
                    this.svgPath += "M " + centerX + " " + (node.y + node.nodeHeight) + "L " + centerX + " " + centerY;
                    //父节点和子节点间的横线
                    {
                        var leftMostNode = this.toNextLevelLeftMost(node);
                        var rightMostNode = this.toNextLevelRightMost(node);
                        var leftCoorX = leftMostNode.x +Math.ceil(leftMostNode.nodeWidth / 2);
                        var leftCoorY = leftMostNode.y  - Math.ceil(DvConfig.LevelSeparation / 2);
                        var rightCoorX = rightMostNode.x + Math.ceil(rightMostNode.nodeWidth / 2);
                        var rightCoorY = rightMostNode.y  - Math.ceil(DvConfig.LevelSeparation / 2);

                        this.svgPath += "M " + leftCoorX + " " + leftCoorY + "L " + rightCoorX + " " + rightCoorY;
                    }
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
        //设置虚拟startNode
        var virtualStartNode = new Node("virtual");
        var tmpStartNode = startNode;
        while(tmpStartNode.leftSibling != null){
            tmpStartNode = tmpStartNode.leftSibling;
        }
        virtualStartNode.offspring = tmpStartNode;
        while(tmpStartNode != null){
            tmpStartNode.parent = virtualStartNode;
            tmpStartNode = tmpStartNode.rightSibling;
        }
        
        //将虚拟起点设为起点
        startNode = virtualStartNode;
        this.postOrder(startNode);
        this.finishCal(startNode);
        
        this.repaint();
    }

    /**
     * 重新绘制，不会对节点进行计算
     */
    Dv.prototype.repaint = function(){
        //遍历levelList进行绘图
        for(var i = 0; i < this.levelList.length; i++){
            for(var j = 0; j < this.levelList[i].length;j++){
                if(this.levelList[i][j].key != "virtual"){
                    this.levelList[i][j].paint(this.context);
                }
            }
        }

        //画path
        var path = new Path2D(this.svgPath);
        this.context.stroke(path);
    }

    /**
     * 清空画布
     */
    Dv.prototype.clear = function(){
        this.context.clearRect(this.viewport.x,this.viewport.y,this.dom.width,this.dom.height);
    }

    Dv.prototype.destroy = function(){
        delete this;
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

        var touchStartEvent = function(event){
            x = event.touches[0].clientX;
            y = event.touches[0].clientY;
            self.dom.addEventListener('touchmove',touchMoveEvent);
        }

        var mouseMoveEvent = function(event){
            if(event.clientX != x && event.clientY != y){
                var xOffset = event.clientX - x;
                var yOffset = event.clientY - y;
                self.viewport.x -= xOffset;
                self.viewport.y -= yOffset;
                self.context.translate(xOffset,yOffset);
                self.clear();
                self.repaint();
                dragEvent();
                x = event.clientX;
                y = event.clientY;
            }
        }

        var touchMoveEvent = function(event){
            if(event.touches[0].clientX != x && event.touches[0].clientY != y){
                var xOffset = event.touches[0].clientX - x;
                var yOffset = event.touches[0].clientY - y;
                self.viewport.x -= xOffset;
                self.viewport.y -= yOffset;
                self.context.translate(xOffset,yOffset);
                self.context.clearRect(self.viewport.x,self.viewport.y,self.dom.width,self.dom.height);
                self.repaint();
                dragEvent();
                x = event.touches[0].clientX;
                y = event.touches[0].clientY;
            }
        }

        var mouseUpEvent = function(event){
            self.dom.removeEventListener("mousemove",mouseMoveEvent);
        }

        var touchEndEvent = function(event){
             self.dom.removeEventListener("touchmove",touchMoveEvent);
        }

        var mouseOutEvent = function(event){
            self.dom.removeEventListener("mousemove",mouseMoveEvent);
        }

        var touchCancelEvent = function(event){
            self.dom.removeEventListener("touchmove",touchMoveEvent);
        }

        if(isDraggable){
            //对于鼠标操作的拖动方法
            this.dom.addEventListener('mousedown',mouseDownEvent);
            this.dom.addEventListener('mouseup',mouseUpEvent);
            this.dom.addEventListener('mouseout',mouseOutEvent);
            this.dom.addEventListener('touchstart',touchStartEvent);
            this.dom.addEventListener('touchend',touchEndEvent);
            this.dom.addEventListener('touchcancel',touchCancelEvent);
            
        }else{
            this.dom.removeEventListener("mousedown",mouseDownEvent);
            this.dom.removeEventListener('mouseup',mouseUpEvent);
            this.dom.removeEventListener('mouseout',mouseOutEvent);
            this.dom.removeEventListener('touchstart',touchStartEvent);
            this.dom.removeEventListener('touchend',touchEndEvent);
            this.dom.removeEventListener('touchcancel',touchCancelEvent);
        }
    }

    return Dv;
});