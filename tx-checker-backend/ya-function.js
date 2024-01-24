const axios = require("axios");
const BigNumber = require("bignumber.js");

const BLOCKBOOK_API = "https://eth-blockbook.nownodes.io";
const MODEL_API = "url";
const API_KEY = "url";

module.exports.handler = async function (event, context) {
  try {
    const requestBody = JSON.parse(event.body);
    const txId = requestBody.txId;
    const direction = requestBody.direction;

    if (!txId || !direction) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Transaction ID and direction are required.",
        }),
      };
    }

    const transactionResponse = await axios.get(
      `${BLOCKBOOK_API}/api/v2/tx/${txId}`,
      {
        headers: { "api-key": API_KEY },
      }
    );

    const transactionData = transactionResponse.data;

    const senderAddress =
      direction === "in"
        ? transactionData.vout[0].addresses[0]
        : transactionData.vin[0].addresses[0];

    const addressResponse = await axios.get(
      `${BLOCKBOOK_API}/api/v2/address/${senderAddress}?details=txs`,
      {
        headers: { "api-key": API_KEYƒ },
      }
    );
    const addressData = addressResponse.data;

    const modelData = formatModelData(addressData);

    const modelResponse = await axios.post(MODEL_API, {
      data: Object.values(modelData),
    });
    const prediction = modelResponse.data;

    return {
      statusCode: 200,
      body: prediction,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error }),
    };
  }
};

function formatModelData(addressData) {
  const receivedTxs = addressData.transactions.filter(
    (tx) => tx.vout[0].isOwn === true
  );
  const sentTxs = addressData.transactions.filter(
    (tx) => tx.vin[0].isOwn === true
  );

  return {
    Avg_min_between_received_tnx:
      calculateAvgTimeBetweenReceivedTnx(receivedTxs) || 0,
    Avg_min_between_sent_tnx: calculateAvgTimeBetweenSentTnx(sentTxs) || 0,
    Sent_tnx: sentTxs.length,
    Received_Tnx: receivedTxs.length,
    Number_of_Created_Contracts: 0,
    Average_of_Unique_Received_From_Addresses:
      calculateAverageUniqueReceivedAddresses(receivedTxs),
    Average_of_Unique_Sent_To_Addresses:
      calculateAverageUniqueSentAddresses(sentTxs),
    min_value_received: toEthers(calculateMinValueReceived(receivedTxs)),
    max_value_received: toEthers(calculateMaxValueReceived(receivedTxs)),
    avg_val_received: toEthers(calculateAvgValueReceived(receivedTxs)),
    min_val_sent: toEthers(calculateMinValueSent(sentTxs)),
    max_val_sent: toEthers(calculateMaxValueSent(sentTxs)),
    avg_val_sent: toEthers(calculateAvgValueSent(sentTxs)) || 0,
    total_transactions_including_tnx_to_create_contract: addressData.txs,
    total_Ether_sent: toEthers(calculateTotalEtherSent(sentTxs)),
    total_ether_received: toEthers(calculateTotalEtherReceived(receivedTxs)),
    total_ether_balance: toEthers(addressData.balance),
  };
}

function calculateAvgTimeBetweenReceivedTnx(receivedTxs) {
  let totalTimeInterval = 0;
  for (let i = 1; i < receivedTxs.length; i++) {
    totalTimeInterval +=
      receivedTxs[i].blockTime * 1000 - receivedTxs[i - 1].blockTime * 1000;
  }

  return Math.abs(totalTimeInterval / 60000 / (receivedTxs.length - 1));
}

function calculateAvgTimeBetweenSentTnx(sentTxs) {
  let totalTimeInterval = 0;
  for (let i = 1; i < sentTxs.length; i++) {
    totalTimeInterval +=
      sentTxs[i].blockTime * 1000 - sentTxs[i - 1].blockTime * 1000;
  }

  return Math.abs(totalTimeInterval / 60000 / (sentTxs.length - 1));
}

function calculateAverageUniqueReceivedAddresses(sentTxs) {
  const uniqueAddresses = new Set(sentTxs.map((tx) => tx.vin[0].addresses[0]));
  return uniqueAddresses.size;
}

function calculateAverageUniqueSentAddresses(receivedTxs) {
  const uniqueAddresses = new Set(
    receivedTxs.map((tx) => tx.vout[0].addresses[0])
  );
  return uniqueAddresses.size;
}

function calculateMinValueReceived(sentTxs) {
  return Math.min(...sentTxs.map((tx) => tx.value));
}

function calculateMaxValueReceived(sentTxs) {
  return Math.max(...sentTxs.map((tx) => tx.value));
}

function calculateAvgValueReceived(sentTxs) {
  const totalValue = sentTxs.reduce((sum, tx) => sum + Number(tx.value), 0);

  return totalValue / sentTxs.length;
}

function calculateMinValueSent(receivedTxs) {
  if (receivedTxs.length > 0) {
    return Math.min(...receivedTxs.map((tx) => tx.value));
  }
  return 0;
}

function calculateMaxValueSent(receivedTxs) {
  if (receivedTxs.length > 0) {
    return Math.max(...receivedTxs.map((tx) => tx.value));
  }
  return 0;
}

function calculateAvgValueSent(receivedTxs) {
  const totalValue = receivedTxs.reduce((sum, tx) => sum + Number(tx.value), 0);
  return totalValue / receivedTxs.length;
}

function calculateTotalEtherSent(receivedTxs) {
  const txs = receivedTxs.filter((tx) => tx.vin[0].isOwn === true);
  return txs.reduce((sum, tx) => sum + Number(tx.value), 0);
}

function calculateTotalEtherReceived(sentTxs) {
  return sentTxs.reduce((sum, tx) => sum + Number(tx.value), 0);
}

function toEthers(raw) {
  return new BigNumber(raw)
    .div(new BigNumber("10").pow(18).toFixed())
    .toNumber();
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
