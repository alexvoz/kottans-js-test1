/**
 * Created by Alexander Pismenchuk on 18.03.2016.
 */


(function(){

    var stage = new Konva.Stage({
        container: 'container',   // id of container <div>
        width: window.innerWidth,
        height: window.innerHeight
    });

    window.onresize = function() {
        resizeCanvas();
    };

    function resizeCanvas() {
        stage.setWidth(window.innerWidth);
        stage.setHeight(window.innerHeight);
        if (preloader) preloader.setPosition({x: stage.getWidth() / 2 - preloader.getWidth() / 2, y: stage.getHeight() / 2 - preloader.getHeight() / 2});
        if (contGroup.getClientRect().width > (stage.getWidth() - cardsOffset) || contGroup.getClientRect().height > (stage.getHeight() - cardsOffset) || contGroup.scaleX() < 1 || contGroup.scaleY() < 1) {
            var scale = Math.min((stage.getWidth() - cardsOffset) / (contGroup.getClientRect().width / contGroup.scaleX()), (stage.getHeight() - cardsOffset) / (contGroup.getClientRect().height / contGroup.scaleY()));
            //console.log(scale);
            contGroup.scale({x: scale, y:scale});
        }
        contGroup.setPosition({x: stage.getWidth() / 2 - contGroup.getClientRect().width / 2});
    }

    var contGroup = new Konva.Group({});
    var cardWidth = 150;
    var cardHeight = 250;
    var cardBigWidth = 270;
    var cardBigHeight = 580;
    var cardsOffset = 10;
    var contWidth = (cardWidth + cardsOffset) * 4 + cardBigWidth + cardsOffset;
    var posY = 1;

    //PRELOADER

    var preloader;
    var contReady = false;

    var animations = {
        idle: [
            0, 0, 35, 34,
            35, 0, 35, 34,
            70, 0, 35, 34,
            105, 0, 35, 34,
            140, 0, 35, 34,
            175, 0, 35, 34,
            210, 0, 35, 34,
            245, 0, 35, 34,
            280, 0, 35, 34,
            315, 0, 35, 34,
            350, 0, 35, 34,
            385, 0, 35, 34
        ]
    };

    function createPreloader() {
        var imgPreloader = new Image();
        imgPreloader.src = 'images/preloader.png';
        imgPreloader.onload = function () {
            preloader = new Konva.Sprite({
                image: imgPreloader,
                animation: 'idle',
                animations: animations,
                frameRate: 15,
                frameIndex: 0,
                width: imgPreloader.width / 12,
                height: imgPreloader.height
            });
            layer.add(preloader);
            preloader.start();
            resizeCanvas();
            reqData(12, currOffset);
        };
    }


    initCont();
    createHead();
    createBtn();
    createPreloader();

    //HEAD

    function initCont(){
        var bg = new Konva.Rect({
            width: contWidth,
            height: 10
        });
        contGroup.add(bg);
        resizeCanvas();
    }

    function createHead(){
        var headGroup = new Konva.Group({id: 'head'});
        var headRect = new Konva.Rect({
            cornerRadius: 5,
            width: 400,
            height: 50,
            stroke: '#000'
        });
        headGroup.add(headRect);
        var headText = new Konva.Text({
            text: 'Pokedex',
            fontSize: 30,
            fontFamily: 'Arial'
        });
        headText.setPosition({x:headRect.getWidth() / 2 - headText.getTextWidth() / 2, y:headRect.getHeight() / 2 - headText.getTextHeight() / 2});
        headGroup.add(headText);
        headGroup.setPosition({x:contWidth / 2 - headRect.getWidth() / 2, y:30});
        contGroup.add(headGroup);
        posY = headGroup.getClientRect().y + headGroup.getClientRect().height;

    }

    //LOAD DATA

    var currOffset = 0;
    var jsonObj;

    function reqData(count, offset){
        var http = new XMLHttpRequest();
        var url = "http://pokeapi.co/api/v1/pokemon/?limit=" + count + "&offset=" + offset;
        //var url = "test.json";
        http.open("GET", url, true);

        http.onreadystatechange = function() { //Call a function when the state changes.
            if(http.readyState == 4 && http.status == 200) {
                jsonObj = JSON.parse(http.responseText);
                //console.log(jsonObj);
                currOffset += count;
                showData(jsonObj);
            } else {
                console.log(http.readyState, http.status);
            }
        };
        http.onerror = function(){

            alert('Error loading http://pokeapi.co/');
            var text = new Konva.Text({
                text: 'Error ' + http.readyState + '! Can\'t load http://pokeapi.co/',
                fontSize: 40,
                fill: 'red',
                y: 150,
                align: 'centre',
                width: stage.getWidth()
            });
            layer.add(text);
        };
        http.send();
    }

    //CONTENT

    var cards;

    function showData(data){
        cards = new Konva.Group({opacity:0, id:'cards'});
        for (var i = 0; i < data.objects.length; i++){
            var card = createCard(data.objects[i], i);
            cards.add(card);
        }
        cards.setPosition({y: posY + 15});
        cards.setAttr('opacity', 1);
        preloader.setAttr('opacity', 0);
        preloader.stop();
        contGroup.add(cards);
        resizeCanvas();
        contReady = true;
    }

    function createBtn() {
        var btnGroup = new Konva.Group({});
        var rect = new Konva.Rect({
            width: 512,
            height: 70,
            cornerRadius: 10,
            fill: '#008CFF',
            stroke: 'black'
        });
        var text = new Konva.Text({
            fontSize: 24,
            fontFamily: 'Arial',
            fill: 'white',
            text: 'Load More'
        });
        text.setPosition({x: rect.getWidth() / 2 - text.getTextWidth() / 2, y: rect.getHeight() / 2 - text.getTextHeight() / 2});
        btnGroup.add(rect).add(text);
        btnGroup.setPosition({x:contWidth / 2 - rect.getWidth() / 2, y:posY + (cardHeight + cardsOffset) * 3 + 15});
        btnGroup.on('mouseover', overHandler);
        btnGroup.on('mouseout', outHandler);
        btnGroup.on('click tap', reloadHandler);
        contGroup.add(btnGroup);
    }

    function reloadHandler() {
        if (contReady) {
            contReady = false;

            var delCard = stage.find('#cardBig')[0];
            if (delCard != undefined) delCard.destroy();

            var Cards = stage.find('#cards')[0];
            Cards.destroyChildren();
            if (Cards != undefined) Cards.destroy();

            stage.draw();

            preloader.setAttr('opacity', 1);
            preloader.start();

            reqData(12, currOffset);
        }
    }

    function createCard(pokemon, i) {
        var card = new Konva.Group({});
        var rect = new Konva.Rect({
            cornerRadius: 5,
            width: 150,
            height: 250,
            stroke: '#000'
        });
        card.add(rect);
        var rectPhoto = new Konva.Rect({
            width: 125,
            height: 125,
            stroke: '#000',
            x: 12,
            y: 12
        });
        var photo = new Image();
        photo.src = 'http://pokeapi.co/media/img/' + pokemon.pkdx_id + '.png';
        photo.onload = function(){
            var img = new Konva.Image({
                image: photo,
                width: photo.width,
                height: photo.height,
                x: rectPhoto.getWidth()/2 - photo.width/2 + rectPhoto.getPosition().x,
                y: rectPhoto.getHeight()/2 - photo.height/2 + + rectPhoto.getPosition().y
            });
            img.on('mouseover', overHandler);
            img.on('mouseout', outHandler);
            img.on('tap click', createBigCard);
            card.add(img);
            stage.draw();
        };
        card.add(rectPhoto);
        var nameText = new Konva.Text({
            x: 12,
            y: 150,
            text: pokemon.name,
            fontSize: 16,
            fontFamily: 'Arial',
            width: 125,
            align: 'center'
        });
        card.add(nameText);

        //Подумать как переделать
        var obj = {};
        obj.colornormal="#DDDDDD"; obj.colorTextnormal="#000000";
        obj.colorfighting="#FF7C80"; obj.colorTextfighting="#000000";
        obj.colorflying="#66CCFF"; obj.colorTextflying="#000000";
        obj.colorpoison="#66FF33"; obj.colorTextpoison="#000000";
        obj.colorground="#663300"; obj.colorTextground="#FFFFFF";
        obj.colorrock="#808080"; obj.colorTextrock="#FFFFFF";
        obj.colorbug="#FFFF66"; obj.colorTextbug="#000000";
        obj.colorghost="#CCCCFF"; obj.colorTextghost="#000000";
        obj.colorsteel="#B2B2B2"; obj.colorTextsteel="#000000";
        obj.colorfire="#FF6600"; obj.colorTextfire="#FFFFFF";
        obj.colorwater="#0066FF"; obj.colorTextwater="#FFFFFF";
        obj.colorgrass="#339933"; obj.colorTextgrass="#FFFFFF";
        obj.colorelectric="#FFCCFF"; obj.colorTextelectric="#000000";
        obj.colorice="#CCFFFF"; obj.colorTextice="#000000";
        obj.colordragon="#000000"; obj.colorTextdragon="#FFFFFF";
        obj.colordark="#5F5F5F"; obj.colorTextdark="#FFFFFF";
        obj.colorfairy="#FF66CC"; obj.colorTextfairy="#000000";
        obj.colorunknown="#FFFFFF"; obj.colorTextunknown="#000000";
        obj.colorshadow="#777777"; obj.colorTextshadow="#FFFFFF";
        obj.colorpsychic="#66FF33"; obj.colorTextpsychic="#000000";

        var tagY = 175;
        for (var j = 0; j < pokemon.types.length; j++){
            var tagText = new Konva.Text({
                x: 12,
                y: tagY,
                text: pokemon.types[j].name.charAt(0).toUpperCase() + pokemon.types[j].name.slice(1),
                fontSize: 16,
                fontFamily: 'Arial',
                width: 125,
                fill: obj['colorText' + pokemon.types[j].name]
            });
            var tagRect = new Konva.Rect({
                width: tagText.textWidth + 8,
                height: tagText.textHeight + 8,
                fill: obj['color'+pokemon.types[j].name],
                x: 8,
                y: tagY - 3
            });
            tagY += 25;
            card.add(tagRect).add(tagText);
        }
        var baseX = (i % 4) * (cardWidth + cardsOffset);
        var baseY = Math.floor(i / 4) * (cardHeight + cardsOffset);
        card.setPosition({x:baseX, y:baseY});
        nameText.on('mouseover', overHandler);
        nameText.on('mouseout', outHandler);
        nameText.on('tap click', createBigCard);
        rectPhoto.on('mouseover', overHandler);
        rectPhoto.on('mouseout', outHandler);
        rectPhoto.on('tap click', createBigCard);
        card.pokID = pokemon.pkdx_id;
        card.ID = i;
        return card;
    }

    function overHandler() {
        document.body.style.cursor = 'pointer';
    }

    function outHandler() {
        document.body.style.cursor = 'default';
    }

    function createBigCard(evt) {
        var delCard = stage.find('#cardBig')[0];
        if (delCard != undefined) delCard.destroy();
        var card = evt.target.parent;
        var cardBig = new Konva.Group({id: 'cardBig'});
        var rect = new Konva.Rect({
            stroke: '#000000',
            cornerRadius: 10,
            width: cardBigWidth,
            height: cardBigHeight
        });
        var rectPhoto = new Konva.Rect({
            width: 240,
            height: 200,
            stroke: '#000',
            x: 15,
            y: 15
        });
        var photo = new Image();
        photo.src = 'http://pokeapi.co/media/img/' + card.pokID + '.png';
        photo.onload = function(){
            var img = new Konva.Image({
                image: photo,
                width: photo.width * 2,
                height: photo.height * 2,
                x: rectPhoto.getWidth()/2 - photo.width + rectPhoto.getPosition().x,
                y: rectPhoto.getHeight()/2 - photo.height + rectPhoto.getPosition().y
            });
            cardBig.add(rect).add(rectPhoto).add(img);
            cards.add(cardBig);
            stage.draw();
        };
        var nameText = new Konva.Text({
            fontFamily: 'Arial',
            fontSize: 36,
            x: 15,
            y: 230,
            text: jsonObj.objects[card.ID].name,
            align: 'center',
            width: 245,
            fontStyle: 'bold'
        });
        cardBig.add(nameText);
        var paramText = new Konva.Text({
            fontFamily: 'Consolas',
            fontSize: 16,
            lineHeight: 1.8,
            x: 15,
            y: 290,
            //Костыль. Переделать!!!
            text: 'Type:              ' + jsonObj.objects[card.ID].types[0].name.charAt(0).toUpperCase() + jsonObj.objects[card.ID].types[0].name.slice(1) + '\n' +
                  'Attack:            ' + jsonObj.objects[card.ID].attack + '\n' +
                  'Defense:           ' + jsonObj.objects[card.ID].defense + '\n' +
                  'HP:                ' + jsonObj.objects[card.ID].hp + '\n' +
                  'SP Attack:         ' + jsonObj.objects[card.ID].sp_atk + '\n' +
                  'SP Defense:        ' + jsonObj.objects[card.ID].sp_def + '\n' +
                  'Speed:             ' + jsonObj.objects[card.ID].speed + '\n' +
                  'Weight:            ' + jsonObj.objects[card.ID].weight + '\n' +
                  'Total movies:      ' + jsonObj.objects[card.ID].moves.length
        });
        cardBig.setPosition({x: (cardWidth + cardsOffset) * 4, y: ((cardHeight + cardsOffset) * 3) / 2 - cardBigHeight / 2});
        cardBig.add(paramText);
        stage.draw();
    }

    var layer = new Konva.Layer({});
    layer.add(contGroup);
    stage.add(layer);

})();