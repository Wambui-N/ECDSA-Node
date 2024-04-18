import { useState } from "react";
import server from "./server";
import { hexToBytes, toHex, utf8ToBytes } from "ethereum-cryptography/utils.js";
import { keccak256 } from "ethereum-cryptography/keccak.js";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";


function Transfer({ address, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [privateKey, setPrivateKey] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    try {
      //send transaction to server
      const signature = await signTransaction(sendAmount, recipient, address);
      const {
        data: { balance },} = await server.post(`send`, {sender: address, amount: parseInt(sendAmount), recipient, signature});
      setBalance(balance);
    } catch (ex) {
      alert(ex.response.data.message);
    }
  }

  async function signTransaction(sendAmount, recipient, address) {
    try {
      // sign transaction
      const dataHash = keccak256(utf8ToBytes(sendAmount + recipient + address));
      const {
        data: { privateKey },
      } = await server.get(`balance/${address}`);
      setPrivateKey(privateKey);
      const { r, s, v } = secp256k1.sign(dataHash, privateKey);
      return {r, s, v};
    } catch (error) {
      console.log("Error signing transaction:", error);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
