const { connect, transactions, keyStores, Contract, KeyPair  } = require("near-api-js");
const express = require('express');
const router = express.Router();
const path = require("path");
const app = express();
let port = process.env.PORT || 3000;

const CREDENTIALS_DIR = ".near-credentials";
const CONTRACT_NAME = "nosugar.testnet";
const PRIVATE_KEY =
  "9nWTczNTNQjKiVqmc82ZCpNjLoAxyMSJYpP2avtMwDQ8UnznYAPApQcNfMiBBNHSMvSekvArijtPVvuwwYTKieu";
  const keyPair = KeyPair.fromString(PRIVATE_KEY);

const credentialsPath = path.join('./', CREDENTIALS_DIR);
console.log(credentialsPath)
const keyStore = new keyStores.InMemoryKeyStore();
// const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
    keyStore,
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
  };

sendTransactions();

async function sendTransactions() {
    await keyStore.setKey("testnet", CONTRACT_NAME, keyPair);
  const near = await connect({ ...config, keyStore });
  const account = await near.account(CONTRACT_NAME);

  const contract = new Contract(
    account, // the account object that is connecting
    "votekmutnb.nosugar.testnet",
    {
        // name of contract you're connecting to
        viewMethods: [
        "getAlltopic",
        "getCandidateList",
        "getEventScore",
        "getUserVotedList",
        "didVoted",
        "test",
        ],
        // Change methods can modify the state. But you don't receive the returned value when called.
        changeMethods: [
        "addToTopicArray",
        "addCandidate",
        "addVote",
        "eventEnd",
        "clearTopicArray",
        "addNum"
        ], // change methods modify state
    }
  );

  //await contract.getAlltopic({topic:"A",});
  // await contract.addCandidate({topic:"A",name:"ing"})
  // await contract.addCandidate({topic:"A",name:"keen"})
  // await contract.addCandidate({topic:"A",name:"mike"})
  // const a = await contract.addNum({a:1,b:2})
  // console.log(a);
  // const b = await contract.test({})
  // console.log(b);

    router.get('/',(req,res)=>{

        res.json({
            "title": "home page"
        })
    });

    //view method
    router.get("/test", async(req,res)=>{
            let test = await contract.test({});

            res.json({
                "title": test
            })
        });

    router.get("/getAlltopic", async(req,res)=>{
        let getAlltopic = await contract.getAlltopic({});

        res.json({
            "allTopic": getAlltopic
        })
    });

    router.get("/getCandidateList/:topic", async(req,res)=>{
        let topic = ({topic:req.params.topic});
        let getCandidateList = await contract.getCandidateList({topic:req.params.topic});

        res.json({
            "topic": req.params.topic,
            "candidate": getCandidateList
        })
    });

    router.get("/getEventScore/:event", async(req,res)=>{
        let event = ({event:req.params.event});
        let getEventScore = await contract.getEventScore({event:req.params.event});

        res.json({
            "event": req.params.event,
            "score": getEventScore
        })
    });

    router.get("/getUserVotedList/:topic", async(req,res)=>{
        let topic = ({topic:req.params.topic});
        let getUserVotedList = await contract.getUserVotedList({topic:req.params.topic});

        res.json({
            "topic": req.params.topic,
            "user": getUserVotedList
        })
    });

    router.get("/didVoted/:topic/:user", async(req,res)=>{
        let topic = ({topic:req.params.topic});
        let user = ({user:req.params.user});
        let didVoted = await contract.didVoted({topic:req.params.topic, user:req.params.user});

        res.json({
            "topic": req.params.topic,
            "user": user,
            "voted": didVoted
        })
    });

    router.get("winner/:topic", async(req,res)=>{
        let topic = ({topic:req.params.topic});
        let candidateList = [await contract.getCandidateList({topic:req.params.topic})];
        let score = [await contract.getEventScore({event:req.params.topic})];
        let most = 0;
        let tmpArr = [];
        for(i = 0 ; i <= score.length ; i++){
            if(score[i]>most) most = score[i];
          }
          for(i = 0 ; i <= candidateList.length ; i++){
            if(score[i]===most) tmpArr.push(candidateList[i]);
          }

          res.json({
            "topic": req.params.topic,
            "winner": tmpArr,
            "score": most
        })
    });
    
    //change method

    // router.get("/addnum/:a/:b", async(req,res)=>{
    //     const numA = i32.req.params.a 
    //     const numB = i32.req.params.b
    //     const add = await contract.addNum({a:numA ,b:numB})
    //     res.send('result = ' + add)
    // });

    router.get("/addToTopicArray/:topic", async(req,res)=>{
        let topic = ({topic:req.params.topic});
        const addToTopicArray = await contract.addToTopicArray({topic:req.params.topic});

        res.json({
            "topic": req.params.topic,
            "addToTopicArray": addToTopicArray, 
            })
    });

    router.get("/addCandidate/:topic/:name", async(req,res)=>{
        let topic = ({topic:req.params.topic});
        let candidate = ({name:req.params.name});
        const addCandidate = await contract.addCandidate({topic:req.params.topic,name:req.params.name});

        res.json({
            "topic": req.params.topic,
            "candidate": req.params.name,
            "addCandidate": addCandidate
        })
    });

    router.get("/addVote/:topic/:name/:user", async(req,res)=>{
        let topic = ({topic:req.params.topic});
        let candidate = ({name:req.params.name});
        let user = {user:req.params.user};
        const addVote = await contract.addVote({topic:req.params.topic, name:req.params.name, user:req.params.user});
        res.json({
            "topic": req.params.topic,
            "candidate": req.params.name,
            "user": req.params.user,
            "addVote": addVote
        })
    });

    router.get("/eventEnd/:topic", async(req,res)=>{
        let topic = ({topic:req.params.topic});
        const eventEnd = await contract.eventEnd({topic:req.params.topic});
        res.json({
            "topic": req.params.topic,
            "eventEnd": eventEnd
        })
    });

    router.get("/clearTopicArray/", async(req,res)=>{
        const clearTopicArray = await contract.clearTopicArray({});
        res.json({
            "status": "Done", 
            "clearTopicArray": clearTopicArray
        })
    });

};

app.use(router);
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
});

module.exports = app