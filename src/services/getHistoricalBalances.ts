import { getDataFromAPI } from "./getDataFromAPI";
import { JsonObject } from "swagger-ui-express";

export async function getHistoricalBalance<T>(url: string, apiKey: string, dateFrom: string, dateTo: string, sort: string) {
  //get all the transactions from the API
  let data = await getDataFromAPI(url + "/transactions", apiKey);

  // check if the data that user entered is invalid
  if (checkDatesFormatValidity(dateFrom, dateTo)) {
    return ({
      message: 'Invalid dates format. See proper request format in Readme.dm.'
    }); 
  }

  if(checkDatesExistence(dateFrom, dateTo)) {
    return ({
      message: "At least one of the dates don't exist (e.g. Feb 29th). Please check your input"
    }); // NaN value
  }

  // transform the dates the user entered from YYYY-MM-DD to YYYY-MM-DD'T'HH:mm:ss.fff'Z'
  dateFrom += 'T00:00:00.000Z';
  dateTo += 'T23:59:59.999Z';
  console.log(dateFrom + " is dFrom")
  console.log(dateTo + " is dTo")

  // sort the transactions array by descending date
  data.transactions.sort((a: JsonObject, b: JsonObject) => {
    return Date.parse(b.date) - Date.parse(a.date);
  })

  // get a period from today(30/06/2022) until the beginning of the transactions history
  // and get only processed transactions from the current date until the date of the specified period's end
  let processedTransactionsArr = data.transactions.filter((transaction: JsonObject) => {
    return Date.parse(transaction.date) > Date.parse(dateTo) && transaction.status === "PROCESSED";
  })

  // get the current balance from the API
  const balanceData = await getDataFromAPI(url + "/balances", apiKey);
  const currentBalance = await balanceData.amount

  // calculate the balance that the client had at the end of the specified period
  // subtract from the current balance all processed transactions:
  const initialBalance = currentBalance + processedTransactionsArr.reduce((sum: number, transaction: JsonObject) => sum - transaction.amount, 0)
  console.log(currentBalance);
  console.log(initialBalance);

  return getDailyBalance(data.transactions, initialBalance, dateFrom, dateTo, sort);
}

function checkDatesFormatValidity(dateFrom: string, dateTo: string) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  return !dateFrom.match(regEx) || !dateTo.match(regEx) 
}

function checkDatesExistence(dateFrom: string, dateTo: string) {
  let dFrom = new Date(dateFrom);
  let dNumFrom = dFrom.getTime();
  let dTo = new Date(dateTo);
  let dNumTo = dTo.getTime();

  // console.log(dFrom.toISOString().slice(0, 10) === dateFrom);
  // console.log(dTo.toISOString().slice(0, 10) === dateTo);

  return (!dNumFrom && dNumFrom !== 0) || (!dNumTo && dNumTo !== 0)
}

function getDailyBalance(transactions: Array<JsonObject>, initialBalance: number, dateFrom: string, dateTo: string, sort: string) {

  let dailyBalanceArr = [];
  let tempDate = "";

  // get all processed transactions
  transactions = transactions.filter((transaction: JsonObject) => transaction.status === "PROCESSED");

  // fill the array with objects to get the final result
  for (let transaction of transactions) {

    if (Date.parse(transaction.date) >= Date.parse(dateFrom)
      && Date.parse(transaction.date) <= Date.parse(dateTo)) {

      initialBalance -= transaction.amount;

      // get date in format DD/MM/YYYY
      let dateInNewFormat = transaction.date.slice(0, 10).split('-').reverse().join('/')

      if (tempDate === dateInNewFormat) {
        continue;
      } else {
        if (sort === "desc" || !sort) { // it'll be possible to use the route without sort parameter and by default the order will be descendent
          dailyBalanceArr.push(
            {
              date: dateInNewFormat,
              amount: initialBalance,
              currency: transaction.currency
            });
        } else if (sort === "asc") {
          dailyBalanceArr.unshift(
            {
              date: dateInNewFormat,
              amount: initialBalance,
              currency: transaction.currency
            });
        } else {
          return ({
            message: 'Invalid sort preference. See proper request format in Readme.dm.'
          })
        }

        tempDate = dateInNewFormat;

      }
    }
  }
  console.log(dailyBalanceArr);

  return dailyBalanceArr;
}
