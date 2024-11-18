import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [currentUser, setCurrentUser] = useState({})
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [allMessages, setAllMessages] = useState([])
  const [membersCount, setMembersCount] = useState(0)
  const [joinedMembersCount, setJoinedMembersCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(null)

  const appUserId = 'usr_56913465891340'
  const appUserId2 = 'usr_56913465891350'
  const appUserAuthToken1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM0MCIsIm5hbWUiOiJBZGFtIFNtaXRoMiIsInVzZXJuYW1lIjoiamhuc210aGJvaXMyIiwiZW1haWwiOiJtYWhpbi5jaG93ZGh1cnkuMTk5MUBnbWFpbC5jb20iLCJwaG9uZSI6Iis4ODAxNzYyMjE0MzE1Iiwid2hhdHNhcHBfbm8iOm51bGwsInZlcmlmaWVkIjp0cnVlLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzMxODE3NTAwLCJleHAiOjE3MzQ0MDk1MDB9.wIfnxyNE4XJgNt4SgSGIH3qDbOZ-zhsSJFMwOAs964c"
  const appUserAuthToken2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM1MCIsIm5hbWUiOm51bGwsInVzZXJuYW1lIjoiVXNlciAyIiwiZW1haWwiOiJ1c2VyMkBtYWlsLmNvbSIsInBob25lIjoiMjM0NTY3ODkiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0IjpmYWxzZSwiaWF0IjoxNzMxODE4ODE2LCJleHAiOjE3MzQ0MTA4MTZ9.6uOdm6Ex8F_S-6AGERUuQRNURm-lTKO0AjP9xBEemeI"
  const auctionUniqueId = 'auc_Q9lZki2dR9'
  const batchUniqueId = 'batch_SUxBw5neCi'
  const urlParams = new URLSearchParams(window.location.search);
  const userNo = urlParams.get('userNo'); // 'FIRST'|'SECOND'

  useEffect(() => {
    const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      channelAuthorization: {
        endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL2 + `/authorize_group_chat_user/${userNo === 'FIRST' ? appUserId : appUserId2 }/auction/${auctionUniqueId}/batch/${batchUniqueId}`
      }
    });

    const pusherBindEvents = async () => {
      var channel = pusherClient.subscribe(`presence-auction-live-chat-${auctionUniqueId}-batch-${batchUniqueId}`);
  
      channel.bind("pusher:subscription_succeeded", (members) => {
        
        var thisUser = channel.members.me;
        setCurrentUser({ id: thisUser.id, ...thisUser.info })
  
        // console.log('all members details', members.count, members);
        setJoinedMembersCount(members.count)
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
      channel.bind("send-aucbat-group-chat-message", (data) => {
        setAllMessages(prevMessages => [...prevMessages, data])
      });
    };

    console.log('henlo');
    getTotalUsers()
    getAllMessages()
    console.log(pusherClient);
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-auction-live-chat-${auctionUniqueId}-batch-${batchUniqueId}`)
    })
  }, [])

  const getTotalUsers = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL2 + `/auctions/app/get_auction_batch_joined_users/${auctionUniqueId}/batch/${batchUniqueId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
        },
      }
    )
    const data = await response.json()
    setMembersCount(data.data.joined_users_count)
  }

  const getAllMessages = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL2 + `/auctions/app/get_auction_batch_group_chat_messages/${auctionUniqueId}/batch/${batchUniqueId}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
        },
      }
    )
    const data = await response.json()
    console.log('all group chat messages', data.data.group_chat_messages)
    setAllMessages(data.data.group_chat_messages)
  }

  // FOR APP USERS
  const sendMessage = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL2 + `/auctions/app/send_message_to_group_chat/${auctionUniqueId}/batch/${batchUniqueId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
      },
      body:JSON.stringify({ message: messageToBeSent })
    })
    setMessageToBeSent('')
    console.log('sent');
  }

  return (
    <>
      <h5>{statusMessage ? statusMessage : ''}</h5>
      <p>{joinedMembersCount}/{membersCount}</p>
      <br />
      <p>
        CurrentUser: 
        Id: { currentUser.id } <br />
        Name: { currentUser.name } <br />
        Username: { currentUser.username } <br />
      </p>
      <br />
      <div>
        <br />
        {/* FOR APP USER 1 */}
        <div style={{ padding: "25px", borderRightStyle: 'solid', borderRightColor: 'white', borderRightWidth: 2 }}>
          <h6> All Messages: </h6>
          {allMessages.map((msg, index) => {
            return <div key={index}>
              <p>{msg.message}</p>
            </div>
          })}
        </div>
      </div>
      <br />
      <input type="text" onChange={(e) => setMessageToBeSent(e.target.value)} value={messageToBeSent} />
      <br />
      <br />
      <button type="button" onClick={sendMessage}>Send Message</button>
    </>
  )
}

export default App
