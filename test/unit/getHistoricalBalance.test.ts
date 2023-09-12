import { checkDatesFormatValidity, checkDatesExistence, checkDateRangeValidity, getFilteredTransactionsArr, getDailyBalance } from "../../src/services/getHistoricalBalances";

// checkDatesFormatValidity()
describe("Validate that dates validity check returns true with valid input", () => {
    it("Dates format should be valid", () => {
        const res = checkDatesFormatValidity("2022-05-01", "2022-06-01");
        expect(res).toEqual(true);
    });
});

describe("Validate that dates validity check returns false with invalid input", () => {
    it("Dates format should be invalid", () => {
        const res = checkDatesFormatValidity("2022/05/01", "202206-01");
        expect(res).toEqual(false);
    });
});

// checkDatesExistence()
describe("Validate that dates existence check returns true with valid input", () => {
    it("Dates existance should be valid", () => {
        const res = checkDatesExistence("2022-04-01", "2022-04-04");
        expect(res).toEqual(true);
    });
});

describe("Validate that dates existence check returns false with invalid input", () => {
    it("Dates existance should be invalid", () => {
        const res = checkDatesExistence("2022-02-30", "2022-03-01");
        expect(res).toEqual(false);
    });
});

// checkDateRangeValidity()
describe("Validate that dates range check returns true with valid input", () => {
    it("Dates range should be valid", () => {
        const res = checkDateRangeValidity("2022-01-03", "2022-01-05");
        expect(res).toEqual(true);
    });
});

describe("Validate that dates range check returns false with invalid input", () => {
    it("Dates range should be invalid", () => {
        const res = checkDateRangeValidity( "2022-01-05", "2022-01-03");
        expect(res).toEqual(false);
    });
});

// getFilteredTransactionsArr
const transactions = [{"amount":923,"currency":"EUR","date":"2022-06-30T19:11:29.911Z","status":"CANCELLED"},
                    {"amount":-32,"currency":"EUR","date":"2022-06-30T08:12:17.084Z","status":"PROCESSED"},
                    {"amount":137,"currency":"EUR","date":"2022-06-29T17:12:12.153Z","status":"BOOKED"},
                    {"amount":3,"currency":"EUR","date":"2022-06-29T02:16:18.171Z","status":"PROCESSED"},
                    {"amount":-933,"currency":"EUR","date":"2022-06-28T10:16:42.074Z","status":"CANCELLED"},
                    {"amount":261,"currency":"EUR","date":"2022-06-27T15:59:48.568Z","status":"PROCESSED"}]

describe("Validate that getProcessedTransactionsArr() returns arr with only processed transactions (desc order) from the dates range's end until today", () => {
    it("Filtered transactions array should be correct", () => {
        const res = getFilteredTransactionsArr(transactions, "2022-06-27");
        expect(res).toEqual([{"amount":-32,"currency":"EUR","date":"2022-06-30T08:12:17.084Z","status":"PROCESSED"},
                            {"amount":3,"currency":"EUR","date":"2022-06-29T02:16:18.171Z","status":"PROCESSED"},
                            {"amount":261,"currency":"EUR","date":"2022-06-27T15:59:48.568Z","status":"PROCESSED"}]);
    });
});

describe("Validate that getProcessedTransactionsArr() returns arr with only processed transactions (desc order) from the dates range's end until today", () => {
    it("Filtered transactions array should be correct", () => {
        const res = getFilteredTransactionsArr(transactions, "2022-06-28");
        expect(res).toEqual([{"amount":-32,"currency":"EUR","date":"2022-06-30T08:12:17.084Z","status":"PROCESSED"},
                            {"amount":3,"currency":"EUR","date":"2022-06-29T02:16:18.171Z","status":"PROCESSED"}]);
    });
});


// getDailyBalance
const processedTransactions = [{"amount":-32,"currency":"EUR","date":"2022-06-30T08:12:17.084Z","status":"PROCESSED"}, 
                            {"amount":-205,"currency":"EUR","date":"2022-06-29T11:12:12.478Z","status":"PROCESSED"},
                            {"amount":3,"currency":"EUR","date":"2022-06-29T02:16:18.171Z","status":"PROCESSED"},
                            {"amount":-53,"currency":"EUR","date":"2022-06-28T11:45:38.663Z","status":"PROCESSED"},
                            {"amount":261,"currency":"EUR","date":"2022-06-27T15:59:48.568Z","status":"PROCESSED"}];

describe("Validate that getDailyBalance() returns right array with valid input", () => {
    it("Daily balance array should be correct", () => {
        const res = getDailyBalance(processedTransactions, 10000, "2022-06-28", "2022-06-29", "asc");
        expect(res).toEqual([{"date":"28/06/2022","amount":10234,"currency":"EUR"},
                            {"date":"29/06/2022","amount":10032,"currency":"EUR"}]);
    });
});

describe("Validate that getDailyBalance() returns right array with valid input", () => {
    it("Daily balance array should be correct", () => {
        const res = getDailyBalance(processedTransactions, 10000, "2022-06-29", "2022-06-30", "desc");
        expect(res).toEqual([{"date":"30/06/2022","amount":10000,"currency":"EUR"},
                            {"date":"29/06/2022","amount":10032,"currency":"EUR"}]);
    });
});

describe("Validate that getDailyBalance() returns right array with valid input", () => {
    it("Daily balance array should be correct", () => {
        const res = getDailyBalance(processedTransactions, 10000, "2022-06-27", "2022-06-28", undefined);
        expect(res).toEqual([{"date":"28/06/2022","amount":10234,"currency":"EUR"},
                            {"date":"27/06/2022","amount":10287,"currency":"EUR"}]);
    });
});



// describe("getHistoricalBalance", () => {
//   it("should return the boilerplate object", () => {
//     const res = getHistoricalBalance();
//     expect(res).toEqual({ hello: "world" });
//   });
// });
