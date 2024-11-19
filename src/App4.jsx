import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [bids, setBids] = useState([])
  const [onlineCount, setOnlineCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(null)

  const auctionId = ""
  const batchId = ""
  const userId = ""

  useEffect(() => {
    const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      channelAuthorization: {
        endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL4 + `/batch/${batchId}/user/${userId}`
      }
    });

    const pusherBindEvents = async () => {
      console.log('bound');
      const channel = pusherClient.subscribe(`presence-auction-bids-${auctionId}-batch-${batchId}`);
      channel.trigger('client-trigger-event', { data: 'databoi1' });

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
        setBids(prevBids => [data, ...prevBids]) 
      });
    };

    console.log('henlo');
    getMessagesForPro()
    console.log(pusherClient);
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-auction-bids-${auctionId}-batch-${batchId}`)
    })
  }, [])

  const sendMessageToPro = async () => {
    await fetch(import.meta.env.VITE_PUSHER_BASE_URL + `/app/professionals/send_message_to_professional/` + professionalId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appUserAuthToken}`
      },
      body:JSON.stringify({ message: messageToBeSent })
    })
    setMessageToBeSent('')
    console.log('sent');
  }

  // FOR PROS
  const getMessagesForPro = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL + `/professionals/get_connection_chat_messages_as_admin/` + appUserId, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${proAuthToken}`
        },
      }
    )
    const data = await response.json()
    setProMessages(data.data.chat_messages)
  }

  // FOR PROS
  const sendMessageToAppUser = async () => {
    await fetch(import.meta.env.VITE_PUSHER_BASE_URL + `/professionals/send_message_to_app_user/` + appUserId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${proAuthToken}`
      },
      body:JSON.stringify({ message: messageToBeSent })
    })
    setMessageToBeSent('')
    console.log('sent');
  }

  return (
    <>
      <h5>{statusMessage ? statusMessage : ''}</h5>
      <h5>{otherPersonIsOnline ? 'Other person is online' : 'Other person is offline'}</h5>
      <div style={{ display: "flex" }}>
        <br />
        {/* FOR APP USERS */}
        <div style={{ padding: "25px", borderRightStyle: 'solid', borderRightColor: 'white', borderRightWidth: 2 }}>
          <h6> all App User Messages: </h6>
          {bids.map((bid, index) => {
            return <div key={index}>
              <p>{bid.bid_amount}</p>
              <p>{bid.bid_amount}</p>
            </div>
          })}
        </div>
      </div>
      <br />
      <br />
      {usertype === "PROFESSIONAL" && <button type="button" onClick={sendMessageToAppUser}>Send Message To User</button>}
      <br />
      <br />
      {<button type="button" onClick={triggerEvent}>Trigger Event</button>}
    </>
  )
}

export default App
