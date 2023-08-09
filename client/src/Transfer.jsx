import { useState } from "react";
import server from "./server";

import * as secp from 'ethereum-cryptography/secp256k1';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { toHex, utf8ToBytes } from 'ethereum-cryptography/utils';

function Transfer({ address, setBalance, privateKey, isVerified, setIsVerified}) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  const msg = "on point!";

  async function transfer(evt) {
    evt.preventDefault();

    try {

      console.log("sendAmount: ", sendAmount);
      console.log("address: ", address);
      console.log("recipient: ", recipient);

      //hash message
      const msgHash = toHex(keccak256(utf8ToBytes(msg)));
      console.log("msgHash: ", msgHash);


      //sign the transaction
      let signature = secp.secp256k1.sign(msgHash, privateKey);
      console.log(signature);

      //change signature to JSON format
      signature = JSON.stringify({
        ...signature,
        r: signature.r.toString(),
        s: signature.s.toString(),
      });
      console.log('signature json string: ', signature);

      //send signature, sender address, amount to transfer to the server

      const {
        data: { balance, isVerified},
      } = await server.post(`send`, {
        sender: address,
        recipient,
        amount: parseInt(sendAmount),
        signature: signature,
        msgHash: msgHash,
        msg: msg,
      });

      setBalance(balance);
      setIsVerified(isVerified);
      console.log('isVerified: ', isVerified);
    } catch (ex) {
      isVerified = false;
      setIsVerified(isVerified);
      alert(ex.response.data.message);
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
        Recipient Public Key
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>
      <div>
        Private Key to sign transaction:{" "}
        {privateKey.slice(0, 5) + "....." + privateKey.slice(-5)}
      </div>
      <input type="submit" className="button" value="Approve Transfer" />

      <h2 className="isVerified" id="status">Transaction status: {isVerified ? "Successfull" : "Not Authorized"}</h2>
    </form>
  );
}

export default Transfer;
