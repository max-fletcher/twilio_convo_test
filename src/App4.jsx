import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [bids, setBids] = useState([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(null)

  const auctionUniqueId = "auc_qr5IhJktQP"
  const batchUniqueId = "batch_CoGdtOO2Uv"
  const appUserId = "usr_56913465891340"
  const appUserToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM0MCIsIm5hbWUiOiJBZGFtIFNtaXRoMiIsInVzZXJuYW1lIjoiamhuc210aGJvaXMyIiwiZW1haWwiOiJtYWhpbi5jaG93ZGh1cnkuMTk5MUBnbWFpbC5jb20iLCJwaG9uZSI6Iis4ODAxNzYyMjE0MzE1Iiwid2hhdHNhcHBfbm8iOm51bGwsInZlcmlmaWVkIjp0cnVlLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzMyMTYzOTg0LCJleHAiOjE3MzQ3NTU5ODR9.GMKWuhspnhJsP4jl4KfAZu6gfmivB8eHZ3FxsTYwIGs"

  useEffect(() => {
    const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      channelAuthorization: {
        endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL4 + `/${appUserId}/auction/${auctionUniqueId}/batch/${batchUniqueId}`
      }
    });

    const pusherBindEvents = async () => {
      console.log('bound');
      console.log('channel', `presence-auction-bids-${auctionUniqueId}-batch-${batchUniqueId}`);
      const channel = pusherClient.subscribe(`presence-auction-bids-${auctionUniqueId}-batch-${batchUniqueId}`);
      channel.bind("pusher:subscription_succeeded", (members) => {
        console.log('all members details', members.count, members);
        setOnlineCount(members.count)
        // LIST OF JOINED MEMBERS
        members.each((member) => {
          console.log('member', member)
        });
      });
      channel.bind("pusher:member_added", (member) => {
        setStatusMessage(`${member.info.username} has joined the chat`)
      });
      channel.bind("pusher:member_removed", (member) => {
        setStatusMessage(`${member.info.username} has left the chat`)
      });
      channel.bind("pusher:subscription_error", (data) => {
          console.log('subscription_error', data)
      });
      channel.bind("new-bid-placed", (data) => {
        console.log('new-bid-placed');
        setBids(prevBids => [data, ...prevBids])
      });
    };

    console.log('henlo');
    getAuctionBatchBids()
    console.log(pusherClient);
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-auction-bids-${auctionUniqueId}-batch-${batchUniqueId}`)
    })
  }, [])

  const getAuctionBatchBids = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL4 + `/auctions/app/view_auction_batch_bids/${auctionUniqueId}/batch/${batchUniqueId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${appUserToken}`
        },
      }
    )
    const data = await response.json()
    setBids(data.data.bids)
  }

  return (
    <>
      <h5>{statusMessage ? statusMessage : ''}</h5>
      <h5>People online: {onlineCount}</h5>
      <div style={{ display: "flex" }}>
        <br />
        {/* Bids */}
        <div style={{ padding: "25px", borderRightStyle: 'solid', borderRightColor: 'white', borderRightWidth: 2 }}>
          <h6> all App User Messages: </h6>
          <hr />
          {bids.map((bid, index) => {
            return <div key={index}>
              <p>id: {bid.id}</p>
              <p>uniqueId: {bid.uniqueId}</p>
              <p>Amount: {bid.bid_amount}</p>
              <p>Won: {bid.won}</p>
              <p>Created At: {bid.createdAt}</p>
              <hr />
            </div>
          })}
        </div>
      </div>
    </>
  )
}

export default App
