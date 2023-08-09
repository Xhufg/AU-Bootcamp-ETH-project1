const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

const secp = require('ethereum-cryptography/secp256k1');



app.use(cors());
app.use(express.json());
let isVerified = false;

const balances = {
  //priv : 7000c29dbf0ef170e22eac7b6a9637f9f34bc1f39d0d0a42d90d0cb94b76f15a
  //pubb : 02b38695d2129b3af8cc62a13f737ca5f221085323f9c7605fe51459a5df84a416
  "02b38695d2129b3af8cc62a13f737ca5f221085323f9c7605fe51459a5df84a416": 100,
  //priv : 04b3e4a7a43af7635c9bbb15530f5cd20ba9fc528e9fe5b29598f7b9d482151e
  //pubb : 02278e70cddbabb11951c1ff599e6a2bf833d2ff89a4075fc8c51f40526505c504
  "02278e70cddbabb11951c1ff599e6a2bf833d2ff89a4075fc8c51f40526505c504": 50,
  //priv : 0b76c58d771db4769a2d16bffa7090492ca63cb8ce65c0a1254796f3d2f6ffbe
  //pubb : 030b57cbd7293a020322af4052328b0c2a0521e76a33b01e620e0c36ab2448622f
  "030b57cbd7293a020322af4052328b0c2a0521e76a33b01e620e0c36ab2448622f": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  // TODO : get a signature from the client-side application
  // recover the pub address from the signature
  //Don't allow the sender to be sent through the request"

  // get a signature 
  const { sender, recipient, amount, signature, msgHash } = req.body;
  console.log('sender: ', sender);
  console.log(' recipient: ',recipient);
  console.log(' amount: ',amount);
  console.log(' signature: ',signature);
  console.log(' msgHash: ',msgHash);

  // recover signature
  let restoredSignature = JSON.parse(signature);
  restoredSignature.r = BigInt(restoredSignature.r);
  restoredSignature.s = BigInt(restoredSignature.s);

  console.log('signature restored:', restoredSignature );
  
  //restore pubkey not working also the old method also the new method

  //verify signature
  isVerified = secp.secp256k1.verify(restoredSignature, msgHash, sender);
  console.log('is verified: ', isVerified)

  //deny the transfer if the signature is invalid
  if (!isVerified) {
    res
      .status(400)
      .send({ message: "Unauthorized Transaction" });
    return;
  }    
  
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender], isVerified  });
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
