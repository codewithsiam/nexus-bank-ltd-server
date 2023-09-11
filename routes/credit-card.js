const express = require("express");
const { userAccountCollection, creditCardCollection } = require("..");
const router = express.Router();

router.post("/apply-credit-card", async (req, res) => {
  const creditCard = req.body;
  creditCard.status = "pending";
  const existingAccount = await userAccountCollection.findOne({
    accountNumber: creditCard.accountNumber,
    status: "approved",
    account_type: "Current Account",
    nid_card_number:creditCard.nidCardNumber
  });
  const existingCreditCard = await creditCardCollection.findOne({accountNumber:creditCard.accountNumber});
  if (!existingAccount) {
    return res.send({ message: "You Have No Current Account" });
  }
  if(existingCreditCard){
    return res.send({message:"You Already Have A Credit Card For This Account"})
  }
  const result = await creditCardCollection.insertOne(creditCard);
  res.send(result);
});

module.exports = router;
