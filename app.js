var mysql = require('mysql');
var errors = require('throw.js');
var async = requre('async');
var gdax = require('gdax');
const key = 'your_api_key';
const secret = 'your_b64_secret';
const passphrase = 'your_passphrase';

const apiURI = 'https://api.gdax.com';
const sandboxURI = 'https://api-public.sandbox.gdax.com';

const authedClient = new gdax.AuthenticatedClient(key, secret, passphrase, sandboxURI);
exports.authedClient = authedClient;

var con = mysql.createConnection({
  host     : '192.168.0.11',
  user     : 'admin',
  password : 'jh1995',
  database : 'TradeDB'
});

con.connect();
//Add Position - Takes Type(Buy/Sell), Time Limit(Seconds).
//Add position to database. 
function addPosition(type, timeLimit, callback)
{
	var sql = "INSERT INTO PositionTarget (type, timelimit) VALUES(?, ?)";
	var val = [type, timeLimit];
	con.query(sql, val, function(err, results)
	{
		return callback(err, results);
	});
};

function deactivePositions(callback)
{
	var sql = "UPDATE PositionTarget SET active = FALSE";
	con.query(sql, function(err, results)
	{
		return callback(err, results);
	});
};

function getOutstandingPositions(callback)
{
	var sql = "SELECT * FROM PositionTarget WHERE active = TRUE";
	con.query(sql, function(err, results)
	{
		if (results.length == 0)
		{
			return callback(new errors.NotFound(), null);
		}
		else
		{
			return callback(err, results[0]);
		}
	});
};

//Retrieve trader balance.
function getTraderBalance(callback)
{
	authedClient.getAccounts(function(err, response)
	{
		return response[0].available;
	})
};

//Get current ask/bid spreads.
function getCurrentPrice(orderType, callback)
{
	authedClient.getProductOrderBook('BTC-USD', function(err, response)
	{
		var val = null;
		if (err) return callback(err, null);

		if (orderType == 'buy')
		{
			val = response.bids[0][0];
		}
		else
		{
			val = response.asks[0][0];
		}
		return callback(null, val);
	});
};
//Place Trade (post only).
function placeTrade(size, price, type, callback)
{
	var params = {
	  'side': type,
	  'type': 'limit',
	  'price': price, // USD
	  'size': size, // LTC
	  'product_id': 'BTC-USD',
	  'post_only': true
	};
	authedClient.placeOrder(params, function(err, results)
	{
		return callback(err, results);
	});
};

//Get outstanding limit orders that were not filled.
function getActiveOrders(callback)
{
	authedClient.getOrders(function(err, results)
	{
		return callback(err, results);
	});
};

//Cancel outstanding limit order. 
function cancelOrders(callback)
{
	authedClient.cancelAllOrders(function(err, results)
	{
		return callback(err, results);
	});
};


//Interval look for open position targets and deal with them.
function pollPositionTargets()
{
	//get outstanding positions that are not filled and do not have outstanding trades associated with them.

	//Calculate trade size

	//Place trade
}

//Interval monitor trade.
function pollActiveTrades()
{
	async.waterfall
	(
		[
			//Get outstanding positions (marked in db).
			function(callback)
			{
				getOutstandingPositions(function(err, results)
				{

				});
			},
			//get active order associated with it from gdax.
			function(callback)
			{

			}
		]
	)
	

	

	//check if current order has been partially filled. Mark amount filled in outstanding positions.

	//get order book.

	//check if current position is at ask/bid threshold.

	//if it is not, cancel order and re-place trade.
}