const { MongoClient } = require("mongodb");
let uri =
  "mongodb+srv://gromp:" +
  process.env.mongodbGrompPassword +
  "@cluster0.3fgtx.azure.mongodb.net/" +
  process.env.mongodbGrompDatabaseName +
  "?retryWrites=true&w=majority";
const client = new MongoClient(uri);

async function dbConnect() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    return client;
  } catch (e) {
    console.error(e);
  }
}

async function insert_in_database(champName, channelId, serverId) {
    const mainFunctions = require("./main");
    let playerExists = await mainFunctions.get_player_id(champName, channelId, "insert");
    console.log(playerExists);
    col = await client.db("gromp").collection("grompUsers");

    var cursor = await col.findOne( {_id: serverId});
    console.log(cursor);
  await col.updateOne(
    { _id: serverId },
    {
      $push: { champNames: champName },
    },
    { upsert: true }
  );
}

module.exports = {
  dbConnect,
  insert_in_database,
};
