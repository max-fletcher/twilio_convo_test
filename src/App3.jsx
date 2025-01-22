import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

// PROFESSIONAL CHAT MULTIPLE CHANNEL AND APP USER GLOBAL NOTIFICATIONS TEST
function App() {
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [appUserMessages, setAppUserMessages] = useState([])
  const [proMessages, setProMessages] = useState([])
  const [statusMessage, setStatusMessage] = useState(null)

  const appUserId = 'usr_oYDD5QBEjF'
  const professionalId = 'pro_bhndasrg673f'
  // const usertype = 'APPUSER' // 'APPUSER'|'PROFESSIONAL'
  const urlParams = new URLSearchParams(window.location.search);
  const usertype = urlParams.get('usertype'); // 'APPUSER'|'PROFESSIONAL'
  const appUserAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl9vWURENVFCRWpGIiwibmFtZSI6ImJvbmUiLCJ1c2VybmFtZSI6ImZsZXRjaGVyIiwiZW1haWwiOm51bGwsInBob25lIjoiKzg4MDE3NjIyMTQzMTUiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0IjpmYWxzZSwiaWF0IjoxNzM3NTI2MDY3LCJleHAiOjE3NDAxMTgwNjd9.1xXyXW8SpU_m9zvsupbWKEeim4qlBFZJUXk_dlMTY9k"
  const proAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6InNvbWV1c2VyQGdtYWlsLmNvbSIsImlkIjoiYWRtX0kxZFliZmV5YXciLCJ1c2VyVHlwZSI6IlBST0ZFU1NJT05BTCIsInByb2Zlc3Npb25hbElkIjoicHJvX2JobmRhc3JnNjczZiIsImlhdCI6MTczNzUzNDA4MSwiZXhwIjoxNzQwMTI2MDgxfQ.EVNfJ6pRdEYj_kYE_YXpTGiRY4UVKUIAdGG4_mr7UZA"

  useEffect(() => {
    const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      channelAuthorization: {
        endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL3 + `/${usertype === 'PROFESSIONAL' ? professionalId : appUserId}`
      }
    });

    const pusherBindEvents = async () => {
      if(usertype === "APPUSER"){
        // FOR APP USER
        const userChannel = pusherClient.subscribe(`presence-user-chat-listener-${appUserId}`);
        userChannel.bind("pusher:subscription_succeeded", (members) => {
          console.log('user channel all members details', members.count, members);
          // LIST OF JOINED MEMBERS
          members.each((member) => {
            console.log('member', member)
          });
        });
        userChannel.bind("pusher:member_added", (member) => {
          setStatusMessage(`${member.info.username} has joined the chat`)
        });
        userChannel.bind("pusher:member_removed", (member) => {
          setStatusMessage(`${member.info.username} has left the chat`)
        });
        userChannel.bind("pusher:subscription_error", (data) => {
          console.log('subscription_error', data)
        });
        userChannel.bind(`send-message-to-user-chat`, (data) => {
          console.log('send-message-to-user-chat', data);
          setAppUserMessages(prevMessages => [...prevMessages, data]) // FOR APP USERS
          // setProMessages(prevMessages => [...prevMessages, data]) // FOR PROS
        });

        getMessagesForAppUser()


        // FOR GLOBAL NOTIFICATIONS FOR APP USERS
        const userNotificatonChannel = pusherClient.subscribe(`user-notification-${appUserId}`);
        userNotificatonChannel.bind("pusher:subscription_succeeded", (members) => {
          console.log('user channel all members details', members.count, members);
          // LIST OF JOINED MEMBERS
          // members.each((member) => {
          //   console.log('member', member)
          // });
        });
        userNotificatonChannel.bind("pusher:member_added", (member) => {
          setStatusMessage(`${member.info.username} has joined the chat`)
        });
        userNotificatonChannel.bind("pusher:member_removed", (member) => {
          setStatusMessage(`${member.info.username} has left the chat`)
        });
        userNotificatonChannel.bind("pusher:subscription_error", (data) => {
          console.log('subscription_error', data)
        });
        userNotificatonChannel.bind(`receive-notification`, (data) => {
          console.log('receive-notification', data);
        });

        console.log('userNotificatonChannel', userNotificatonChannel)
      }

      if(usertype === "PROFESSIONAL"){
        // FOR PRO
        const proChannel = pusherClient.subscribe(`presence-pro-chat-listener-${professionalId}`);
        proChannel.bind("pusher:subscription_succeeded", (members) => {
          console.log('pro channel all members details', members.count, members);
          // LIST OF JOINED MEMBERS
          members.each((member) => {
            console.log('member', member)
          });
        });
        proChannel.bind("pusher:member_added", (member) => {
          setStatusMessage(`${member.info.username} has joined the chat`)
        });
        proChannel.bind("pusher:member_removed", (member) => {
          setStatusMessage(`${member.info.username} has left the chat`)
        });
        proChannel.bind("pusher:subscription_error", (data) => {
          console.log('subscription_error', data)
        });
        proChannel.bind(`send-message-to-pro-chat`, (data) => {
          console.log('send-message-to-pro-chat', data);
          // setAppUserMessages(prevMessages => [...prevMessages, data]) // FOR APP USERS
          setProMessages(prevMessages => [...prevMessages, data]) // FOR PROS
        });

        getMessagesForPro()
      }
    };

    console.log('bindings set');
    console.log(pusherClient)
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-pro-chat-listener-${professionalId}`)
      pusherClient.unsubscribe(`presence-user-chat-listener-${appUserId}`)
    })
  }, [])

  // FOR APP USER
  const getMessagesForAppUser = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL3 + `/app/professionals/get_connection_chat_messages_as_user/` + professionalId, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${appUserAuthToken}`
        },
      }
    )
    const data = await response.json()
    setAppUserMessages(data.data.chat_messages)
  }

  const sendMessageToPro = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL + `/app/professionals/send_message_to_professional/v2/` + professionalId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${appUserAuthToken}`
      },
      body:JSON.stringify({ message: messageToBeSent })
    })
    const data = await response.json()
    const newMessageObject = {
      createdAt: new Date().toISOString(),
      message: messageToBeSent,
      sent_by_user: true,
    }
    setAppUserMessages(prevMessages => [...prevMessages, newMessageObject])
    setMessageToBeSent('')
    console.log('sent');
  }

  // FOR PROS
  const getMessagesForPro = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL3 + `/professionals/get_connection_chat_messages_as_admin/` + appUserId, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${proAuthToken}`
        },
      }
    )
    const data = await response.json()
    setProMessages(data.data.chat_messages)
  }

  const sendMessageToAppUser = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL3 + `/professionals/send_message_to_app_user/v2/` + appUserId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${proAuthToken}`
      },
      body:JSON.stringify({ message: messageToBeSent })
    })
    const data = await response.json()
    const newMessageObject = {
      createdAt: new Date().toISOString(),
      message: messageToBeSent,
      sent_by_user: false,
    }
    setProMessages(prevMessages => [...prevMessages, newMessageObject])
    setMessageToBeSent('')
    console.log('sent');
  }

  return (
    <>
      <h5>{statusMessage ? statusMessage : ''}</h5>
      <div style={{ display: "flex" }}>
        <br />
        {/* FOR APP USERS */}
        <div style={{ padding: "25px", borderRightStyle: 'solid', borderRightColor: 'white', borderRightWidth: 2 }}>
          <h6> all App User Messages: </h6>
          {appUserMessages.map((msg, index) => {
            return <div key={index}>
              <p>{msg.message}</p>
            </div>
          })}
        </div>
        {/* FOR PROS */}
        <div style={{ padding: "25px" }}>
          <h6> all Pro Messages: </h6>
          {proMessages.map((msg, index) => {
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
      {usertype === "APPUSER" && <button type="button" onClick={sendMessageToPro}>Send Message To Pro</button>}
      <br />
      <br />
      {usertype === "PROFESSIONAL" && <button type="button" onClick={sendMessageToAppUser}>Send Message To User</button>}
    </>
  )
}

export default App
