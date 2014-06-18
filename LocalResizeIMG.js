    /**
     * 获得base64
     * @param {Object} obj
     * @param {Number} [obj.width] 图片需要压缩的宽度，高度会跟随调整
     * @param {Number} [obj.quality=0.8] 压缩质量，不压缩为1
     * @param {Function} [obj.before(this, blob, file)] 处理前函数,this指向的是input:file
     * @param {Function} obj.success(obj) 处理后函数
     * @example
     *
     */
    jQuery.fn.localResizeIMG = function (obj) {
        this.on('change', function () {
            var file = this.files[0];
            var URL = window.webkitURL ? webkitURL : window.URL;
            var blob = URL.createObjectURL(file);

            // 执行前函数
            if(jQuery.isFunction(obj.before)) { obj.before(this, blob, file) };

            _create(blob, file);
            this.value = '';   // 清空临时数据
        });

        /**
         * 生成base64
         * @param blob 通过file获得的二进制
         */
        function _create(blob,file) {
            var img = new Image();
            img.src = blob;
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            img.onload = function () {
                var that = this;
                var fr   = new FileReader;
                ctx.drawImage(that,canvas.width/2-that.width/2,canvas.height/2-that.width/2);
                fr.onloadend = function() {
                    var exif = EXIF.readFromBinaryFile(new BinaryFile(this.result));
                   //生成比例
                    var w = that.width,
                        h = that.height,
                        scale = w / h;
                    w = obj.width || w;
                    h = w / scale;

                    //生成canvas

                    jQuery(canvas).attr({width : w, height : h});
                    ctx.drawImage(that, 0, 0, w, h);
                    ctx.save();
                    var orientation = exif.Orientation
                    alert(orientation);
                    switch(orientation){
                        case 8:
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            ctx.save();
                            ctx.translate(canvas.width/2,canvas.height/2);
                            ctx.rotate(90*Math.PI/180);
                            ctx.drawImage(that,-that.width/2,-that.height/2);
                            ctx.restore();
                            break;
                        case 3:
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            ctx.save();
                            ctx.translate(canvas.width/2,canvas.height/2);
                            ctx.rotate(180*Math.PI/180);
                            ctx.drawImage(that,-that.width/2,-that.height/2);
                            ctx.restore();
                            break;
                        case 6:
                            ctx.clearRect(0,0,canvas.width,canvas.height);
                            ctx.save();
                            ctx.translate(canvas.width/2,canvas.height/2);
                            ctx.rotate(90*Math.PI/180);
                            ctx.drawImage(that,-that.width/2,-that.height/2);
                            ctx.restore();
                            break;
                    }


                    /**
                     * 生成base64
                     * 兼容修复移动设备需要引入mobileBUGFix.js
                     */
                    var base64 = canvas.toDataURL('image/jpeg', obj.quality || 0.8 );

                    // 修复IOS
                    if( navigator.userAgent.match(/iphone/i) ) {
                        var mpImg = new MegaPixImage(img);
                        mpImg.render(canvas, { maxWidth: w, maxHeight: h, quality: obj.quality || 0.8, orientation: 6 });
                        base64 = canvas.toDataURL('image/jpeg', obj.quality || 0.8 );
                    }

                    // 修复android
                    if( navigator.userAgent.match(/Android/i) ) {
                        var encoder = new JPEGEncoder();
                        base64 = encoder.encode(ctx.getImageData(0,0,w,h), obj.quality * 100 || 80 );
                    }

                    // 生成结果
                    var result = {
                        blob: blob,
                        base64 : base64,
                        orientation:orientation,
                        ctx:ctx,
                        clearBase64: base64.substr( base64.indexOf(',') + 1 )
                    };

                    // 执行后函数
                    obj.success(result);
                };
                fr.readAsBinaryString(file);
            };
        }
    };


    // 例子
/*
    jQuery('input:file').localResizeIMG({
        width: 100,
        quality: 0.1,
        //before: function (that, blob) {},
        success: function (result) {
            var img = new Image();
            img.src = result.base64;

            jQuery('body').append(img);
            console.log(result);
        }
    });
*/
