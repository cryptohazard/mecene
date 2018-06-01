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
  //console.log(config);
  console.log("Bot account: ",config.account);
  const username = config.account;
  const postingWif = config.posting_key;
  const weight = config.voting_weight ? parseInt(config.voting_weight) * 100 : 100 * 100;
  const delay = config.voting_delay ? parseInt(config.voting_delay) * 60 * 1000 : 30 * 60 * 1000;
  const minimum_power = config.minimum_power ? parseInt(config.minimum_power) * 100 : 10 * 100;
  const whitelist_power = config.whitelist_power ? parseInt(config.whitelist_power) * 100 : 70 * 100;
  const minimum_reputation = config.minimum_reputation ? parseInt(config.minimum_reputation) : 25;
  const maximum_reputation = config.maximum_reputation ? parseInt(config.maximum_reputation) : 70;

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

      //whitelist with a whitelist_power vote
      if (config.whitelist.includes(operation.author)){
        console.log("Account whitelisted - post sponsored: " + operation.permlink);
        setTimeout(function(){
          voter(username, postingWif, operation, weight, minimum_power, minimum_reputation, maximum_reputation, 0);
        }, delay);
        return;
      }

      meta = operation.json_metadata;
      if (meta !== undefined){
        metaJSON = JSON.parse(meta);
		    config.tags.forEach(function(tag){
          if (metaJSON.tags.includes(tag)){
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

function voter(username,postingWif,operation, weight, minimum_power, minimum_reputation, maximum_reputation, retry){
  //check we have enough voting power
  steem.api.getAccounts([username], function(errr, response) {
    if (errr)
      console.log(err);

    if (parseInt(response[0].voting_power) < minimum_power ){
      console.log("Voting power too low to proceed!")
      return;
    }
    steem.api.getAccounts([operation.author], function(er, resp) {
      if (er)
        console.log(er);
      var reputation = steem.formatter.reputation(resp[0].reputation);
      if (reputation < minimum_reputation){
        console.log("Account ", operation.author, " has a too low reputation ", reputation);
        return;
      }
      if (reputation > maximum_reputation){
        console.log("Account ", operation.author, " has a too big reputation ", reputation);
        return;
      }

      console.log("vote impeding on: " + operation.permlink);
      steem.broadcast.vote(postingWif, username, operation.author, operation.permlink, weight, function(err, result) {
    		console.log(err, result);

        console.log ("retry",retry++)
        if (err && retry<5){
    			setTimeout(function(){
    				//do what you need here
            retry++;
    				voter(username, postingWif, operation, weight, minimum_power, minimum_reputation, maximum_reputation, retry);
    				//console.log("voted on: " + operation.permlink);
    			}, 4000);
    		} else if (retry == 5){
          console.log("failed vote broadcast for: " + operation.permlink);
        } else {
          console.log("voted on: " + operation.permlink);
        }
    	});
    });
  });
}
