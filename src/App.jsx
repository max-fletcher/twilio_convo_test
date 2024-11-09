import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';

function App() {
  const [connectionState, setConnectionState] = useState('not-connected')
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [messages, setMessages] = useState([])
  const [user, setUser] = useState()

  const randomUser = Math.random().toString(20).substring(2,8)
  const randomOtherUser = Math.random().toString(20).substring(2,8)
  const pusherClient = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    channelAuthorization: {
      endpoint: import.meta.env.VITE_PUSHER_AUTH_BASE_URL + `/${randomUser}/${randomOtherUser}`
    }
  });

  useEffect(() => {
    console.log('henlo');
    console.log(pusherClient);
    pusherBindEvents()
  }, [])

  const pusherBindEvents = async () => {
    var channel = pusherClient.subscribe("presence-my-channel");
    channel.bind("my-event", (data) => {
      console.log(data);
    });
  };

  const sendMessage = () => {
    setMessageToBeSent('')
    console.log('sent');
  }

  return (
    <>
      Connection State: {connectionState}
      <br />
      allMessages: {messages}
      <br />
      <input type="text" onChange={(e) => setMessageToBeSent(e.target.value)} value={messageToBeSent} />
      <br />
      <button type="button" onClick={sendMessage}>Click Me!</button>
    </>
  )
}

export default App
