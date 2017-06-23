(function($, _, Filejs) {

    $(function() {
        var imageView = new ImageView();

        ImageFile.fileJs = new Filejs();

        ImageFile.fileJs.ready().then(function() {

            var raw = localStorage.getItem('images');
            var data = [{ 'url': 'pics/pic0.png' }, { url: 'pics/pic1.png' }, { url: 'pics/pic2.png' }, { url: 'pics/pic3.png' }]
            if (raw != undefined) {
                console.log('config loaded', raw);
                data = JSON.parse(raw);
            } else { console.log('first launch'); }

            var collection = new ImageFileCollection(data);

            Promise.all(collection.imgs.map(function(img) {
                return img.downloadBlob().then(function() {
                    if (img.updated) {
                        return img.saveLocally().then(function() {
                            return imageView.render(img);
                        });
                    } else {
                        return img.loadLocally().then(function() {
                            return imageView.render(img);
                        });
                    }

                }, (function(err) {
                    if (err.message == 'Not Found') {
                        console.log('image not found', img.url);
                    }
                }));
            })).then(function() {
                localStorage.setItem('images', JSON.stringify(collection));
                console.log('config saved', JSON.stringify(collection));
            });


        }, function() {
            dlogerror('FileSystemApi failure');
        });


    });


    var ImageView = function() {

        this.render = function(imageFile) {
            return new Promise(function(resolve, reject) {

                var blob = imageFile.getBlob();
                var src = "";
                if ({}.toString.apply(blob) === '[object Blob]') {
                    src = window.URL.createObjectURL(blob);
                } else {
                    blob = fixBinary(blob);
                    var binaryData = [];
                    binaryData.push(blob);
                    src = window.URL.createObjectURL(new Blob(binaryData, { type: 'image/png' }));
                }

                var image = new Image();
                image.onload = function() {
                    console.log('img onload ' + imageFile.getName());
                    resolve();
                }

                image.src = src;

                var div = document.createElement('div');
                div.className = 'img';
                div.appendChild(image);
                if (imageFile.updated) {
                    div.className += ' updated';
                }

                document.querySelector('#main').appendChild(div);
            });


        }
    }

    var ImageFileCollection = function(imageObjArray) {
        this.imgs = [];

        for (var i in imageObjArray) {
            var img = new ImageFile(imageObjArray[i].url);
            if (imageObjArray[i].hasOwnProperty('modifiedDate')) {
                img.modifiedDate = imageObjArray[i].modifiedDate;
            }

            this.imgs.push(img);
        }


        this.map = this.imgs.map;

        this.get = function(key) {
            return this.imgs[key];
        }

        this.toJSON = function() {
            return this.imgs;
        }

    }

    var ImageFile = function(url) {
        this.url = url;
        this.modifiedDate = false;
        this.blob = false;

        this.updated = false;

        this.getName = function() {
            return this.url.split('/').pop();
        };

        this.setBlob = function(blob) {
            this.blob = blob;
        };

        this.getBlob = function() {
            return this.blob;
        }

        this.toJSON = function() {
            return { url: this.url, modifiedDate: this.modifiedDate };
        }

        this.downloadBlob = function() {
            var self = this;
            return new Promise(function(resolve, reject) {
                var req = new XMLHttpRequest();
                req.open('GET', url);

                self.modifiedDate && req.setRequestHeader('If-Modified-Since', self.modifiedDate);
                req.responseType = "blob";

                req.onload = function() {
                    if (req.status == 304) {
                        resolve();
                    } else if (req.status == 200) {
                        self.modifiedDate = req.getResponseHeader('Last-Modified');
                        self.blob = req.response;
                        self.updated = true;
                        resolve();
                    } else {
                        reject(Error(req.statusText));
                    }
                };

                req.onerror = function(err) {
                    reject(err);
                };
                req.send();


            });
        };

        this.loadLocally = function() {
            var self = this;

            return ImageFile.fileJs.readBlob({ name: self.getName() }).then(function(blob) {
                self.blob = blob;
            });
        }
        this.saveLocally = function() {
            if (!this.updated) {
                return Promise.resolve();
            }
            return ImageFile.fileJs.writeBlob({ name: this.getName(), blob: this.getBlob() });
        }
    }

    window.updatePicOnServer = function() {
        dlog('updating pic on server...');
        $.get('update.php').then(function() {
            dlog('updated. reloading');
            setTimeout(function() {
                document.location.reload();
            }, 250)

        })
    }


    window.clearDb = function() {
        localStorage.clear();
        document.location.reload();
    }

})(jQuery, _, Filejs);
