import { getDataFromAPI } from "./getDataFromAPI";
import { JsonObject } from "swagger-ui-express";

export async function getHistoricalBalance(url: string, apiKey: string, dateFrom: string, dateTo: string, sort: string) {
  //get all the transactions from the API
  const transactionsRes = await getDataFromAPI(url + "/transactions", apiKey);
  const balanceRes = await getDataFromAPI(url + "/balances", apiKey);

  if (transactionsRes.isSuccesfull && balanceRes.isSuccesfull) {
    console.log("Succesfully got all the transactions and balance data");
    // check if the data that user entered is invalid
    if (!checkDatesFormatValidity(dateFrom, dateTo)) {
      console.log("Invalid dates format: " + dateFrom + " or/and " + dateTo);
      return ({
        status: 400,
        data: {
          message: 'Invalid dates format. See proper request format in Readme.dm'
        }
      });
    }

    if (!checkDatesExistence(dateFrom, dateTo)) {
      console.log("At least one of the dates doesn't exist: " + dateFrom + " or/and " + dateTo);
      return ({
        status: 400,
        data: {
          message: "At least one of the dates doesn't exist (e.g. Feb 29th). Please check your input"
        }
      });
    }

    if (!checkDatesRangeValidity(dateFrom, dateTo)) {
      console.log("The start date " + dateFrom + " is later that the end date " + dateTo);
      return ({
        status: 400,
        data: {
          message: "The start date is later than the end date. Please check your input"
        }
      });
    }

    // transform the dates the user entered from YYYY-MM-DD to YYYY-MM-DD'T'HH:mm:ss.fff'Z'
    dateFrom += 'T00:00:00.000Z';
    dateTo += 'T23:59:59.999Z';

    // sort the transactions array by descending date
    transactionsRes.dataFromAPI.transactions.sort((a: JsonObject, b: JsonObject) => {
      return Date.parse(b.date) - Date.parse(a.date);
    })

    // get only processed transactions from the date that starts after the specified period's end and ends today
    const filteredTransactionsArr = getFilteredTransactionsArr(transactionsRes.dataFromAPI.transactions, dateTo);

    // get the current balance
    const currentBalance = await balanceRes.dataFromAPI.amount
    console.log("The current balance is " + currentBalance);

    // calculate the balance that the client had at the end of the specified period
    // subtract from the current balance all processed transactions:
    const balanceOfDateTo = currentBalance + filteredTransactionsArr.reduce((sum: number, transaction: JsonObject) => sum - transaction.amount, 0)
    console.log("The balance of the last day of the specified time period was: " + balanceOfDateTo);

    return getDailyBalance(transactionsRes.dataFromAPI.transactions, balanceOfDateTo, dateFrom, dateTo, sort);
  } else {
    console.log("Was it succesfull to get transactions data? " + transactionsRes.isSuccesfull + ". Was it succesfull to get balance data? " + balanceRes.isSuccesfull);
    if (!transactionsRes.isSuccesfull) {
      return {
        status: transactionsRes.data.status,
        data: {
          transactionsResponse: transactionsRes.data,
        }
      }
    } else {
      return {
        status: balanceRes.data.status,
        data: {
          transactionsResponse: transactionsRes.data,
        }
      }
    }
  }
}

export function checkDatesFormatValidity(dateFrom: string, dateTo: string) {
  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  return (dateFrom.match(regEx) && dateTo.match(regEx)) ? true : false;
}

export function checkDatesExistence(dateFrom: string, dateTo: string) {
  const dateFromCorrected = dateFrom.replace(/[^a-zA-Z0-9]/g, '-');
  let dFrom = new Date(dateFromCorrected);
  let dNumFrom = dFrom.getTime();

  const dateToCorrected = dateTo.replace(/[^a-zA-Z0-9]/g, '-')
  let dTo = new Date(dateToCorrected);
  let dNumTo = dTo.getTime();

  // console.log(dFrom.toISOString().slice(0, 10) === dateFrom);
  // console.log(dTo.toISOString().slice(0, 10) === dateTo);

  if ((!dNumFrom && dNumFrom !== 0) || (!dNumTo && dNumTo !== 0)) { // check if NaN
    return false;
  } else if ((dFrom.toISOString().slice(0, 10) !== dateFromCorrected)
    || (dTo.toISOString().slice(0, 10) !== dateToCorrected)) { // check if invalid (e.g. 2022-02-30)
    return false;
  } else {
    return true;
  }
}

export function checkDatesRangeValidity(dateFrom: string, dateTo: string) {
  return Date.parse(dateFrom) <= Date.parse(dateTo);
}

export function getFilteredTransactionsArr(transactions: Array<JsonObject>, dateTo: string) {
  const filteredTransactionsArr = transactions.filter((transaction: JsonObject) => {
    return Date.parse(transaction.date) > Date.parse(dateTo) && transaction.status === "PROCESSED";
  })
  return filteredTransactionsArr;
}

export function getDailyBalance(transactions: Array<JsonObject>, balanceOfDateTo: number, dateFrom: string, dateTo: string, sort: string) {

  let dailyBalanceArr = [];
  let tempDate = "";

  // get all processed transactions
  transactions = transactions.filter((transaction: JsonObject) => transaction.status === "PROCESSED");

  // fill the array with objects to get the final result
  for (let transaction of transactions) {

    if (Date.parse(transaction.date) >= Date.parse(dateFrom)
      && Date.parse(transaction.date) <= Date.parse(dateTo)) {

      // get date in format DD/MM/YYYY
      let dateInNewFormat = transaction.date.slice(0, 10).split('-').reverse().join('/')

      if (tempDate === dateInNewFormat) {
        balanceOfDateTo -= transaction.amount;
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
            status: 400,
            data: {
              message: 'Invalid sort preference. See proper request format in Readme.dm'
            }
          })
        }
        balanceOfDateTo -= transaction.amount;
        tempDate = dateInNewFormat;
      }
    }
  }

  if (dailyBalanceArr.length > 0) {
    return {
      status: 200,
      data: dailyBalanceArr
    };
  } else {
    return {
      status: 200,
      data: {
        message: "Nothing was found for your request"
      }
    };
  }
}
