import { getDataFromAPI } from "./getDataFromAPI";
import { JsonObject } from "swagger-ui-express";

export async function getHistoricalBalance(url: string, apiKey: string, dateFrom: string, dateTo: string, sort: string) {
  //get all the transactions from the API
  const transactionsRes = await getDataFromAPI(url + "/transactions", apiKey);
  const balanceRes = await getDataFromAPI(url + "/balances", apiKey);

  if (transactionsRes.isSuccesfull && balanceRes.isSuccesfull) {
    console.log("Succesfully got all the transactions and balance data");

    // check if the dates that user entered are invalid
    const checkDateFrom = checkDateValidity(dateFrom);
    const checkDateTo = checkDateValidity(dateTo);
    if (!checkDateFrom || !checkDateTo) {
      console.log("Invalid dates format: " + dateFrom + " or/and " + dateTo);
      return ({
        status: 400,
        data: {
          message: 'Invalid dates format. See proper request format in Readme.dm'
        }
      });
    } else if (typeof (checkDateFrom) === "object") {
      return checkDateFrom;
    } else if (typeof (checkDateTo) === "object") {
      return checkDateTo;
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

export function checkDateValidity(date: string) {
  const error = {
    status: 400,
    data: {
      message: "At least one of the dates doesn't exist (e.g. Feb 29th). Please check your input"
    }
  }

  const regEx = /^\d{4}-\d{2}-\d{2}$/;
  if (date.match(regEx)) {
    const editedDate = date.replace(/[^0-9]+/g, "")
    const year = parseInt(editedDate.slice(0, 4));
    const month = parseInt(editedDate.slice(4, 6));
    const day = parseInt(editedDate.slice(6));
    const d = new Date(year, month - 1, day);
    if (d.getFullYear() !== year || d.getMonth() !== month - 1) {
      console.log("Invalid date");
      return error;
    }
    return true;
  } else {
    return false
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
        dailyBalanceArr.push(
          {
            date: dateInNewFormat,
            amount: balanceOfDateTo,
            currency: transaction.currency
          });
        balanceOfDateTo -= transaction.amount;
        tempDate = dateInNewFormat;
      }
    }
  }

  if (sort === "asc") {
    dailyBalanceArr.reverse();
  }

  if (dailyBalanceArr.length > 0) {
    return {
      status: 200,
      data: {
        balances: dailyBalanceArr
      }
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
