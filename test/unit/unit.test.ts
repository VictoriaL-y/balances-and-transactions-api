import { describe, it, expect } from 'vitest';
import { checkDateValidity, checkDatesRangeValidity, getFilteredTransactionsArr, getDailyBalance } from "../../src/services/getHistoricalBalances";

// checkDateValidity()
describe("Check a date validity with checkDateValidity()", () => {
    it("Date format should be valid", () => {
        const res = checkDateValidity("2022-05-01");
        expect(res).toEqual(true);
    });
    it("Date format should be invalid", () => {
        let res = checkDateValidity("2022/05}01");
        expect(res).toEqual(false);
        res = checkDateValidity("2022.05/01");
        expect(res).toEqual(false);
    });
    it("Date existance should be invalid", () => {
        const res = checkDateValidity("2022-02-30");
        const expectedRes = {
            status: 400,
            data: {
                message: "At least one of the dates doesn't exist (e.g. Feb 29th). Please check your input"
            }
        }
        expect(res).toEqual(expectedRes);
    });
});

// checkDateRangeValidity()
describe("Dates range check returns true with valid input", () => {
    it("Dates range should be valid", () => {
        const res = checkDatesRangeValidity("2022-01-03", "2022-01-05");
        expect(res).toEqual(true);
    });
});

describe("Dates range check returns false with invalid input", () => {
    it("Dates range should be invalid", () => {
        const res = checkDatesRangeValidity("2022-01-05", "2022-01-03");
        expect(res).toEqual(false);
    });
});

// getFilteredTransactionsArr
const transactions = [{ "amount": 923, "currency": "EUR", "date": "2022-06-30T19:11:29.911Z", "status": "CANCELLED" },
{ "amount": -32, "currency": "EUR", "date": "2022-06-30T08:12:17.084Z", "status": "PROCESSED" },
{ "amount": 137, "currency": "EUR", "date": "2022-06-29T17:12:12.153Z", "status": "BOOKED" },
{ "amount": 3, "currency": "EUR", "date": "2022-06-29T02:16:18.171Z", "status": "PROCESSED" },
{ "amount": -933, "currency": "EUR", "date": "2022-06-28T10:16:42.074Z", "status": "CANCELLED" },
{ "amount": 261, "currency": "EUR", "date": "2022-06-27T15:59:48.568Z", "status": "PROCESSED" }]

describe("getProcessedTransactionsArr() returns arr with only processed transactions (desc order) from the dates range's end until today", () => {
    it("Filtered transactions array should be correct", () => {
        let res = getFilteredTransactionsArr(transactions, "2022-06-27");
        expect(res).toEqual([{ "amount": -32, "currency": "EUR", "date": "2022-06-30T08:12:17.084Z", "status": "PROCESSED" },
        { "amount": 3, "currency": "EUR", "date": "2022-06-29T02:16:18.171Z", "status": "PROCESSED" },
        { "amount": 261, "currency": "EUR", "date": "2022-06-27T15:59:48.568Z", "status": "PROCESSED" }]);
        res = getFilteredTransactionsArr(transactions, "2022-06-28");
        expect(res).toEqual([{ "amount": -32, "currency": "EUR", "date": "2022-06-30T08:12:17.084Z", "status": "PROCESSED" },
        { "amount": 3, "currency": "EUR", "date": "2022-06-29T02:16:18.171Z", "status": "PROCESSED" }]);
        res = getFilteredTransactionsArr(transactions, "2022-07-28");
        expect(res).toEqual([]);
    });
});

// getDailyBalance
const processedTransactions = [{ "amount": -32, "currency": "EUR", "date": "2022-06-30T08:12:17.084Z", "status": "PROCESSED" },
{ "amount": -205, "currency": "EUR", "date": "2022-06-29T11:12:12.478Z", "status": "PROCESSED" },
{ "amount": 3, "currency": "EUR", "date": "2022-06-29T02:16:18.171Z", "status": "PROCESSED" },
{ "amount": -53, "currency": "EUR", "date": "2022-06-28T11:45:38.663Z", "status": "PROCESSED" },
{ "amount": 261, "currency": "EUR", "date": "2022-06-27T15:59:48.568Z", "status": "PROCESSED" }];

describe("getDailyBalance() returns an object with a correct array inside", () => {
    it("Daily balance object should be correct", () => {
        let res = getDailyBalance(processedTransactions, 10032, "2022-06-28T00:00:00.000Z", "2022-06-29T23:59:59.999Z", "asc").data;
        expect(res).toEqual({ "balances": [{ "date": "28/06/2022", "amount": 10234, "currency": "EUR" },
        { "date": "29/06/2022", "amount": 10032, "currency": "EUR" }]});
        res = getDailyBalance(processedTransactions, 10000, "2022-06-29T00:00:00.000Z", "2022-06-30T23:59:59.999Z", "desc").data;
        expect(res).toEqual({ "balances": [{ "date": "30/06/2022", "amount": 10000, "currency": "EUR" },
        { "date": "29/06/2022", "amount": 10032, "currency": "EUR" }]});
        res = getDailyBalance(processedTransactions, 10234, "2022-06-27T00:00:00.000Z", "2022-06-28T23:59:59.999Z", "").data;
        expect(res).toEqual({ "balances": [{ "date": "28/06/2022", "amount": 10234, "currency": "EUR" },
        { "date": "27/06/2022", "amount": 10287, "currency": "EUR" }]});
        res = getDailyBalance(processedTransactions, 10000, "2022-04-27T00:00:00.000Z", "2022-05-28T23:59:59.999Z", "").data;
        expect(res).toEqual({ message: "Nothing was found for your request" });
    });
});
