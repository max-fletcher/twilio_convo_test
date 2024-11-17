import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [appUserMessages, setAppUserMessages] = useState([])
  const [proMessages, setProMessages] = useState([])
  const [proIsOnline, setProIsOnline] = useState(false)
  const [userIsOnline, setUserIsOnline] = useState(false)
  const [statusMessage, setStatusMessage] = useState(null)
  const [toProChannel, setToProChannel]=useState(null)
  const [toUserChannel, setToUserChannel]=useState(null)

  const appUserId = 'usr_56913465891340'
  const professionalId = 'pro_hn9a8wdh89ahd'
  // const usertype = 'APPUSER' // 'APPUSER'|'PROFESSIONAL'
  const urlParams = new URLSearchParams(window.location.search);
  const usertype = urlParams.get('usertype'); // 'APPUSER'|'PROFESSIONAL'
  const appUserAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM0MCIsIm5hbWUiOiJBZGFtIFNtaXRoMiIsInVzZXJuYW1lIjoiamhuc210aGJvaXMyIiwiZW1haWwiOiJtYWhpbi5jaG93ZGh1cnkuMTk5MUBnbWFpbC5jb20iLCJwaG9uZSI6Iis4ODAxNzYyMjE0MzE1Iiwid2hhdHNhcHBfbm8iOm51bGwsInZlcmlmaWVkIjp0cnVlLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzMxODM0NjYyLCJleHAiOjE3MzQ0MjY2NjJ9.mpPdVPah8UoHhuWWeQ23l_hmzzGmBDKXID-FECXzJPE"
  const proAuthToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6InBybzFAbWFpbC5jb20iLCJpZCI6ImFkbV9iaDdhc2RnNzg5YSIsInVzZXJUeXBlIjoiUFJPRkVTU0lPTkFMIiwiaWF0IjoxNzMxODM0NzExLCJleHAiOjE3MzQ0MjY3MTF9.RpxP44fNNb2n6wu2cIV_iuZmBz8EGCtD1cGziDU6le4"
  const connectionUniqueId = 'con_0B4PIHjbYn'

  useEffect(() => {
    const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      channelAuthorization: {
        endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL3 + `/${usertype}/${appUserId}/${professionalId}`
      }
    });

    const pusherBindEvents = async () => {
      console.log('bound');
      const toProChannel = pusherClient.subscribe(`presence-user-to-pro-chat-channel-${professionalId}`);
      setToProChannel(toProChannel)
      toProChannel.bind("pusher:subscription_succeeded", (members) => {
        console.log('pro channel all members details', members.count, members);
        if(members.count === 2)
          setProIsOnline(true)
        // LIST OF JOINED MEMBERS
        members.each((member) => {
          console.log('member', member)
        });
      });
      toProChannel.bind("pusher:member_added", (member) => {
        setStatusMessage(`${member.info.username} has joined the chat`)
        setProIsOnline(true)
      });
      toProChannel.bind("pusher:member_removed", (member) => {
        setStatusMessage(`${member.info.username} has left the chat`)
        setProIsOnline(false)
      });
      toProChannel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
      });
      toProChannel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
      });
      toProChannel.bind("client-send-message", (data) => {
        setAppUserMessages(prevMessages => [...prevMessages, data]) // FOR APP USERS
        setProMessages(prevMessages => [...prevMessages, data]) // FOR PROS
      });

      const userChannel = pusherClient.subscribe(`presence-user-to-pro-chat-channel-${appUserId}`);
      setToUserChannel(userChannel)
      toUserChannel.bind("pusher:subscription_succeeded", (members) => {
        console.log('user channel all members details', members.count, members);
        if(members.count === 2)
          setUserIsOnline(true)
        // LIST OF JOINED MEMBERS
        members.each((member) => {
          console.log('member', member)
        });
      });
      toUserChannel.bind("pusher:member_added", (member) => {
        setStatusMessage(`${member.info.username} has joined the chat`)
        setUserIsOnline(true)
      });
      toUserChannel.bind("pusher:member_removed", (member) => {
        setStatusMessage(`${member.info.username} has left the chat`)
        setUserIsOnline(false)
      });
      toUserChannel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
      });
      toUserChannel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
      });
      toUserChannel.bind("client-send-message", (data) => {
        setAppUserMessages(prevMessages => [...prevMessages, data]) // FOR APP USERS
        setProMessages(prevMessages => [...prevMessages, data]) // FOR PROS
      });
    };

    console.log('henlo');
    getMessagesForAppUser()
    getMessagesForPro()
    console.log(pusherClient);
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-user-to-pro-chat-channel-${professionalId}`)
      pusherClient.unsubscribe(`presence-user-to-pro-chat-channel-${appUserId}`)
    })
  }, [])

  // FOR APP USERS
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

  // FOR APP USERS
  const sendMessageToPro = async () => {
    toProChannel.trigger(`client-send-message-pro-chat-${professionalId}`, { sent_by_user: false, professional_id: professionalId, user_id: appUserId, message: messageToBeSent });
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

  // FOR PROS
  const sendMessageToAppUser = async () => {
    toProChannel.trigger(`client-send-message-pro-chat-${professionalId}`, { sent_by_user: false, professional_id: professionalId, user_id: appUserId, message: messageToBeSent });
    setMessageToBeSent('')
    console.log('sent');
  }

  return (
    <>
      <h5>{statusMessage ? statusMessage : ''}</h5>
      <h5>{proIsOnline ? 'Other person is online' : 'Other person is offline'}</h5>
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
