import { getDataFromAPI } from "./getDataFromAPI";
import { JsonObject } from "swagger-ui-express";

export async function getHistoricalBalance<T>(url: string, apiKey: string, dateFrom: string, dateTo: string, sort: string) {
  //get all the transactions from the API
  const transactionsRes = await getDataFromAPI(url + "/transactions", apiKey);
  const balanceRes = await getDataFromAPI(url + "/balances", apiKey);

  if (transactionsRes.isSuccesfull && balanceRes.isSuccesfull) {
    console.log("Succesfully got all the transactions and balance data");
    // check if the data that user entered is invalid
    if (checkDatesFormatValidity(dateFrom, dateTo)) {
      console.log("Invalid dates format: " + dateFrom + " or/and " + dateTo);
      return ({
        message: 'Invalid dates format. See proper request format in Readme.dm'
      });
    }

    if (checkDatesExistence(dateFrom, dateTo)) {
      console.log("At least one of the dates doesn't exist: " + dateFrom + " or/and " + dateTo);
      return ({
        message: "At least one of the dates doesn't exist (e.g. Feb 29th). Please check your input"
      }); // NaN value
    }

    if(checkDateRangeValidity(dateFrom, dateTo)) {
      console.log("The start date " + dateFrom + " is later that the end date " + dateTo);
      return ({
        message: "The start date is later than the end date. Please check your input"
      });
    }

    // transform the dates the user entered from YYYY-MM-DD to YYYY-MM-DD'T'HH:mm:ss.fff'Z'
    dateFrom += 'T00:00:00.000Z';
    dateTo += 'T23:59:59.999Z';

    // sort the transactions array by descending date
    transactionsRes.data.transactions.sort((a: JsonObject, b: JsonObject) => {
      return Date.parse(b.date) - Date.parse(a.date);
    })

    // get a period from today(30/06/2022) until the beginning of the transactions history
    // and get only processed transactions from the current date until the date of the specified period's end
    let processedTransactionsArr = transactionsRes.data.transactions.filter((transaction: JsonObject) => {
      return Date.parse(transaction.date) > Date.parse(dateTo) && transaction.status === "PROCESSED";
    })

    // get the current balance
    const currentBalance = await balanceRes.data.amount
    console.log("The current balance is " + currentBalance);

    // calculate the balance that the client had at the end of the specified period
    // subtract from the current balance all processed transactions:
    const balanceOfDateTo = currentBalance + processedTransactionsArr.reduce((sum: number, transaction: JsonObject) => sum - transaction.amount, 0)
    console.log("The balance of the last day of the specified time period was: " + balanceOfDateTo);

    return getDailyBalance(transactionsRes.data.transactions, balanceOfDateTo, dateFrom, dateTo, sort);
  } else {
    console.log("Was it succesfull to get transactions data? " + transactionsRes.isSuccesfull + ". Was it succesfull to get balance data? " + balanceRes.isSuccesfull);
    return {
      transactionsResponse: transactionsRes.data,
      balanceResponse: balanceRes.data
    }
  }
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

function checkDateRangeValidity(dateFrom: string, dateTo: string) {
  return Date.parse(dateFrom) > Date.parse(dateTo);
}

function getDailyBalance(transactions: Array<JsonObject>, balanceOfDateTo: number, dateFrom: string, dateTo: string, sort: string) {

  let dailyBalanceArr = [];
  let tempDate = "";

  // get all processed transactions
  transactions = transactions.filter((transaction: JsonObject) => transaction.status === "PROCESSED");

  // fill the array with objects to get the final result
  for (let transaction of transactions) {

    if (Date.parse(transaction.date) >= Date.parse(dateFrom)
      && Date.parse(transaction.date) <= Date.parse(dateTo)) {

        balanceOfDateTo -= transaction.amount;

      // get date in format DD/MM/YYYY
      let dateInNewFormat = transaction.date.slice(0, 10).split('-').reverse().join('/')

      if (tempDate === dateInNewFormat) {
        continue;
      } else {
        if (sort === "desc" || !sort) { // it'll be possible to use the route without sort parameter and by default the order will be descendent
          sort = "desc";
          dailyBalanceArr.push(
            {
              date: dateInNewFormat,
              amount: balanceOfDateTo,
              currency: transaction.currency
            });
        } else if (sort === "asc") {
          dailyBalanceArr.unshift(
            {
              date: dateInNewFormat,
              amount: balanceOfDateTo,
              currency: transaction.currency
            });
        } else {
          console.log("Invalid sort preference: " + sort);
          return ({
            message: 'Invalid sort preference. See proper request format in Readme.dm.'
          })
        }

        tempDate = dateInNewFormat;

      }
    }
  }
  console.log("Succesfully got the daily balace for the specific date range: from " + dateFrom + " to " + dateTo + ", the sorting order is " + sort);
  return dailyBalanceArr;
}
