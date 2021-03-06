 var imgs=["images/d1.jpg","images/d2.jpg","images/d3.jpg","images/d4.jpg","images/d5.jpg",
        "images/m1.jpg","images/m3.jpg","images/m4.jpg","images/p1.jpg","images/p2.jpg","images/p30.jpg",
        "images/p4.jpg","images/p5.jpg","images/p6.jpg"];
    var Block=function(row,col){
        this.col=col;
        this.row=row;
        this.size=50;
        this.dom=$("<div></div>");
    }
    /** 初始化游戏方块的图像 **/
    Block.prototype.init=function(){
        var rp=Math.floor(Math.random()*imgs.length);
        this.ranImage=imgs[rp];
    }

    /* 显示游戏方块 */
    Block.prototype.create=function(){
        var img_="<img src='"+this.ranImage+"' width='"+this.size+"' height='"+this.size+"'/>";
        this.dom.html(img_);  //dom是<div>元素，为<div>追加内容为<img .../>
        this.dom.css({ "position":"absolute",
            "width":this.size,
            "height":this.size,
            "left":300+this.col*this.size,
            "top":5+this.row*this.size });
        $("body").append(this.dom);  //把dom加到页面中
    }
    /** 擦除方块上的图片（当连续点击的两个方块能用3条以为的直线相连时，就把它们擦除掉）**/
    Block.prototype.erase=function(){
        this.dom.empty();  //清空dom,也就是<div>的<img>孩子
        var cav_="<canvas width='"+this.size+"' height='"+this.size+"'></canvas>";
        this.dom.html(cav_); //为清空的dom加个画布，为了画线。（擦除图片时要画线）
        this.ranImage="";
    }
    Block.prototype.edgeErase=function(){
        this.dom.empty();
        this.dom.css("border","0px");
        var cav_="<canvas width='"+this.size+"' height='"+this.size+"'></canvas>";
        this.dom.html(cav_); //为清空的dom加个画布，为了画线。（擦除图片时要画线）
    }
    //在当前方块中，画中心点到上边中点的连线
    Block.prototype.drawUpLine=function(){
        var context=this.dom.find("canvas").get(0).getContext("2d");
        context.beginPath();
        context.moveTo(this.size/2,this.size/2);
        context.lineTo(this.size/2,0);
        context.stroke();
    }
    //在当前方块中，画中心点到下边中点的连线
    Block.prototype.drawDownLine=function(){
        var context=this.dom.find("canvas").get(0).getContext("2d");
        context.beginPath();
        context.moveTo(this.size/2,this.size/2);
        context.lineTo(this.size/2,this.size);
        context.stroke();
    }
    //在当前方块中，画中心点到左边中点的连线
    Block.prototype.drawLeftLine=function(){
        var context=this.dom.find("canvas").get(0).getContext("2d");
        context.beginPath();
        context.moveTo(this.size/2,this.size/2);
        context.lineTo(0,this.size/2);
        context.stroke();
    }
    //在当前方块中，画中心点到右边中点的连线
    Block.prototype.drawRightLine=function() {
        var context = this.dom.find("canvas").get(0).getContext("2d");
        context.beginPath();
        context.moveTo(this.size / 2, this.size / 2);
        context.lineTo(this.size, this.size / 2);
        context.stroke();
    }

    var game=(function(){
       var places=[];  //放所有的方块
        var clickNumber=0;  //记录点击鼠标的次数
        var clickObject1=undefined;  //第1次单击的方块
        var clickObject2=undefined;  //第2次单击的方块
        var canceled=0;//已消除的图片数目
        var success=false;//是否成功
        /*
        下面方法是计算还没消除的图片数。
        */
        function isSuccess(){
            let sum=0;
            for(let i=0;i<places.length;i++){
                for(let j=0;j<places.length;j++){
                    if (places[i][j].dom.find("img").length==1){
                            sum++;
                    }
                }
            }
            return sum;
        }

        /**
         下面的方法是调换图片。参数sum代表没有消除的图片数。
         如果还剩余5张图片没消除，那就从数组imgs中的前4个图片中随机选择图片来替换剩余的5张图片。
         */
        function change(sum){
            for(let i=0;i<places.length;i++){
                for(let j=0;j<places.length;j++){
                    if (places[i][j].dom.find("img").length==1){
                        var range=(sum-1<=imgs.length)?sum-1:imgs.length;
                        var ranImage=imgs[Math.floor(Math.random()*range)];
                        var img_="<img src='"+ranImage+"' width='50' height='50'/>";
                        places[i][j].ranImage=ranImage;
                        places[i][j].dom.html(img_);
                    }
                }
            }
        }
       function initGame(sizeX,sizeY){
           for(let i=0;i<=sizeX+1;i++){
               places[i]=[];
               for(let j=0;j<=sizeY+1;j++){
                   let b=new Block(i,j);
                   b.init();
                   b.create();
                   places[i][j]=b;
                   //设置四边的画布
                   if (i==0||j==0||i==sizeX+1||j==sizeY+1){
                       places[i][j].edgeErase();
                   }
               }
           }
       }
       //找含有一条直线的路径
       function canCancel1(i1,j1,i2,j2){
           var paths=[];
           if (i1!==i2&&j1!==j2) return [];//如果(i1,j1)和(i2,j2)不在一条直线上就返回空路径
           if (i1==i2){
               if (Math.abs(j1-j2)==1){
                  if (j1>j2){
                      paths.push(places[i2][j2]);
                      paths.push(places[i1][j1]);
                      return paths;
                  }else{
                        paths.push(places[i1][j1]);
                        paths.push(places[i2][j2]);
                        return paths;
                  }
               }else{
                   if (j1>j2){
                        paths.push(places[i2][j2]);
                        let flag=true;
                        for(let m=j2+1;m<j1;m++){
                            if (places[i2][m].dom.find("canvas").length==1){
                                paths.push(places[i2][m]);
                            }else{
                                paths=[]; flag=false;
                                break;
                            }
                        }
                        if (flag) paths.push(places[i2][j1]);
                        return paths;
                   }else{  //j1<j2
                       paths.push(places[i1][j1]);
                       let flag=true;
                       for(let m=j1+1;m<j2;m++){
                           if (places[i1][m].dom.find("canvas").length==1){
                               paths.push(places[i1][m]);
                           }else{
                               paths=[]; flag=false;
                               break;
                           }
                       }
                       if (flag) paths.push(places[i1][j2]);
                       return paths;
                   }
               }
           }
           if (j1==j2){
               if (Math.abs(i1-i2)==1){
                   if (i1>i2){
                       paths.push(places[i2][j2]);
                       paths.push(places[i1][j1]);
                       return paths;
                   }else{
                       paths.push(places[i1][j1]);
                       paths.push(places[i2][j2]);
                       return paths;
                   }
               }else{
                   if (i1>i2){
                       paths.push(places[i2][j2]);
                       let flag=true;
                       for(let m=i2+1;m<i1;m++){
                           if (places[m][j2].dom.find("canvas").length==1){
                               paths.push(places[m][j2]);
                           }else{
                               paths=[]; flag=false;
                               break;
                           }
                       }
                       if (flag) paths.push(places[i1][j2]);
                       return paths;
                   }else{  //i1<i2
                       paths.push(places[i1][j1]);
                       let flag=true;
                       for(let m=i1+1;m<i2;m++){
                           if (places[m][j1].dom.find("canvas").length==1){
                               paths.push(places[m][j1]);
                           }else{
                               paths=[]; flag=false;
                               break;
                           }
                       }
                       if (flag) paths.push(places[i2][j1]);
                       return paths;
                   }
               }
           }
       }
       //找含有两条直线的路径
        function canCancel2(i1,j1,i2,j2){
           if(i1==i2||j1==j2) return [];
           var paths=[];
           if (i1<i2&&j1<j2){  //第1种情况
               let flag=true;
               paths.push(places[i1][j1]);  //先判断“右--下”路径是否可行
               for(let m=j1+1;m<=j2;m++){
                   if (places[i1][m].dom.find("canvas").length==1){
                       paths.push(places[i1][m]);
                   }else{  //路径上只要有一个是未消除的图片就返回空。
                      paths=[];
                      flag=false;
                      break;
                   }
               }
               if (flag) {
                   for (let m = i1 + 1; m < i2; m++) {
                       if (places[m][j2].dom.find("canvas").length == 1) {
                           paths.push(places[m][j2]);
                       } else {
                           paths = [];
                           flag = false;
                           break;
                       }
                   }
               }
               if (flag) {
                   paths.push(places[i2][j2]);
                   return paths;
               }
               //判断另一条路径是否可行
              paths.push(places[i1][j1]);
               for(let m=i1+1;m<=i2;m++){
                   if (places[m][j1].dom.find("canvas").length==1){
                       paths.push(places[m][j1]);
                   }else{
                       return [];
                   }
               }
               for(let m=j1+1;m<j2;m++){
                   if (places[i2][m].dom.find("canvas").length==1){
                       paths.push(places[i2][m]);
                   }else{
                       return [];
                   }
               }
               paths.push(places[i2][j2]);
               return paths;
           }
           if(i1<i2&&j1>j2){ //第2种情况
             let flag=true;
             paths.push(places[i1][j1]);
             for(let m=j1-1;m>=j2;m--){
                 if (places[i1][m].dom.find("canvas").length==1){
                     paths.push(places[i1][m]);
                 }else{
                     paths=[];
                     flag=false;
                     break;
                 }
             }
             if (flag){
                 for(let m=i1+1;m<i2;m++){
                     if (places[m][j2].dom.find("canvas").length==1){
                          paths.push(places[m][j2]);
                      }else{
                         paths=[];
                         flag=false;
                         break;
                     }
                 }
             }
             if (flag){
                 paths.push(places[i2][j2]);
                 return paths;
             }
             paths.push(places[i1][j1]);
             for(let m=i1+1;m<=i2;m++) {
                 if (places[m][j1].dom.find("canvas").length == 1) {
                     paths.push(places[m][j1]);
                 } else {
                     return [];
                 }
             }
             for(let m=j1-1;m>j2;m--){
                 if (places[i2][m].dom.find("canvas").length==1){
                     paths.push(places[i2][m]);
                 }else{
                     return [];
                 }
             }
             paths.push(places[i2][j2]);
             return paths;
           }
           if(i1>i2&&j1>j2){  //第3种情况
              return  canCancel2(i2,j2,i1,j1);
           }
           if (i1>i2&&j1<j2){ //第4种情况
             return  canCancel2(i2,j2,i1,j1);
           }
        }
       //找含有三条直线的路径
        function canCancel3(i1,j1,i2,j2){
           var paths=[];
           for(let m=i1-1;m>=0;m--){
                 if (places[m][j1].dom.find("canvas").length==0){
                    break;
                 }
                 var path1=canCancel1(i1,j1,m,j1);
                 var path2=canCancel2(m,j1,i2,j2);
                 if (path1.length>0&&path2.length>0){
                     if (path1[0].row!=i1) path1.reverse();
                     if (path2[0].row==i2&&path2[0].col==j2) path2.reverse();
                         $.each(path1, function (key, value) {
                             paths.push(value);
                         });
                         for (let k = 1; k < path2.length; k++) {
                             paths.push(path2[k]);
                         }
                         return paths;
                     }
           }
           paths=[];
           for(m=i1+1;m<=11;m++){  //这里的11并不健壮，后期需要重构
               if (places[m][j1].dom.find("canvas").length==0) break;
               var path1=canCancel1(i1,j1,m,j1);
               var path2=canCancel2(m,j1,i2,j2);
               if (path1.length>0&&path2.length>0){
                   if (path1[0].row!=i1) path1.reverse();
                   if (path2[0].row==i2&&path2[0].col==j2) path2.reverse();

                       $.each(path1, function (key, value) {
                           paths.push(value);
                       });
                       for (let k = 1; k < path2.length; k++) {
                           paths.push(path2[k]);
                       }
                       return paths;
               }
           }
            paths=[];
           for(let m=j1-1;m>=0;m--){
                if (places[i1][m].dom.find("canvas").length==0) break;
                var path1=canCancel1(i1,j1,i1,m);
                var path2=canCancel2(i1,m,i2,j2);
                if (path1.length>0&&path2.length>0){
                    if (path1[0].col!=j1) path1.reverse();
                    if (path2[0].row==i2&&path2[0].col==j2) path2.reverse();
                    //把两个路径合并
                    $.each(path1,function(key,value){
                        paths.push(value);
                    });
                    for(let k=1;k<path2.length;k++){
                        paths.push(path2[k]);
                    }
                    return paths;
                }
            }
            paths=[];
            for(let m=j1+1;m<=11;m++){
                if (places[i1][m].dom.find("canvas").length==0) break;
                var path1=canCancel1(i1,j1,i1,m);
                var path2=canCancel2(i1,m,i2,j2);
                if (path1.length>0&&path2.length>0){
                    if (path1[0].col!=j1) path1.reverse();
                    if (path2[0].row==i2&&path2[0].col==j2) path2.reverse();
                    //把两个路径合并
                    $.each(path1,function(key,value){
                        paths.push(value);
                    });
                    for(let k=1;k<path2.length;k++){
                        paths.push(path2[k]);
                    }
                    return paths;
                }
            }
            return paths;
        }

        function cancelImage(paths){
            canceled+=2;
           for(let i=0;i<paths.length;i++)
               if (paths[i].dom.find("canvas").length==0)
                  paths[i].erase();

            for(let i=0;i<paths.length-1;i++){
                if(paths[i].col==paths[i+1].col&&paths[i].row>paths[i+1].row){
                    paths[i].drawUpLine();
                    paths[i+1].drawDownLine();
                }
                if (paths[i].col==paths[i+1].col&&paths[i].row<paths[i+1].row){
                    paths[i].drawDownLine();
                    paths[i+1].drawUpLine();
                }
                if (paths[i].row==paths[i].row&&paths[i].col>paths[i+1].col){
                    paths[i].drawLeftLine();
                    paths[i+1].drawRightLine();
                }
                if (paths[i].row==paths[i].row&&paths[i].col<paths[i+1].col){
                    paths[i+1].drawLeftLine();
                    paths[i].drawRightLine();
                }
            }
            setTimeout(function(){
                for(let i=0;i<paths.length;i++){
                    var c=paths[i].dom.find("canvas").get(0).getContext("2d");
                    c.clearRect(0,0,paths[i].size,paths[i].size);
                }
            },500);
        }
        function clickBlock() {
            if (clickNumber == 0) {
                clickNumber = 1;
                for (let i = 1; i < places.length; i++) {
                    for (let j = 1; j < places[i].length; j++) {
                        if (places[i][j].dom.css("left") == $(this).css("left") && places[i][j].dom.css("top") == $(this).css("top")) {
                            clickObject1 = places[i][j];
                            break;
                        }
                    }
                }
                return;
            }
            if (clickNumber == 1){
                for (let i = 1; i < places.length; i++) {
                    for (let j = 1; j < places[i].length; j++) {
                        if (places[i][j].dom.css("left") == $(this).css("left") && places[i][j].dom.css("top") == $(this).css("top")) {
                            clickObject2 = places[i][j];
                            break;
                        }
                    }
                }
                if (clickObject2!=undefined&&clickObject1!=undefined&&clickObject2.ranImage == clickObject1.ranImage && clickObject1 != clickObject2) {
                    var paths = canCancel1(clickObject1.row, clickObject1.col, clickObject2.row, clickObject2.col);
                    if (paths.length == 0) {
                        paths = canCancel2(clickObject1.row, clickObject1.col, clickObject2.row, clickObject2.col);
                    }
                    if (paths.length == 0) {
                        paths = canCancel3(clickObject1.row, clickObject1.col, clickObject2.row, clickObject2.col);
                    }
                    if (paths.length == 0) {
                        paths = canCancel3(clickObject2.row, clickObject2.col,clickObject1.row, clickObject1.col);
                    }
                    if (paths != []) {
                        cancelImage(paths);
                        if (canceled >= 100) {  //判断游戏是否成功
                            var sum = isSuccess();
                            if (sum == 0) success=true;
                        }
                    }
                    if (success){
                        gameOver(0,3,"恭");
                        gameOver(0,4,"喜");
                        gameOver(0,5,"你");
                        gameOver(0,6,"！");
                        gameOver(0,7,"赢");
                        gameOver(0,8,"了");
                    }
                }
                clickNumber = 0;
                clickObject1 = undefined;
                clickObject2 = undefined;
            }
        }
        function gameOver(x,y,message){
           var context= places[x][y].dom.find("canvas").get(0).getContext("2d");
            context.font="40px Comic Sans Ms";
            context.fillStyle="Orange";
            context.shadowBlue=5;
            context.shadowOffsetX=5;
            context.shadowOffsetY=5;
            context.shadowColor="red";
            context.textAlign="center";
            context.textBaseline="middle";
            context.fillText(message,20,20);
        }
        function bindEvent() {
            $("button").on("click", function () {
                var sum = isSuccess();
                change(sum);
            });
            $(document).on("click", "div", clickBlock);
        }
        return {initGame:initGame,bindEvent:bindEvent};
    })();
     $.ready=function()
    {
       game.initGame(10,10);
       game.bindEvent();

    }