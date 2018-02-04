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

var con = mysql.createConnection({
  host     : '192.168.0.100',
  user     : 'admin',
  password : 'jh1995',
  database : 'Trader'
});

con.connect();


function AddPosition(type)
{
	//Store position in database.
	async.series(
	{
		[
			function(callback)
			{
				var sql = "INSERT INTO Positions (type) VALUES(?)";
				var val = [type];
				con.query(sql, val, function(err, results)
				{
					if (err)
					{
						return callback(err);
					}
					else
					{
						return callback(null);
					}
				});
			},
			function(callback)
			{
				//Place trade
				var sql = "SELECT * FROM Positions ORDER BY added_time DESC LIMIT 2";
				con.query(sql, function(err, results)
				{
					if (err)
					{
						return callback(err);
					}
					else if (results.length < 2)
					{
						return new errors.NotFound();
					}
					else
					{
						if (results[0] == results[1])
						{
							//Do Nothing, no trade needs to be made we already have this position.
						}
						else
						{
							//Start trading interval. 
						}
						return callback(null);
					}
				});
			}
		],
		function(err, results)
		{
			if (err) return console.log(err);
		}
	});
}

function PlaceTrade(type, callback)
{
	async.waterfall
	(
		[
			function(cbk)
			{
				GetSpreads(type, function(err, results)
				{
					if (err) return cbk(err, null);

					console.log(results);
				});
			}
		]
	)
}

function GetSpreads(type, callback)
{
	//Make API call to get current spreads, return needed one based on type.
	authedClient.getProductOrderBook('BTC-USD', function(err, results)
	{
		if (err)
		{
			return callback(err, null);
		}
		else
		{
			var val = (type) ? results.bids[0] : results.asks[0];
			return callback(null, val);
		}
	});
}




/*
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
};*/