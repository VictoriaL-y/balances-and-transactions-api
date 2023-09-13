import request from "supertest";
import app from "../../src/app";

describe("Balance and Transactions API", () => {
    describe("Try to use an invalid route", () => {
      it("Should recieve a proper balance object", async () => {
        const response = await request(app).get("/hgf");
        expect(response.status).toBe(404);
        expect(response.body).toEqual({
              message: "Invalid request, this route doesn't exist"
          });
      });
    });
  });

describe("Balance and Transactions API", () => {
  describe("GET /balances", () => {
    it("Should recieve a proper balance object", async () => {
      const response = await request(app).get("/balances");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({"amount":10000,"currency":"EUR","date":"2022-06-30T23:59:59.577Z"});
    });
  });
});

describe("Balance and Transactions API", () => {
  describe("GET /historical-balances", () => {
    it("Should recieve a proper array with the daily balances for the specified date range", async () => {
      let response = await request(app).get("/historical-balances?from=2022-06-28&to=2022-06-30&sort=asc");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([{"date":"28/06/2022","amount":10234,"currency":"EUR"},
                                    {"date":"29/06/2022","amount":10032,"currency":"EUR"},
                                    {"date":"30/06/2022","amount":10000,"currency":"EUR"}]);

      response = await request(app).get("/historical-balances?from=2022-01-03&to=2022-01-05&sort=desc");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{"date":"05/01/2022","amount":1514,"currency":"EUR"},
                                    {"date":"04/01/2022","amount":968,"currency":"EUR"},
                                    {"date":"03/01/2022","amount":1422,"currency":"EUR"}]);

      response = await request(app).get("/historical-balances?from=2022-05-03&to=2022-05-03");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{"date":"03/05/2022","amount":14245,"currency":"EUR"}]);

      response = await request(app).get("/historical-balances?from=2023-05-03&to=2023-05-03");
      expect(response.status).toBe(200);
      expect(response.body).toEqual({message: "Nothing was found for your request"});

      response = await request(app).get("/historical-balances?from=2022.05/03&to=2022/05/05");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({message: "Invalid dates format. See proper request format in Readme.dm"});

      response = await request(app).get("/historical-balances?from=202205-03&to=2022-05-03");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({message: "Invalid dates format. See proper request format in Readme.dm"});

      response = await request(app).get("/historical-balances?from=2022-05-03&to=2022-13-05");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({message: "At least one of the dates doesn't exist (e.g. Feb 29th). Please check your input"});

      response = await request(app).get("/historical-balances?from=2022-06-03&to=2022-05-05");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({message: "The start date is later than the end date. Please check your input"});

      response = await request(app).get("/historical-balances");
      expect(response.status).toBe(400);
      expect(response.body).toEqual({message: "Missing arguments, provide dates. See proper request format in Readme.dm"});
    
    });
  });
});

// describe("Balance and Transactions API", () => {
//   describe("GET /historical-balances", () => {
//     it("should be able to get the boilerplate response", async () => {
//       const response = await request(app).get("/historical-balances");

//       expect(response.status).toBe(200);
//       expect(response.body).toEqual({ hello: "world" });
//     });
//   });
// });
