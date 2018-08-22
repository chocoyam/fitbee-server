var pythonShell = require('python-shell');
var lua = require('luanode-runtime');

exports.train = function(){
    //transpose
    pythonShell.run('pyFiles/align-dlib.py', function (err, results){
        if (err) throw err;
        console.log('success!!!!!!!!!!!!!!!!');
        //th fit_embedding.lua -outDir ./embed/ -data ./members/
        //embedding
        //lua.runLoadedScript("pyFiles/embedding.lua", function(err, results) { 
		//	if (err) throw err;

            //python fit_train.py
            //train

		//});
    });
}