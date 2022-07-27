import { useState, useEffect } from "react";
import "./App.css";
const { BN, Long, bytes, units } = require("@zilliqa-js/util");
const { toBech32Address } = require("@zilliqa-js/crypto");
const { Zilliqa } = require("@zilliqa-js/zilliqa");
const { StatusType, MessageType } = require("@zilliqa-js/subscriptions");

function App() {
  const [zilpayConnected, setZilpayConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMinting, setIsMinting] = useState(false);
  const [isBatchMinting, setIsBatchMinting] = useState(false);
  const [isBatchBurning, setIsBatchBurning] = useState(false);
  const [ticketsUsed, setTicketsUsed] = useState(0);
  const [contractAddress, setContractAddress] = useState("");
  const [tempContractAddress, setTempContractAddress] = useState("");
  const [mintNumber, setMintNumber] = useState(0);
  const [contractState, setContractState] = useState({});
  const [ownedTokensInformation, setOwnedTokensInformation] = useState(null);
  const [ownedTokenIDs, setOwnedTokenIDs] = useState([]);

  function getKeyByValue(object, value) {
    return Object.keys(object).filter((key) => object[key] === value);
  }

  function constructBatchMintParameters(number) {
    const arr = [];
    for (let i = 0; i < number; i++)
      arr.push({
        constructor: "Pair",
        argtypes: ["ByStr20", "String"],
        arguments: [window.zilPay.wallet.defaultAccount.base16, ""],
      });
    return arr;
  }

  async function connectZilpay() {}

  function updateContractAddress() {}

  async function updateContractDetails() {}

  async function handleMint() {}

  async function handleBatchMint() {}

  async function handleBatchBurn() {}

  async function eventLogSubscription() {
    const zilliqa = new Zilliqa("https://dev-api.zilliqa.com");
    const subscriber = zilliqa.subscriptionBuilder.buildEventLogSubscriptions(
      "wss://dev-ws.zilliqa.com",
      {
        // smart contract address you want to listen on
        addresses: [contractAddress],
      }
    );

    subscriber.emitter.on(StatusType.SUBSCRIBE_EVENT_LOG, (event) => {
      // if subscribe success, it will echo the subscription info
      console.log("get SubscribeEventLog echo: ", event);
    });

    subscriber.emitter.on(MessageType.EVENT_LOG, (event) => {
      // do what you want with new event log
      console.log("get new event log: ", JSON.stringify(event));
      if (event.value) {
        const eventName = event.value[0].event_logs[0]._eventname;
        if (eventName === "Mint") {
          setIsMinting(false);
        }
        if (eventName === "BatchMint") {
          setIsBatchMinting(false);
        }
        if (eventName === "Burn") {
          setIsBatchBurning(false);
        }
        setIsLoading(true);
      }
    });

    subscriber.emitter.on(MessageType.UNSUBSCRIBE, (event) => {
      //if unsubscribe success, it will echo the unsubscription info
      console.log("get unsubscribe event: ", event);
    });

    await subscriber.start();
  }

  useEffect(() => {}, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Project Concert Tickets</h1>
        {zilpayConnected === false ? (
          <div>
            <p>Connect your ZilPay wallet to get started!</p>
            <button onClick={connectZilpay}>Connect ZilPay</button>
          </div>
        ) : contractAddress === "" ? (
          <div>
            <label>
              Contract address:{" "}
              <input
                type="text"
                size="40"
                placeholder="Base16 format"
                required
                onChange={(e) => setTempContractAddress(e.target.value)}
              />
              <button onClick={updateContractAddress}>Submit</button>
            </label>
          </div>
        ) : (
          <div>
            <img src="banner.png" alt="Banner" width="800" />
            <br />
            <div className="grid">
              <div>
                <h3>
                  <u>Contract Information</u>
                </h3>
                <p>Address: {contractAddress}</p>
                <p>Name: {contractState.token_name}</p>
                <p>Owner: {contractState.contract_owner}</p>
                <p>Price: {contractState.token_price / 1000000 || ""} LI</p>
                <p>Total Tickets: {contractState.max_token_supply}</p>
              </div>
              <div>
                <h3>
                  <u>Purchasing Counter</u>
                </h3>
                <p>No. of Tickets sold: {contractState.token_id_count}</p>
                <p>
                  No. of Tickets left:{" "}
                  {contractState.max_token_supply -
                    contractState.token_id_count || 0}
                </p>
                {(isMinting && <div className="loader" />) ||
                  (contractState.max_token_supply -
                    contractState.token_id_count ===
                    0 && (
                    <div>
                      <p>Tickets are sold out!</p>
                    </div>
                  )) || (
                    <button onClick={handleMint}>Purchase Single Ticket</button>
                  )}
                <br />
                <br />
                {(isBatchMinting && <div className="loader" />) ||
                  (contractState.max_token_supply -
                    contractState.token_id_count !==
                    0 && (
                    <div>
                      <input
                        type="number"
                        placeholder="Number of Tickets"
                        onChange={(e) => setMintNumber(e.target.value)}
                      />
                      <button onClick={handleBatchMint}>Group Purchase</button>
                    </div>
                  ))}
              </div>
              <div>
                <h3>
                  <u>Concert Entry</u>
                </h3>
                {ticketsUsed !== 0 && !isBatchBurning ? (
                  <p>
                    {window.zilPay.wallet.defaultAccount.base16} has been
                    granted access for {ticketsUsed} pax!
                  </p>
                ) : !ownedTokensInformation ? (
                  <p>You have no concert tickets!</p>
                ) : isBatchBurning ? (
                  <div className="loader" />
                ) : (
                  <button onClick={handleBatchBurn}>Use Tickets</button>
                )}
              </div>
              <div>
                <h3>
                  <u>Your Concert Tickets</u>
                </h3>
                {!ownedTokensInformation ? (
                  <div>
                    <p>You have no concert tickets!</p>
                  </div>
                ) : (
                  ownedTokensInformation.map((value, key) => {
                    return (
                      <div key={key}>
                        <img
                          src={value.resources[0].uri}
                          alt="Token URI"
                          width="300"
                        />
                        <p>Name: {value.name}</p>
                        <p>
                          Gate: {value.attributes[0].value} Row:{" "}
                          {value.attributes[1].value} Seat:{" "}
                          {value.attributes[2].value}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
