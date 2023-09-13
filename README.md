# Balances, Transactions and Historical Balances API

## Intro

This project implements REST endpoints for fetching balances, transactions and daily account balance within a specific date range. Proper error handling, input validation, logging, and unit, integration tests have been included to ensure data integrity and code reliability.
The project also has a [Swagger](https://swagger.io/specification/) documentation with 3 endpoints.

### `GET /balances` 

This endpoint returns the balance for a specific date, namely `2022-06-30`:

```json
{ 
	"amount": 10000, 
	"currency": "EUR", 
	"date": "2022-06-30T23:59:59.577Z" 
}
```

### `GET /transactions`

This endpoint returns a list of all past transactions done by that customer:

```json
{ 
	"transactions": [ 
		{ 
			"amount": -765, 
			"currency": "EUR", 
			"date": "2022-02-07T09:57:27.235Z", 
			"status": "BOOKED" 
		}, 
		{ 
			"amount": -911, 
			"currency": "EUR", 
			"date": "2022-01-03T22:00:09.002Z", 
			"status": "PROCESSED" 
		}, 
        ...
	] 
} 
```

### `GET /historical-balances`

This endpoint provides a list of daily balances for the requested date range.

Example request:

```sh
`GET /historical-balances?from=2022-01-03&to=2022-01-05&sort=desc`
```

This endpoint accepts 3 parameters: `from`, `to`, `sort`. `from` and `to` are mandatory while `sort` is optional.
The dates should be provided in the following format: `YYYY-MM-DD`.
The sort parameter has two options: `desc` or `asc` (descending or ascending date order), by default the order will be descendent.

Example response:

```json
{
    [
        {
            "date": "05/01/2022",
            "amount": 1514,
            "currency": "EUR"
        },
        {
            "date": "04/01/2022",
            "amount": 968,
            "currency": "EUR"
        },
        {
            "date": "03/01/2022",
            "amount": 1422,
            "currency": "EUR"
        }
    ]
}
```

The response includes an array of objects, each representing a daily balance with a date, amount, and currency.

### `GET /api-docs`

An extra endpoint where you can visualize the API Documentation with a [Swagger](https://swagger.io/specification/).

## How to start developing using this project?

### Build the project

```sh
npm run build
```

### Running the server 

```sh
# After cloning the repository, install the dependencies
npm install

# Start the server
npm start


> balances-and-transactions-api@1.0.0 start
> tsx src/server.ts --watch

🚀 Server started on port 3333!

# If you see the message above, everything worked!
# The `start` command has hot-reload on, i.e., anytime you modify a file
# the server restarts. Bear it in mind if your solution keeps state in memory.
```

### Running the tests

The project has 11 unit and 3 integration tests. 

The unit tests verify if the user provided a correct date range, dates and check the output of 2 funtions:
- for filtering the transactions to get only processed, strating at the end of the date range and ends on `2022-06-30`.
- for creating an array of the daily balances, based on the processed transactions, the balance, which the user had at the end of the date range, the date range and the sorting order.

The integration test check:
- if the user passed an invalid route
- if the user got a proper balance from `GET /balances`
- if the user got a proper array of objects, each representing a daily balance with a date, amount, and currency.

```sh
# Run the tests
npm test
```
