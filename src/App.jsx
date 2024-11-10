import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [connectionState, setConnectionState] = useState('not-connected')
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [messages, setMessages] = useState([])
  const [user, setUser] = useState()

  const appUser = 'usr_56913465891350'
  const professional = 'pro_hn9a8wdh89ahd'
  const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    channelAuthorization: {
      endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL + `${appUser}/${professional}`
    }
  });

  const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzcl81NjkxMzQ2NTg5MTM0MCIsIm5hbWUiOiJBZGFtIFNtaXRoMiIsInVzZXJuYW1lIjoiamhuc210aGJvaXMyIiwiZW1haWwiOiJtYWhpbi5jaG93ZGh1cnkuMTk5MUBnbWFpbC5jb20iLCJwaG9uZSI6Iis4ODAxNzYyMjE0MzE1Iiwid2hhdHNhcHBfbm8iOm51bGwsInZlcmlmaWVkIjp0cnVlLCJndWVzdCI6dHJ1ZSwiaWF0IjoxNzMxMjMxMjU3LCJleHAiOjE3MzM4MjMyNTd9.f9i82nigIRo1t3oBtdQSdQI-rgxtxWCcmCgAAKTDAYg"
  const connectionUniqueId = 'con_0B4PIHjbYn'

  useEffect(() => {
    console.log('henlo');
    getMessages()
    console.log(pusherClient);
    pusherBindEvents()
    return (() => {
      pusherClient.unsubscribe(`presence-pro-connection-chat-${connectionUniqueId}`)
    })
  }, [])

  const getMessages = async () => {
    const response = await fetch(import.meta.env.VITE_PUSHER_BASE_URL + `/professionals/get_connection_chat_messages/pro_hn9a8wdh89ahd`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authToken}`
        },
      }
    )
    const data = await response.json()
    setMessages(data.data.chat_messages)

    console.log('data', data, 'messages', messages);
  }

  const pusherBindEvents = async () => {
    console.log('bound');
    var channel = pusherClient.subscribe(`presence-pro-connection-chat-${connectionUniqueId}`);

    channel.bind("pusher:subscription_succeeded", (members) => {
      members.each((member) => {
        console.log(member)
      });
    });
    channel.bind("pusher:subscription_error", (data) => {
        console.log('subscription_error', data)
    });
    channel.bind("send-connection-message", (data) => {
      console.log('send-connection-message', data);
      setMessages(prevMessages => [...prevMessages, data])
      console.log('All messages', messages);
    });
  };

  const sendMessage = async () => {
    await fetch(import.meta.env.VITE_PUSHER_BASE_URL + `/professionals/send_message_to_professional/pro_hn9a8wdh89ahd`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`
      },
      body:JSON.stringify({ message: messageToBeSent })
    })

    setMessageToBeSent('')
    console.log('sent');
  }

  return (
    <>
      Connection State: {connectionState}
      <br />
      allMessages: {messages.map((msg, index) => {
        return <div key={index}>
          <p>{msg.message}</p>
        </div>
      })}
      <br />
      <input type="text" onChange={(e) => setMessageToBeSent(e.target.value)} value={messageToBeSent} />
      <br />
      <button type="button" onClick={sendMessage}>Click Me!</button>
    </>
  )
}

export default App
