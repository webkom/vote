var mongojs = require('mongojs');
var prompt = require('prompt');
var db = mongojs('localhost:27017/vote',['users']);

console.log("Press 'q' to exit at prompt");

function toggleUser(cardKey){
    var activated;
    var username;
    db.users.findOne({cardKey: cardKey}, function(err, docs){
	    if (err || !docs) {
            console.log("Error: User not found");
            loop();
        } else {
            activated = !docs.active;
            username = docs.username;
            db.users.update({cardKey:cardKey},{$set: {active: activated}}, function(){
                if (!activated) {
                    console.log('User ' + username + ' deactivated');
                } else {
                    console.log('User ' + username + ' activated');
                }
                loop();                

            });
        } 
	});
}


function loop(){	
    prompt.get(['cardKey'], function(err, result){
    	if (result.cardKey === 'q'){
	    console.log('Exiting');
	    db.close();
	} else {
 	    toggleUser(result.cardKey);
	}

    });
}

loop();

