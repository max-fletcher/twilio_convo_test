import { useEffect, useState } from 'react'
import Pusher from 'pusher-js';
const pusher = new Pusher(import.meta.env.VITE_PUSHER_APP_KEY, {
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
});

function App() {
  const [connectionState, setConnectionState] = useState('not-connected')
  const [messageToBeSent, setMessageToBeSent] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    console.log('henlo');
    console.log(pusher);
    initConversations()
  }, [])

  const initConversations = async () => {
    var channel = pusher.subscribe("my-channel");
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
