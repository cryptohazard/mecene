# mecene
*mécène: French for sponsor, donator, patron. [wiktionary](https://en.wiktionary.org/wiki/m%C3%A9c%C3%A8ne)*

This is a bot to support communities on the steem blockchain. It automatically *upvote* the chosen communities tags.

You can find a similar service here: [tagbot](https://github.com/emre/tagbot).

## Install nodejs & npm
You can skip this part if you have already installed nodejs/nmp.
```
$ sudo apt-get update
$ curl -sL https://deb.nodesource.com/setup_9.x | sudo -E bash -
$ sudo apt-get install -y nodejs
$ sudo apt-get install npm
$ sudo apt-get install nodejs-legacy
```
## Setup & Installation
Clone the project repository and install using NPM:

```
$ git clone https://github.com/cryptohazard/mecene.git
$ cd mecene
$ npm install
```
Update the configuration file ```config.json``` with your account and the posting private key (See description).

### Run in Docker
If you are using Docker, you can use the following commands:

```
docker build -t mecene .
docker run -itd --rm --name mecene mecene

Check the status with docker logs
docker logs mecene
```

### Run in background with PM2
You can use the PM2 software to manage and run your nodejs programs in background:
```
$ npm install pm2 -g
$ pm2 start app.js --name mecene
$ pm2 logs mecene
```

## Bot Configuration

Configuration is stored in the JSON ```config.json```.

|        Option       | Value                                                |
|:-------------------:|------------------------------------------------------|
| rpc_node            | a steem node to connect. Default is steemit API node |
| account             | bot account                                          |
| posting_key         | the private posting key of the bot account          |
| voting_weight       | vote weight (in percent) to apply on every vote      |
| tags                | communities tags to upvote posts like #fr, #art,...  |
| voting_delay        | waiting time before the actual vote                  |
| whitelist           | list of authors to automatically sponsor             |
| blacklist           | A list of authors to ignore                          |

## TODO
* vote weight per sponsored tags/authors
* additional criteria per tag:
  * reputation
  * author name
  * additional tags required
* voting power recovery:
  * vote at X% power
  * until power at Y%
  * then recover until Z% power
* blacklist downvote (I am not keen on that one)
