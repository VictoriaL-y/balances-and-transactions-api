# Balances, Transactions and Historical Balances API

## Intro

This project implements REST endpoints for fetching balances, transactions and daily account balances within a specific date range. Proper error handling, input validation, logging, and unit, integration tests have been included to ensure data integrity and code reliability.
The project also has a [Swagger](https://swagger.io/specification/) documentation with 3 endpoints.

### `GET /balances` 

This endpoint returns what was the balance of the customer on a specific date, namely `2022-06-30`.
For example:  

```json
{ 
	"amount": 10000, 
	"currency": "EUR", 
	"date": "2022-06-30T23:59:59.577Z" 
}
```

### `GET /transactions`

This is going to return a list of all past transactions done by that customer:

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

It provides a list of balances for the requested days.

Example request:

```sh
`GET /historical-balances?from=2022-01-03&to=2022-01-05&sort=desc`
```

Note, that dates should be provided in the following format: `YYYY-MM-DD`.
Sort parameter should be written like `desc` or `asc` (descending or ascending date order), but it's not required and by default the order will be descendent.

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

The response includes an array of objects, each representing a daily balance with date, amount, and currency.

### `GET /api-docs`

An extra endpoint where you can visualize the API Documentation

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

```sh
npm test
```
