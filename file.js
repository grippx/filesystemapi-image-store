function Filejs() {


    function errorHandler(e) {

        console.info('FileSystem Error:' + e);
        throw e;
    }


    var _fs;
    var requestedBytes = 1024 * 1024 * 5;
    window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;


    this.ready = function() {
        return new Promise(function(resolve, reject) {
            navigator.webkitTemporaryStorage.requestQuota(
                requestedBytes,
                function(grantedBytes) {
                    console.log('requested bytes', requestedBytes);
                    console.log('granted bytes', grantedBytes);
                    window.requestFileSystem(TEMPORARY, grantedBytes, function(fs) {
                        console.log('Opened file system: ' + fs.name);
                        _fs = fs;
                        resolve();
                    }, errorHandler);
                },
                function(e) {
                    console.log('Error', e);
                    reject(e);
                }
            );
        });
    }


    this.readBlob = function(file) {
        return new Promise(function(resolve, reject) {
            
            console.log('read file from fs', file.name);
            _fs.root.getFile(file.name, {}, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();

                    reader.onloadend = function(e) {
                        resolve(e.target.result);
                    };

                    reader.readAsBinaryString(file);
                }, function(err) {
                    reject(err);
                });

            });
        });

    }

    this.writeBlob = function(file) {
        return new Promise(function(resolve, reject) {

            _fs.root.getFile(file.name, { create: true }, function(fileEntry) {
                fileEntry.createWriter(function(fileWriter) {
                    fileWriter.onwriteend = function(e) {
                        console.log('Write file to fs', file.name);
                        resolve(file.name);
                    };

                    fileWriter.onerror = function(e) {
                        console.log('Write failed: ' + e.toString());
                        throw e;
                    };

                    fileWriter.write(file.blob);

                }, errorHandler);

            }, errorHandler);
        });
    };

}
