const fs = require("fs");
const steem = require('steem');

var config = JSON.parse(fs.readFileSync("config.json"));

// Connect to the specified RPC node
var rpc_node = config.rpc_node ? config.rpc_node : 'https://api.steemit.com';
steem.api.setOptions({ transport: 'http', uri: rpc_node, url: rpc_node });

//setInterval(bot, 15 * 60 * 1000);
bot();


function bot(){
  console.log("Mecene bot starting...");
  console.log(config);
  console.log(config.account);
  const username = config.account;
  const postingWif = config.posting_key;
  const weight = parseInt(config.voting_weight) * 100;
  const delay = parseInt(config.voting_delay) * 60 * 1000;
  //console.log(config.blacklist)

  steem.api.streamOperations(function (err, operations) {

    operations.forEach(function (operation) {
      // we don't (want to) support comments for now
    	// so we filter them
      if (operation.parent_author != ""){
        //console.log("comment filtered: " + operation.permlink);
        return;
      }

      //blacklist
      if (config.blacklist.includes(operation.author)){
        console.log("Account blacklisted - post filtered: " + operation.permlink);
        return;
      }

      //whitelist with a 100%(10000) vote for now
      if (config.whitelist.includes(operation.author)){
        console.log("Account whitelisted - post sponsored: " + operation.permlink);
        setTimeout(function(){
          voter(username, postingWif, operation, 7000);
        }, delay);
        return;
      }

      //console.log(operation.json_metadata)
      meta = operation.json_metadata;
      if (meta !== undefined){
        metaJSON = JSON.parse(meta);
        //console.log(metaJSON.tags)
		    config.tags.forEach(function(tag){
          if (metaJSON.tags.includes(tag)){
            console.log("vote impeding on: " + operation.permlink);
            setTimeout(function(){
              //This is where the magic happens
              voter(username, postingWif, operation, weight);
            }, delay);
          }
        });
      }
    });
  });
}

function voter(username,postingWif,operation, weight,retry){
	steem.broadcast.vote(postingWif, username, operation.author, operation.permlink, weight, function(err, result) {
		console.log(err, result);
    if (err && retry<5){
			setTimeout(function(){
				//do what you need here
        retry++;
				voter(username, postingWif, operation, weight,retry);
				//console.log("voted on: " + operation.permlink);
			}, 4000);
		} else if (retry == 5){
      console.log("failed vote broadcast for: " + operation.permlink);
    } else {
      console.log("voted on: " + operation.permlink);
    }
	});
}
