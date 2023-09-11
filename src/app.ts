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
  const data = await getDataFromAPI(url + "/balances", apiKey);
  const balances = await res.json(data);
  return balances;
});

app.get("/transactions", async (req, res) => {
  let data = await getDataFromAPI(url + "/transactions", apiKey);

  // sort array by descending date
  data.transactions.sort((a: JsonObject, b: JsonObject) => {
    return Date.parse(b.date) - Date.parse(a.date);
  })



  // let processedTransactionsArr = data.transactions.filter((transaction: JsonObject) => {
  //   return transaction.status === 'PROCESSED';
  // })

  const transactions = await res.json(data.transactions);
  return transactions;
});

app.get("/historical-balances", async (req, res) => {

  let dateFrom = req.query.from as string;
  let dateTo = req.query.to as string;
  let sort = req.query.sort as string;

  if (!dateFrom || !dateTo) {
    return res.json({
      message: 'Missing arguments, provide dates. See proper request format in Readme.dm.'
    })

  }
  console.log(dateFrom)
  console.log(dateTo)
  console.log(sort)
  const historicalBalance = await getHistoricalBalance(url, apiKey, dateFrom, dateTo, sort);
  return res.json(historicalBalance);
});

// this is default in case of unmatched routes
app.use((req, res) => {
  console.log("Invalid request this route doesn't exist");
  res.json({
    error: {
      'status': 404,
      'title': "Not Found",
      'message': 'Invalid Request'
    }
  });
});

export default app;
