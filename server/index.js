//const express = require("express");
import express from "express";
//const cors = require("cors");
import cors from "cors";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { hexToBytes, toHex, utf8ToBytes } from "ethereum-cryptography/utils.js";

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": { balance: 100, privateKey: "", publicKey: "", address: "0x1" },
  "0x2": { balance: 50, privateKey: "", publicKey: "", address: "0x2" },
  "0x3": { balance: 75, privateKey: "", publicKey: "", address: "0x3" },
};

//generate key pair
for (const address in balances) {
  const privateKeyObject = secp256k1.utils.randomPrivateKey();
  const privateKey = bytesToHex (privateKeyObject)
  balances[address].privateKey = privateKey;

  const publicKeyObject = secp256k1.getPublicKey(privateKey);
  const publicKey = bytesToHex (publicKeyObject);
  balances[address].publicKey = publicKey;
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address].balance || 0;
  const privateKey = balances[address].privateKey;
  if (balance[address]) {
    res.send({ balance, privateKey });
  } else {
    res.status(404).send({ message: "Address not found!" });
  }
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature } = req.body;
  //verify signature
  const senderPublicKey = balances[sender].publicKey;
  const isVerified = secp256k1.verify(
    hexToBytes(signature),
    messageHash,
    hexToBytes(publicKey)
  );
  if (!isVerified) {
    res.status(400).send({ message: "Invalid signature!" });
    console.log("Invalid signature!");
    return;
  } else {
    console.log("Signature verified!");
    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender].balance < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender].balance -= amount;
      balances[recipient].balance += amount;
      res.send({ balance: balances[sender].balance });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address].balance) {
    balances[address].balance = 0;
  }
}
