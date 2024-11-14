import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [allMessages, setAllMessages] = useState([])
  const [membersList, setMembersList] = useState([])
  const [membersCount, setMembersCount] = useState(0)
  const [joinedMembersList, setJoinedMembersList] = useState([])
  const [joinedMembersCount, setJoinedMembersCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(null)

  const appUserId = 'usr_56913465891340'
  const appUserId2 = 'pro_hn9a8wdh89ahd'
  const appUserAuthToken1 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM0MCIsIm5hbWUiOiJBZGFtIFNtaXRoMiIsInVzZXJuYW1lIjoiamhuc210aGJvaXMyIiwiZW1haWwiOiJtYWhpbi5jaG93ZGh1cnkuMTk5MUBnbWFpbC5jb20iLCJwaG9uZSI6Iis4ODAxNzYyMjE0MzE1Iiwid2hhdHNhcHBfbm8iOm51bGwsInZlcmlmaWVkIjp0cnVlLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzMxMzAwNTA5LCJleHAiOjE3MzM4OTI1MDl9.8LJZhK5SlAj4MueEQzLl0WzyWwQHqQy4Wa_DIQMEofI"
  const appUserAuthToken2 = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6InBybzFAbWFpbC5jb20iLCJpZCI6ImFkbV9iaDdhc2RnNzg5YSIsInVzZXJUeXBlIjoiUFJPRkVTU0lPTkFMIiwiaWF0IjoxNzMxMzg2NTMxLCJleHAiOjE3MzM5Nzg1MzF9.PECQijHEfxXE1In0kdFDB8xPHmXF8rqz1hMkW1PlAto"
  const auctionUniqueId = 'auc_9ht13rj0ZX'
  const batchUniqueId = 'batch_og53f2AkcO'
  const urlParams = new URLSearchParams(window.location.search);
  const userNo = urlParams.get('userNo'); // 'FIRST'|'SECOND'
  console.log(userNo);
  const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    channelAuthorization: {
      endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL2 + `/authorize_group_chat_user/${userNo === 'FIRST' ? appUserId : appUserId2 }/auction/${auctionUniqueId}/batch/${batchUniqueId}`
    }
  });

  useEffect(() => {
    console.log('henlo');
    getTotalUsers()
    getAllMessages()
    console.log(pusherClient);
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-auction-live-chat-${auctionUniqueId}-batch-${batchUniqueId}`)
    })
  }, [])

  const pusherBindEvents = async () => {
    console.log('bound');
    var channel = pusherClient.subscribe(`presence-auction-live-chat-${auctionUniqueId}-batch-${batchUniqueId}`);

    channel.bind("pusher:subscription_succeeded", (members) => {
      console.log('all members details', members.count, members);
      setJoinedMembersCount(members.count)
      // LIST OF JOINED MEMBERS
      members.each((member) => {
        console.log('member', member)
      });
    });
    channel.bind("pusher:member_added", (member) => {
      setStatusMessage(`${member.info.username} has joined the chat`)
      setJoinedMembersList(prevMembers => [data, ...prevMembers])
    });
    channel.bind("pusher:member_removed", (member) => {
      setStatusMessage(`${member.info.username} has left the chat`)
      setJoinedMembersList(prevMembers => prevMembers.filter(prevMember => prevMember.id !== member.id))
    });
    channel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
    });
    channel.bind("send-aucbat-group-chat-message", (data) => {
      setAllMessages(prevMessages => [data, ...prevMessages])
    });
  };

  const getTotalUsers = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL2 + `/auctions/app/get_auction_batch_joined_users/${auctionUniqueId}/batch/${batchUniqueId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${userNo === 'FIRST' ? appUserAuthToken1 : appUserAuthToken2 }`
        },
      }
    )
    const data = await response.json()
    console.log(data)
    setMembersList(data.data.joined_members)
    setMembersCount(data.data.joined_members.length)
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
    console.log(data.data.group_chat_messages)
    setAllMessages(data.data.group_chat_messages)
  }

  // FOR APP USERS
  const sendMessage = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL2 + `/auctions/app/get_auction_batch_group_chat_messages/${auctionUniqueId}/batch/${batchUniqueId}`, {
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
      {/* <p>
        All Members List: {
          membersList.map((member, index) => {
            return <div key={index}>
              <p>id: {member.id}</p>
              <p>Name: {member.name}</p>
              <p>Username: {member.username}</p>
              <hr />
            </div>
          })
        }
      </p>
      <br />
      <p>
        Joined Members List: {
          joinedMembersList.map((joinedMember, index) => {
            return <div key={index}>
              <p>id: {joinedMember.id}</p>
              <p>Name: {joinedMember.name}</p>
              <p>Username: {joinedMember.username}</p>
              <hr />
            </div>
          })
        }
      </p> */}
      <br />
      <div style={{ display: "flex" }}>
        <br />
        {/* FOR APP USERS */}
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
      <button type="button" onClick={sendMessage}>Send Message To Pro</button>
    </>
  )
}

export default App
