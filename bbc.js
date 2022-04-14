        //console.log("script start");
        var levelNum = 0;
        var c = document.getElementById("myCanvas");
        var ctx = c.getContext("2d");
        var imgCount = 0;
        var img = {}
        var x = 0;
        var y = 0;
        var squareSize = 20;
        var win = false;
        //console.log("script 2");
        var curLevel = [];
        var curCannon = 0;
        curLevel = getLevel(levelNum);
        curCannon = getCannonInfo();
        curLaser = getLaser();
        function next() {
            document.getElementById("status").innerHTML="&nbsp;"
            win=false;
            levelNum++;
            curLevel = getLevel(levelNum);
            curCannon = getCannonInfo();
            curLaser = getLaser();
            console.log(curCannon);
            drawLevel();
        }

        function reset() {
            curLevel = getLevel(levelNum);
            curCannon = getCannonInfo();
            curLaser = getLaser();
            console.log(curCannon);
            drawLevel();
        }



        function loadImages() {
            var ids = ["CER", "CERO", "CNR", "CNRO", "CSR", "CSRO", "CWR", "CWRO",
                "MNE", "MNEO", "MNW", "MNWO", "MSE", "MSEO", "MSW", "MSWO",
                "PPP", "SSS", "SSSC", "SSSH", "SSSV",
                "TER", "TERO", "TNR", "TNRO", "TSR", "TSRO", "TWR", "TWRO",
                "ZZZ"];
            for (const id of ids) {
                img[id] = document.getElementById(id);
                img[id].addEventListener('load', function () {
                    imgCount++;
                    console.log(id + ":" + imgCount);
                }, false);
            }
            //console.log("images loaded");
        }


        function getLevel(n) {
            let result = [];
            let clj = levels[n].level;
            for (let yy = 0; yy < clj.length; yy++) {
                let rs = clj[yy];
                let row = [];
                for (let xx = 0; xx < 11; xx++) {
                    let offset = xx * 3;
                    let item = rs.substring(offset + 0, offset + 3);
                    if (item == "(P)") {
                        x = xx;
                        y = yy;
                    }
                    row.push(item);
                }
                result.push(row);
            }
            return result;
        }

        function getCannonInfo() {
            for (let yy = 0; yy < 11; yy++) {
                for (let xx = 0; xx < 11; xx++) {
                    piece = curLevel[yy][xx];
                    if (piece.substring(0, 1) == "C") {
                        let dx = 0;
                        let dy = 0;
                        if (piece.substring(1, 2) == "N") dy = -1;
                        if (piece.substring(1, 2) == "E") dx = 1;
                        if (piece.substring(1, 2) == "S") dy = 1;
                        if (piece.substring(1, 2) == "W") dx = -1;
                        return [xx, yy, dx, dy];
                    }
                }
            }
            return [0, 0, 0, 0]
        }

        function getLaser() {
            let result = [];
            let laserType = 0;
            for (let yy = 0; yy < 11; yy++) {
                let row = []
                for (let xx = 0; xx < 11; xx++) {
                    row.push(0);
                }
                result.push(row);
            }
            let [xx, yy, dx, dy] = getCannonInfo();
            result[yy][xx] = 1;

            let hit = false;
            while(hit==false)
            {
                laserType=1;
                if(dy==0) {laserType=2}
                xx = xx + dx;
                yy = yy + dy;
                let peice = curLevel[yy][xx];
                //console.log('xx: ' + xx + " yy: " + yy + " dx:" + dx + " dy: " + dy);
                if(peice=="   ")
                {
                    result[yy][xx]=laserType;
                }
                else if(peice=="MNE")
                {
                    result[yy][xx]=laserType;
                    if(dx==0 & dy==1)
                    {
                        dx=1; dy=0;
                    }
                    else if(dx==-1 & dy==0)
                    {
                        dx=0; dy=-1;
                    }
                    else
                    {
                        result[yy][xx]=0;
                        hit=true;
                    }
                }
                else if(peice=="MSE")
                {
                    result[yy][xx]=laserType;
                    if(dx==-1 & dy==0)
                    {
                        dx=0; dy=1;
                    }
                    else if(dx==0 & dy==-1)
                    {
                        dx=1; dy=0;
                    }
                    else
                    {
                        result[yy][xx]=0;
                        hit=true;
                    }
                }
                else if(peice=="MSW")
                {
                    result[yy][xx]=laserType;
                    if(dx==1 & dy==0)
                    {
                        dx=0; dy=1;
                    }
                    else if(dx==0 & dy==-1)
                    {
                        dx=-1; dy=0;
                    }
                    else
                    {
                        result[yy][xx]=0;
                        hit=true;
                    }
                }
                else if(peice=="MNW")
                {
                    result[yy][xx]=laserType;
                    if(dx==1 & dy==0)
                    {
                        dx=0; dy=-1;
                    }
                    else if(dx==0 & dy==1)
                    {
                        dx=-1; dy=0;
                    }
                    else
                    {
                        result[yy][xx]=0;
                        hit=true;
                    }
                }
                else if(peice.substring(0,1)=="T")
                {
                    result[yy][xx]=laserType;
                    hit=true;
                    win=true;
                    document.getElementById("status").innerHTML=levels[levelNum].message;
            
                }
                else if(peice.substring(0,1)=="C")
                {
                }
                else
                {
                    hit=true;
                }
            }
            return result;
        }

        function getImageId(level, xx, yy) {
            let id = level[yy][xx];
            if (id == "   ") id = "SSS";
            if (id == "###") id = "ZZZ";
            if (id == "(P)") id = "PPP";
            return id;
        }

        function getImage(id) {
            let image = img[id];
            //console.log("getImage id:"+id+" image:"+image);
            return image;
        }

        function drawLevel() { 
            if(win)
            {
                console.log("Win");
                next();
            }
            for (let y = 0; y < 11; y++) {
                for (let x = 0; x < 11; x++) {
                    let id = getImageId(curLevel, x, y);
                    ctx.drawImage(getImage(id), x * squareSize, y * squareSize);
                }
            }
            curLaser = getLaser();
            drawLaser();
        }

        function drawLaser() {
            for (let yy = 0; yy < 11; yy++) {
                for (let xx = 0; xx < 11; xx++) {
                    let state = curLaser[yy][xx];
                    let id = getImageId(curLevel, xx, yy);
                    if (state == 1)
                    {
                        if(id=="SSS")
                        {
                            id=id+"V"
                        }
                        else
                        {
                            id=id+"O"
                        }
                    }
                    if (state == 2)
                    {
                        if(id=="SSS")
                        {
                            id=id+"H"
                        }
                        else
                        {
                            id=id+"O"
                        }
                    }
                    if (state == 3)
                    {
                        if(id=="SSS")
                        {
                            id=id+"C"
                        }
                        else
                        {
                            id=id+"O"
                        }
                    }                    
                    ctx.drawImage(getImage(id), xx * squareSize, yy * squareSize);
                }
            }
        }

        function init() {

            //console.log("onload start");
            loadImages();
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            drawLevel();
            //ctx.drawImage(img["PPP"], x * squareSize, y * squareSize);
        }
        window.addEventListener("load", init)
        function spaceOpen(dx, dy) {
            if (x + dx < 0) return false;
            if (x + dx >= 11) return false;
            if (y + dy < 0) return false;
            if (y + dy >= 11) return false;
            let piece = curLevel[y + dy][x + dx];
            //console.log(piece);
            if (piece == "   ") return true;
            if (piece == "(P)") return true;
            return false;
        }
        function spacePushable(dx, dy) {
            if (x + dx < 0) return false;
            if (x + dx >= 11) return false;
            if (y + dy < 0) return false;
            if (y + dy >= 11) return false;
            let piece = curLevel[y + dy][x + dx];
            if (piece[0] == 'M') return true;
            return false;
        }
        function move(dx, dy) {
            if (spaceOpen(dx, dy)) {
                curLevel[y + dy][x + dx] = curLevel[y][x];
                curLevel[y][x] = "   ";
                x = x + dx;
                y = y + dy;
            }
            else if (spacePushable(dx, dy)) {
                if (spaceOpen(dx + dx, dy + dy)) {
                    curLevel[y + dy + dy][x + dx + dx] = curLevel[y + dy][x + dx];
                    curLevel[y + dy][x + dx] = curLevel[y][x];
                    curLevel[y][x] = "   ";

                    x = x + dx;
                    y = y + dy;
                }
            }

        }
        function moveLeft() {
            move(-1, 0);
            drawLevel();
        }
        function moveRight() {
            move(1, 0);
            drawLevel();
        }
        function moveUp() {
            move(0, -1);
            drawLevel();
        }
        function moveDown() {
            move(0, 1);
            drawLevel();
        }
        window.onload = function () {
            document.addEventListener('swiped-left', function (e) { moveLeft(); });
            document.addEventListener('swiped-right', function (e) { moveRight(); });
            document.addEventListener('swiped-up', function (e) { moveUp(); });
            document.addEventListener('swiped-down', function (e) { moveDown(); });
        }
        function checkKey(e) {
            e = e || window.event;
            //ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
            if (e.keyCode == 37) { moveLeft(); }
            if (e.keyCode == 39) { moveRight(); }
            if (e.keyCode == 38) { moveUp(); }
            if (e.keyCode == 40) { moveDown(); }
        }
        document.onkeydown = checkKey; 