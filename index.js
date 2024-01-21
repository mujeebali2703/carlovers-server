const express = require("express");
const CarQuery = require('carquery-api');
const app = express();
require("dotenv").config();
const stripe = require("stripe")("sk_test_51L4sVRKDWgvpMn9hU8jPB7MelGrd7haSRLdT69aBsh4x9DUZKg4pFqtG5ydPrq9bQJ91EbDp1Zx0uqwBF0nx9q5O00zqg2H8aN");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require('axios');
const https = require("https");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

axios.defaults.timeout = 30000;
axios.defaults.httpsAgent = new https.Agent({ keepAlive: true });

app.get("/", (req, res) => {
  res.send("Hello");
});

app.post('/carapilogin', async (req, res) => {
  const { api_secret, api_token } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Authorization', `Bearer ${api_token}`);
  try {
    await axios.post("https://carapi.app/api/auth/login", {
      "api_token": api_token,
      "api_secret": api_secret
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer 1abb2d1b-8bfe-47bb-88c7-86122b08ab9b'
      }
    }).then((response) => {
      res.send(response.data);
    });
  } catch (error) {
    console.log(error.message)
    return res.send({ error: { message: error.message } });
  }
});

app.post('/carapiyears', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    await axios.get("https://carapi.app/api/years").then((response) => {
      res.send(response.data);
    });
  } catch (error) {
    console.log(error)
    return res.send({ error: { message: error.message } });
  }
});

app.post('/carapimakes', async (req, res) => {
  let { year } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);

  try {
    await axios.get("https://carapi.app/api/makes", { year }).then((response) => {
      res.send(response.data);
    });
  } catch (error) {
    console.log(error)
    return res.send({ error: { message: error.message } });
  }
});

app.post('/carapimodel', async (req, res) => {
  let { year, make, token } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Authorization', `Bearer ${token}`);
  try {
    await axios.get(`https://carapi.app/api/models?verbose=yes&year=${year}&make=${make}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }).then((response) => {
      res.send(response.data);
    });
  } catch (error) {
    console.log(error)
    return res.send({ error: { message: error.message } });
  }
});


// -------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/createcustomer", cors(), async (req, res) => {
  let { email, city, line1, line2, zipcode, state, name, country, phone } = req.body;
  console.log("Email", email);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const customer = await stripe.customers.create({
      email: email,
      name: name,
      address: {
        city: city,
        country: country,
        line1: line1,
        line2: line2,
        postal_code: zipcode,
        state: state,
      },
      balance: 0,
      phone: phone,
      shipping: {
        address: {
          city: city,
          country: country,
          line1: line1,
          line2: line2,
          postal_code: zipcode,
          state: state,
        },
        name: name,
        phone: phone
      },
    });
    res.send(customer);
  } catch (error) {
    res.send(error);
  }
});

app.post("/getcustomerbyemail", cors(), async (req, res) => {
  let { email } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const customers = await stripe.customers.list({
      email
    });
    res.send(customers);
  } catch (error) {
    res.send(error);
  }
});

app.post("/getcustomerbyid", cors(), async (req, res) => {
  let { id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const customer = await stripe.customers.retrieve(id);
    res.send(customer);
  } catch (error) {
    res.send(error);
  }
});

app.post("/getcustomerconnectaccount", cors(), async (req, res) => {
  let { id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const customer = await stripe.customers.retrieve(id);
    const accountId = customer.metadata.connectAccountId;
    const connectAccount = await stripe.accounts.retrieve(accountId);
    res.send(connectAccount);
  } catch (error) {
    res.send(error);
  }
});

app.post("/custom_account", async (req, res) => { // needs to recieve the bank account or credit card here and pass in object
  // console.log("work in fun")
  let { mcc, first_name, last_name, day, month, year, email, phone, ssn_last_4, state, city, postal_code, line1, bank_name, bank_country, bank_currency, bank_account_number, bank_account_routing_number, account_holder_name, account_holder_type, front_document } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const account = await stripe.accounts.create({
      country: 'US',
      type: 'custom',
      business_type: 'individual',
      business_profile: {
        mcc: mcc,
        url: 'carlovers.com',
      },
      individual: {
        first_name: first_name,
        last_name: last_name,
        dob: {
          day: day,
          month: month,
          year: year
        },
        email: email,
        phone: phone,
        ssn_last_4: ssn_last_4,
        address: {
          state: state,
          city: city,
          postal_code: postal_code,
          line1: line1,
        }
      },
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      tos_acceptance: {
        date: Math.floor(Date.now() / 1000),
        ip: req.connection.remoteAddress,
      },
      bank_account: {
        object: 'bank_account',
        bank_name: bank_name,
        country: bank_country,
        currency: bank_currency,
        account_number: bank_account_number,
        routing_number: bank_account_routing_number,
        accounter_holder_name: account_holder_name,
        account_holder_type: account_holder_type,
      },
      // payouts_enabled:true
      // documents:{
      //     front: front_document,
      // }
      //needs bank account or credit card here

    });
    res.send(account.id);
  } catch (ex) {
    res.send(ex);
  }
  //   console.log("Response of stripe :",account)
  //   console.log("Response of stripe ID :",account.id)


});


app.post('/create-account-link', async (req, res) => {
  let { id, base } = req.body;
  try {
    const accountLink = await stripe.accountLinks.create({
      account: id, // Replace with your actual connected account ID
      refresh_url: `${base}/onboardingerror`,
      return_url: `${base}/onboardingsuccess`,
      type: 'account_onboarding',
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post("/attachpaymentmethod", async (req, res) => {
  let { id, customer } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const paymentMethod = await stripe.paymentMethods.attach(
      id,
      { customer }
    );
    res.send(paymentMethod);
  } catch (error) {
    res.send(error);
  }

})

app.post("/createcardpaymentmethod", async (req, res) => {
  let { card } = req.body;
  const { creditCardNumber, name, validMonth, validYear, cvcc } = card;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: creditCardNumber,
        exp_month: validMonth,
        exp_year: validYear,
        cvc: cvcc,
      },
    });
    res.send(paymentMethod);
  } catch (error) {
    res.send(error);
  }
})

app.post("/createcardtoken", async (req, res) => {
  let { card } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const token = await stripe.tokens.create({
      card
    });
    res.send(token);
  } catch (error) {
    res.send(error);
  }
});

app.post("/createusbanktoken", async (req, res) => {
  let { country = "US", currency = "usd", account_holder_name, routing_number, account_number } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const token = await stripe.tokens.create({
      bank_account: {
        country,
        currency,
        account_holder_name,
        account_holder_type: 'individual',
        routing_number,
        account_number,
      },
    });
    res.send(token);
  } catch (error) {
    res.send(error);
  }
});

app.post("/createpaymentmethod", async (req, res) => {
  let { customer, token } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const bankAccount = await stripe.customers.createSource(
      customer,
      { source: token }
    );
    res.send(bankAccount);
  } catch (error) {
    res.send(error);
  }
});

app.post("/verifybankaccount", async (req, res) => {
  let { customer, token } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const bankAccount = await stripe.customers.verifySource(
      customer,
      token,
      { amounts: [32, 45] }
    );
    res.send(bankAccount);
  } catch (error) {
    res.send(error);
  }
});

app.post("/listbankaccounts", async (req, res) => {
  let { customer } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const bankAccounts = await stripe.customers.listSources(
      customer,
      { object: 'bank_account' }
    );
    res.send(bankAccounts);
  } catch (error) {
    res.send(error);
  }
});

app.post("/listcustomerpaymentmetnodscards", async (req, res) => {
  let { customer } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const paymentMethods = await stripe.customers.listPaymentMethods(
      customer,
      { type: 'card' }
    );
    res.send(paymentMethods);
  } catch (error) {
    res.send(error);
  }
});

app.post("/deletecreditcard", async (req, res) => {
  let { customer, id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const deleted = await stripe.customers.deleteSource(
      customer,
      id
    );
    res.send(deleted);
  } catch (error) {
    res.send(error);
  }
});

app.post("/deletebankaccount", async (req, res) => {
  let { customer, id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const deleted = await stripe.customers.deleteSource(
      customer,
      id
    );
    res.send(deleted);
  } catch (error) {
    res.send(error);
  }
});

// -------------------------------------------------------------------------------------------------------------------------------------------------
app.post("/payment", cors(), async (req, res) => {
  let { amount, id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    // console.log("Staring CarloversPayment");
    console.log(amount);
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "Payment For Service",
      payment_method: id,
      confirm: true
    });

    console.log("Ending CarloversPayment");
    res.json({
      message: "Payment Successful",
      success: true
    });

  } catch (error) {
    // console.log(error);
    // res.json({
    //     message:"Payment Failed",
    //     success:false
    // });
    res.send(error);
  }
  // res.send("Processing Payment");
})


app.post("/createsetupintent", cors(), async (req, res) => {
  let { customerid } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerid,
      payment_method_types: ['card'],
    });
    res.send(setupIntent);
  } catch (error) {
    res.send(error);
  }
})

app.post("/createpaymentintent", async (req, res) => {
  let { customerid, amount, paymentmethodid } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      customer: customerid,
      setup_future_usage: 'off_session',
      amount: amount * 100,
      currency: 'usd',
      payment_method: paymentmethodid,
    });
    res.send(paymentIntent);
  } catch (error) {
    res.send(error);
  }
});


app.post("/confirmpaymentintent", async (req, res) => {
  let { paymentintentid } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const paymentIntent = await stripe.paymentIntents.confirm(
      paymentintentid,
      { payment_method: 'pm_card_visa' }
    );
    res.send(paymentIntent);
  } catch (error) {
    res.send(error);
  }
});



app.post('/createsubscription', async (req, res) => {
  let { customerID, priceID } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerID,
      items: [{
        price: priceID,
      }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    res.send(subscription);
    // res.send(subscription)
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/payinvoice', async (req, res) => {
  let { id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const invoice = await stripe.invoices.pay(
      id
    );
    res.send(invoice);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});



app.post('/cancelsubscription', async (req, res) => {
  let { subcID } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const deleted = await stripe.subscriptions.del(
      `${subcID}`
    );

    res.send(deleted);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/updatesubscription', async (req, res) => {
  let subcID = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const subscription = await stripe.subscriptions.update(
      subcID
    );

    res.send(subscription);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/getsubscriptions', async (req, res) => {
  let { subcID } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const subscription = await stripe.subscriptions.retrieve(
      subcID
    );

    res.send(subscription);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/getcustomersubscriptions', async (req, res) => {
  let { id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const subscriptions = await stripe.subscriptions.list({ customer: id });
    res.send(subscriptions);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/getcustomerinvoices', async (req, res) => {
  let { customerid } = req.body;
  console.log(customerid)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const invoices = await stripe.invoices.list({
      customer: customerid
    });

    res.send(invoices);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/getcustomercharges', async (req, res) => {
  let { customerid } = req.body;
  console.log(customerid)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const charges = await stripe.charges.list(
      {
        customer: customerid
      }
    );

    res.send(charges);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.get('/getproducts', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const products = await stripe.products.list({
      active: true
    });

    res.send(products);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/getprice', async (req, res) => {
  let { id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const price = await stripe.prices.retrieve(id);
    res.send(price);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/getcustomerbankaccounts', async (req, res) => {
  let { id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const bankAccounts = await stripe.customers.listSources(id, { object: 'bank_account' });
    res.send(bankAccounts);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});

app.post('/getcustomercreditcards', async (req, res) => {
  let { id } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const cards = await stripe.customers.listSources(id, { object: 'card' });
    res.send(cards);
  } catch (error) {
    return res.status(400).send({ error: { message: error.message } });
  }
});


app.post("/listpaymentmethods", cors(), async (req, res) => {
  let { customerid } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerid,
      type: 'card',
    });
    res.send(paymentMethods);
  } catch (error) {
    res.send(error);
  }
});


app.post("/driverpayment", cors(), async (req, res) => {
  let { amount, id, driverstripe } = req.body;
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  try {
    console.log("Staring Driver Payment");
    // Create a Transfer to the connected account (later):
    const transfer = await stripe.transfers.create({
      amount: amount,
      currency: 'usd',
      destination: driverstripe,
    });


    console.log("Ending Driver Payment");
    // res.json({
    //     message:"Payment Successful",
    //     success:true
    // });
    res.send(transfer);

  } catch (error) {
    console.log(error);
    // res.json({
    //     message:"Payment Failed",
    //     success:false
    // });
    res.send(error);
  }
  // res.send("Processing Payment");
})



app.listen(process.env.PORT || 3001, () => {
  console.log("Server is Listening on PORT : " + process.env.PORT);
});