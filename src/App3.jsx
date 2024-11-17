import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [appUserMessages, setAppUserMessages] = useState([])
  const [proMessages, setProMessages] = useState([])
  const [proIsOnline, setProIsOnline] = useState(false)
  const [userIsOnline, setUserIsOnline] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)
  const [proChannel, setProChannel]=useState(null)
  const [userChannel, setUserChannel]=useState(null)

  const appUserId = 'usr_56913465891340'
  const professionalId = 'pro_jadjha98w'
  // const usertype = 'APPUSER' // 'APPUSER'|'PROFESSIONAL'
  const urlParams = new URLSearchParams(window.location.search);
  const usertype = urlParams.get('usertype'); // 'APPUSER'|'PROFESSIONAL'
  const appUserAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM0MCIsIm5hbWUiOm51bGwsInVzZXJuYW1lIjoiZmxldGNoZXIiLCJlbWFpbCI6Im1haGluLmNob3dkaHVyeS4xOTkxQGdtYWlsLmNvbSIsInBob25lIjoiKzg4MDE3NjIyMTQzMTUiLCJ3aGF0c2FwcF9ubyI6bnVsbCwidmVyaWZpZWQiOnRydWUsImd1ZXN0Ijp0cnVlLCJpYXQiOjE3MzE4NjAzOTksImV4cCI6MTczNDQ1MjM5OX0.fnfu3E3g5W2Zdyj4ge1N7Vo0E9DqE7Wvf8vEVapVGWI"
  const proAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6InBybzFAZXhhbXBsZS5jb20iLCJpZCI6IjMiLCJ1c2VyVHlwZSI6IlBST0ZFU1NJT05BTCIsImlhdCI6MTczMTg2MDM4NCwiZXhwIjoxNzM0NDUyMzg0fQ.697R3Ia1_wjmLa8LSIDIj7agYz-gsrpC3qP6JnXO9A4"

  useEffect(() => {
    const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      channelAuthorization: {
        endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL3 + `/${professionalId}`
      }
    });

    const pusherBindEvents = async () => {
      // FOR APP USER
      const userChannel = pusherClient.subscribe(`presence-for-pro-chat-channel-${professionalId}`);
      userChannel.bind("pusher:subscription_succeeded", (members) => {
        console.log('pro channel all members details', members.count, members);
        if(members.count === 2)
          setProIsOnline(true)
        // LIST OF JOINED MEMBERS
        members.each((member) => {
          console.log('member', member)
        });
      });
      userChannel.bind("pusher:member_added", (member) => {
        setStatusMessage(`${member.info.username} has joined the chat`)
        setProIsOnline(true)
      });
      userChannel.bind("pusher:member_removed", (member) => {
        setStatusMessage(`${member.info.username} has left the chat`)
        setProIsOnline(false)
      });
      userChannel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
      });
      userChannel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
      });
      userChannel.bind(`client-send-message-user-chat-${appUserId}`, (data) => {
        setAppUserMessages(prevMessages => [...prevMessages, data]) // FOR APP USERS
        setProMessages(prevMessages => [...prevMessages, data]) // FOR PROS
      });
      setUserChannel(userChannel)
      getMessagesForAppUser()

      // FOR PRO
      const proChannel = pusherClient.subscribe(`presence-for-user-chat-channel-${appUserId}`);
      proChannel.bind("pusher:subscription_succeeded", (members) => {
        console.log('user channel all members details', members.count, members);
        if(members.count === 2)
          setUserIsOnline(true)
        // LIST OF JOINED MEMBERS
        members.each((member) => {
          console.log('member', member)
        });
      });
      proChannel.bind("pusher:member_added", (member) => {
        setStatusMessage(`${member.info.username} has joined the chat`)
        setUserIsOnline(true)
      });
      proChannel.bind("pusher:member_removed", (member) => {
        setStatusMessage(`${member.info.username} has left the chat`)
        setUserIsOnline(false)
      });
      proChannel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
      });
      proChannel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
      });
      proChannel.bind(`client-send-message-pro-chat-${professionalId}`, (data) => {
        setAppUserMessages(prevMessages => [...prevMessages, data]) // FOR APP USERS
        setProMessages(prevMessages => [...prevMessages, data]) // FOR PROS
      });
      setProChannel(proChannel)
      getMessagesForPro()
    };

    console.log('bound');
    console.log(pusherClient)
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-for-pro-chat-channel-${professionalId}`)
      pusherClient.unsubscribe(`presence-for-user-chat-channel-${appUserId}`)
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
    userChannel.trigger(`client-send-message-pro-chat-${professionalId}`, { sent_by_user: true, professional_id: professionalId, user_id: appUserId, message: messageToBeSent })
    setMessageToBeSent('')
    console.log('sent')
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
    proChannel.trigger(`client-send-message-user-chat-${appUserId}`, { sent_by_user: false, professional_id: professionalId, user_id: appUserId, message: messageToBeSent })
    setMessageToBeSent('')
    console.log('sent')
  }

  return (
    <>
      <h5>{statusMessage ? statusMessage : ''}</h5>
      <h5>{proIsOnline ? 'Professional is online' : 'Professional is offline'}</h5>
      <h5>{userIsOnline ? 'APp user is online' : 'APp user is offline'}</h5>
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
