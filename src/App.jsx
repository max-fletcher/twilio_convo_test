import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [appUserMessages, setAppUserMessages] = useState([])
  const [proMessages, setProMessages] = useState([])
  const [otherPersonIsOnline, setOtherPersonIsOnline] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)

  const appUserId = 'usr_56913465891350'
  const professionalId = 'pro_jadjha98w'
  // const usertype = 'APPUSER' // 'APPUSER'|'PROFESSIONAL'
  const urlParams = new URLSearchParams(window.location.search);
  const usertype = urlParams.get('usertype'); // 'APPUSER'|'PROFESSIONAL'
  const appUserAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM1MCIsIm5hbWUiOm51bGwsInVzZXJuYW1lIjoiVXNlciAyIiwiZW1haWwiOiJ1c2VyMkBtYWlsLmNvbSIsInBob25lIjoiMjM0NTY3ODkiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0IjpmYWxzZSwiaWF0IjoxNzMxNjgwNjkzLCJleHAiOjE3MzQyNzI2OTN9.nfJHk36vdGZOB7p5A_avgn_RXzA7Nr-J582l1idBbu4"
  const proAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6InBybzFAZXhhbXBsZS5jb20iLCJpZCI6IjMiLCJ1c2VyVHlwZSI6IlBST0ZFU1NJT05BTCIsImlhdCI6MTczMTc0MzQwNywiZXhwIjoxNzM0MzM1NDA3fQ.IF4udDDo1zdYpSF8s96_oqu6VXo7o4L5QHjk97uoDOg"
  const connectionUniqueId = 'con_FVXF7WP9ub'
  const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    channelAuthorization: {
      endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL + `/${usertype}/${appUserId}/${professionalId}`
    }
  });

  useEffect(() => {
    console.log('henlo');
    getMessagesForAppUser()
    getMessagesForPro()
    console.log(pusherClient);
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-pro-connection-chat-${connectionUniqueId}`)
    })
  }, [])

  const pusherBindEvents = async () => {
    console.log('bound');
    var channel = pusherClient.subscribe(`presence-pro-connection-chat-${connectionUniqueId}`);

    channel.bind("pusher:subscription_succeeded", (members) => {
      console.log('all members details', members.count, members);
      if(members.count === 2)
        setOtherPersonIsOnline(true)
      // LIST OF JOINED MEMBERS
      members.each((member) => {
        console.log('member', member)
      });
    });
    channel.bind("pusher:member_added", (member) => {
      setStatusMessage(`${member.info.username} has joined the chat`)
      setOtherPersonIsOnline(true)
    });
    channel.bind("pusher:member_removed", (member) => {
      setStatusMessage(`${member.info.username} has left the chat`)
      setOtherPersonIsOnline(false)
    });
    channel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
    });
    channel.bind("send-connection-message", (data) => {
      setAppUserMessages(prevMessages => [...prevMessages, data]) // FOR APP USERS
      setProMessages(prevMessages => [...prevMessages, data]) // FOR PROS
    })
  };

  // FOR APP USERS
  const getMessagesForAppUser = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL + `/app/professionals/get_connection_chat_messages_as_user/` + professionalId, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${appUserAuthToken}`
        },
      }
    )
    const data = await response.json()
    setAppUserMessages(data.data.chat_messages)
  }

  // FOR APP USERS
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
