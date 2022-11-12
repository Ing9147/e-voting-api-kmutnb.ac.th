const { connect, transactions, keyStores, Contract } = require("near-api-js");
const express = require('express');
const router = express.Router();
const path = require("path");
const app = express();
let port = process.env.PORT || 3000;

const CREDENTIALS_DIR = ".near-credentials";
const CONTRACT_NAME = "nosugar.testnet";

const credentialsPath = path.join('./', CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
    keyStore,
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
  };

sendTransactions();

async function sendTransactions() {
  const near = await connect({ ...config, keyStore });
  const account = await near.account(CONTRACT_NAME);

  const contract = new Contract(
    account, // the account object that is connecting
    "nearvote.nosugar.testnet",
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

  // await contract.getAlltopic({topic:"A",});
  // await contract.addCandidate({topic:"A",name:"ing"})
  // await contract.addCandidate({topic:"A",name:"keen"})
  // await contract.addCandidate({topic:"A",name:"mike"})
  // const a = await contract.addNum({a:1,b:2})
  // console.log(a);
  // const b = await contract.test({})
  // console.log(b);

    router.get('/',(req,res)=>{
        res.json({title: "home page"})
    });

    //view method
    router.get("/test", async(req,res)=>{
            const test = await contract.test({});
            res.json({title: test})
        });

    router.get("/getAlltopic", async(req,res)=>{
        const getAlltopic = await contract.getAlltopic({});
        res.json({topic: getAlltopic})
    });

    router.get("/getCandidateList/:topic", async(req,res)=>{
        const getCandidateList = await contract.getCandidateList({topic:req.params.topic});
        res.json({candidate: getCandidateList})
    });

    router.get("/getEventScore/:event", async(req,res)=>{
        const getEventScore = await contract.getEventScore({event:req.params.event});
        res.json({score: getEventScore})
    });

    router.get("/getUserVotedList/:topic", async(req,res)=>{
        const getUserVotedList = await contract.getUserVotedList({topic:req.params.topic});
        res.json({user: getUserVotedList})
    });

    router.get("/didVoted/:topic/:user", async(req,res)=>{
        const didVoted = await contract.didVoted({topic:req.params.topic, user:req.params.user});
        res.json({voted: didVoted})
    });
    
    //change method

    // router.get("/addnum/:a/:b", async(req,res)=>{
    //     const numA = i32.req.params.a 
    //     const numB = i32.req.params.b
    //     const add = await contract.addNum({a:numA ,b:numB})
    //     res.send('result = ' + add)
    // });

    router.get("/addToTopicArray/:topic", async(req,res)=>{
        const addToTopicArray = await contract.addToTopicArray({topic:req.params.topic});
        res.json({"status": "Done", addToTopicArray})
    });

    router.get("/addCandidate/:topic/:name", async(req,res)=>{
        const addToTopicArray = await contract.addToTopicArray({topic:req.params.topic,name:req.params.name});
        res.json({"status": "Done", addCandidate})
    });

    router.get("/addVote/:topic/:name/:user", async(req,res)=>{
        const addVote = await contract.addVote({topic:req.params.topic, name:req.params.name, user:req.params.user});
        res.json({"status": "Done", addVote})
    });

    router.get("/eventEnd/:topic", async(req,res)=>{
        const eventEnd = await contract.eventEnd({topic:req.params.topic});
        res.json({"status": "Done", eventEnd})
    });

    router.get("/clearTopicArray/", async(req,res)=>{
        const clearTopicArray = await contract.clearTopicArray({});
        res.json({"status": "Done", clearTopicArray})
    });

};

app.use(router);
app.listen(port,()=>{
    console.log(`http://localhost:${port}`)
});

module.exports = app