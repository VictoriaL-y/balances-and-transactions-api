import "dotenv/config";
import express from "express";
import swaggerUi, { JsonObject } from "swagger-ui-express";
import swaggerDocument from "../swagger.json";
import { getDataFromAPI } from "./services/getDataFromAPI";
import { getHistoricalBalance } from "./services/getHistoricalBalances";

const apiKey: string = "b4a4552e-1eac-44ac-8fcc-91acca085b98-f94b74ce-aa17-48f5-83e2-8b8c30509c18"
const url: string = "https://uh4goxppjc7stkg24d6fdma4t40wxtly.lambda-url.eu-central-1.on.aws"

const app = express();

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/balances", async (req, res) => {
  const balanceRes = await getDataFromAPI(url + "/balances", apiKey);
  if (balanceRes.isSuccesfull) {
    console.log("Got the current balance");
  } else {
    console.log("Couldn't get the current balance");
  }
  const balance = res.status(balanceRes.data.status).json(balanceRes.dataFromAPI);

  return balance;
});

app.get("/transactions", async (req, res) => {
  let transactionsRes = await getDataFromAPI(url + "/transactions", apiKey);
  // sort array by descending date
  if (transactionsRes.isSuccesfull) {
    transactionsRes.dataFromAPI.transactions.sort((a: JsonObject, b: JsonObject) => {
      return Date.parse(b.date) - Date.parse(a.date);
    })
    const transactions = res.status(200).json(transactionsRes.dataFromAPI.transactions);
    console.log("Got all the transactions");
    return transactions;
  } else {
    console.log("Couldn't get the transactions");
    return res.status(transactionsRes.data.status).json(transactionsRes.data);
  }
});

app.get("/historical-balances", async (req, res) => {

  let dateFrom = req.query.from as string;
  let dateTo = req.query.to as string;
  let sort = req.query.sort as string;

  if (!dateFrom || !dateTo) {
    console.log("At least one date wasn't provided. Right now the date range starts on " + dateFrom + ", ends on " + dateTo);
    return res.status(400).json({
      message: 'Missing arguments, provide dates. See proper request format in Readme.dm'
    })
  }
  console.log("The date range starts on " + dateFrom + ", ends on " + dateTo + ", the sorting order is " + sort);

  // check the sort order specified by the user
  if (!sort) {
    sort = "desc"
  } else if (sort !== "desc" && sort !== "asc") {
    console.log("Invalid sort preference: " + sort);
    return res.status(400).json({
      message: 'Invalid sort preference. See proper request format in Readme.dm'
    });
  }

  const historicalBalance = await getHistoricalBalance(url, apiKey, dateFrom, dateTo, sort);
  return res.status(historicalBalance.status).json(historicalBalance.data);
});

// this is default in case of unmatched routes
app.use((req, res) => {
  if (req.url === '/favicon.ico') { // In order to prevent duplicated console.log
  } else {
    console.log("Invalid request, this route doesn't exist: " + req.url);
  }
  res.status(404).json({
    message: "Invalid request, this route doesn't exist"
  });
});

export default app;
