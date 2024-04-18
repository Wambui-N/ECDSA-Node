//const express = require("express");
import express from "express";
//const cors = require("cors");
import cors from "cors";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";


const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x1": { balance: 100, privateKey: "", publicKey: "", address: "0x1" },
  "0x2": { balance: 50, privateKey: "", publicKey: "", address: "0x2" },
  "0x3": { balance: 75, privateKey: "", publicKey: "", address: "0x3" },
};

//generate a key pair
for (const address in balances) {
  const privateKeyObject = secp256k1.utils.randomPrivateKey();
  const privateKey = Object.values(privateKeyObject)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  balances[address].privateKey = privateKey;

  const publicKeyObject = secp256k1.getPublicKey(privateKey);
  const publicKey = Object.values(publicKeyObject)
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
  balances[address].publicKey = publicKey;
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
